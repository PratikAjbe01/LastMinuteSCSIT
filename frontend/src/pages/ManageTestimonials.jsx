"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Shield,
  Loader,
  Info,
  Check,
  X,
  Filter,
  ChevronDown,
  Search,
  Crown,
  User,
  MessageCircle,
  Calendar,
  AlertCircle,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Star,
  BookOpen,
  PlusCircle,
  UploadCloud,
  Link,
  Briefcase,
  FileText,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../utils/urls";
import { useContext } from "react";
import { ValuesContext } from "../context/ValuesContext";
import { useSwipeable } from "react-swipeable";

const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

const FilterDropdown = ({
  options,
  value,
  onChange,
  allLabel,
  icon: Icon,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  useOnClickOutside(ref, () => setIsOpen(false));
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel =
    value === "all" ? allLabel : selectedOption?.label || allLabel;

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-2 text-white transition-all duration-200 ${disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          }`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={16} />}
          <span className="truncate text-sm capitalize">{displayLabel}</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-30 mt-2 w-56 origin-top-left rounded-xl border border-gray-700 bg-gray-900/90 shadow-lg backdrop-blur-lg"
          >
            <ul className="max-h-60 overflow-y-auto p-1">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange("all");
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-white hover:bg-green-500/10"
                >
                  All
                </button>
              </li>
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 truncate rounded-lg px-4 py-2 text-left capitalize text-white hover:bg-green-500/10"
                  >
                    {opt.icon && <opt.icon size={16} />} {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ManageTestimonials = () => {
  const { user } = useAuthStore();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploaderFilter, setUploaderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorProfession, setAuthorProfession] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [profileInputType, setProfileInputType] = useState("link");
  const [profileLink, setProfileLink] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [profileUploadUrl, setProfileUploadUrl] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isViewModalOpen || isConfirmModalOpen || isDeleteModalOpen || isUploadModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isDeleteModalOpen, isConfirmModalOpen, isViewModalOpen, isUploadModalOpen]);

  const creatorEmails = useMemo(
    () => new Set(["bdhakad886@gmail.com", "pratikajbe40@gmail.com"]),
    [],
  );
  const isCreator = useMemo(
    () => user && creatorEmails.has(user.email),
    [user, creatorEmails],
  );

  const fetchTestimonials = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/api/testimonials/getalltestimonialswithuserinfo`,
        { headers: { Authorization: `Bearer ${user._id}` } },
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to fetch testimonials.",
        );
      const result = await response.json();
      setTestimonials(
        Array.isArray(result.testimonials) ? result.testimonials : [],
      );
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      toast.error("Failed to fetch testimonials. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) fetchTestimonials();
    else setLoading(false);
  }, [user?._id, fetchTestimonials]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredTestimonials = useMemo(() => {
    let tempTestimonials = [...testimonials];
    if (debouncedSearchQuery) {
      tempTestimonials = tempTestimonials.filter(
        (t) =>
          t.message
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          (t.user?.name &&
            t.user.name
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())),
      );
    }
    if (statusFilter === "Approved") {
      tempTestimonials = tempTestimonials.filter((t) => t.show === "yes");
    } else if (statusFilter === "Pending") {
      tempTestimonials = tempTestimonials.filter((t) => t.show !== "yes");
    }
    if (uploaderFilter !== "all") {
      tempTestimonials = tempTestimonials.filter(
        (t) => t.user?._id === uploaderFilter,
      );
    }
    return tempTestimonials.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "a-z":
          return (a.user?.name || "").localeCompare(b.user?.name || "");
        case "z-a":
          return (b.user?.name || "").localeCompare(a.user?.name || "");
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [
    debouncedSearchQuery,
    statusFilter,
    uploaderFilter,
    sortBy,
    testimonials,
  ]);

  const { stats, uniqueUploaders } = useMemo(() => {
    const uploaderMap = new Map();
    testimonials.forEach((item) => {
      if (item.user?._id) uploaderMap.set(item.user._id, item.user);
    });
    return {
      stats: {
        total: testimonials.length,
        approved: testimonials.filter((t) => t.show === "yes").length,
        pending: testimonials.filter((t) => t.show !== "yes").length,
        uploaders: uploaderMap.size,
      },
      uniqueUploaders: Array.from(uploaderMap.values()).map((u) => ({
        value: u._id,
        label: u.name,
      })),
    };
  }, [testimonials]);

  const openModal = (modalType, testimonial) => {
    if (!isCreator) {
      toast.error("Only creators can perform this action.");
      return;
    }
    setSelectedTestimonial(testimonial);
    if (modalType === "view") setIsViewModalOpen(true);
    if (modalType === "confirm") setIsConfirmModalOpen(true);
    if (modalType === "delete") setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setSelectedTestimonial(null);
    setIsViewModalOpen(false);
    setIsConfirmModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const closeUploadModal = () => {
    if (isSubmittingReview) return;
    setIsUploadModalOpen(false);
    setFeedback("");
    setRating("");
    setAuthorName("");
    setAuthorEmail("");
    setAuthorProfession("");
    setIsImportant(false);
    setProfileInputType("link");
    setProfileLink("");
    setProfileFile(null);
  };

  const performShowUpdate = async () => {
    if (!isCreator || !selectedTestimonial) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Updating status...");
    try {
      const response = await fetch(
        `${API_URL}/api/testimonials/togglshowtestimonial`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user._id}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedTestimonial._id,
            show: selectedTestimonial.show === "yes" ? "no" : "yes",
          }),
        },
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to update status.",
        );
      toast.success("Status updated!", { id: toastId });
      fetchTestimonials();
      closeModal();
    } catch (err) {
      toast.error(err.message || "Failed to update status.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const performDelete = async () => {
    if (!isCreator || !selectedTestimonial) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Deleting testimonial...");
    try {
      const response = await fetch(
        `${API_URL}/api/testimonials/deletetestimonial/${selectedTestimonial._id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${user._id}` } },
      );
      if (!response.ok)
        throw new Error((await response.json()).message || "Failed to delete.");
      toast.success("Testimonial deleted!", { id: toastId });
      fetchTestimonials();
      closeModal();
    } catch (err) {
      toast.error(err.message || "Failed to delete.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isCreator) return;
    if (!feedback.trim() || !authorName.trim() || !authorEmail.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmittingReview(true);
    const toastId = toast.loading("Submitting testimonial...");

    try {
      let userProfileUrl = null;

      if (profileInputType === "link" && profileLink) {
        userProfileUrl = profileLink;
      } else if (profileInputType === "upload" && profileFile) {
        toast.loading("Uploading profile image...", { id: toastId });
        const cloudName = "dbf1lifdi";
        const uploadPreset = "frontend_uploads";
        const cloudFormData = new FormData();
        cloudFormData.append("file", profileFile);
        cloudFormData.append("upload_preset", uploadPreset);
        cloudFormData.append("folder", "user_profiles");

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          { method: "POST", body: cloudFormData },
        );

        if (!cloudRes.ok)
          throw new Error((await cloudRes.json()).error.message);
        const cloudData = await cloudRes.json();
        userProfileUrl = cloudData.secure_url || cloudData.url || "";
        setProfileUploadUrl(cloudData.secure_url || cloudData.url || "");
      }

      const response = await fetch(
        `${API_URL}/api/testimonials/uploadtestimonial`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: feedback,
            rating,
            userId: user._id,
            username: authorName,
            userEmail: authorEmail,
            course: authorProfession,
            isUserAdmin: isImportant,
            userProfile:
              profileInputType === "link"
                ? profileLink
                : profileUploadUrl || userProfileUrl,
          }),
        },
      );

      if (!response.ok) throw new Error((await response.json()).message);

      toast.success("Testimonial submitted successfully!", { id: toastId });
      fetchTestimonials();
      closeUploadModal();
    } catch (error) {
      toast.error(error.message || "Submission failed.", { id: toastId });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setUploaderFilter("all");
    setSortBy("newest");
  };

  const { setIsSidebarOpen } = useContext(ValuesContext);

  const isExcludedRoute =
    location.pathname.startsWith("/login") || location.pathname === "/signup";
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !isExcludedRoute) {
        setIsSidebarOpen(true);
      }
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 30,
  });

  const isAnyFilterActive =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    uploaderFilter !== "all" ||
    sortBy !== "newest";
  const statusOptions = [
    { value: "Approved", label: "Approved", icon: CheckCircle },
    { value: "Pending", label: "Pending", icon: Clock },
  ];
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "a-z", label: "Name (A-Z)" },
    { value: "z-a", label: "Name (Z-A)" },
  ];

  if (loading && !testimonials.length) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-900">
        <Loader className="h-12 w-12 animate-spin text-green-400" />
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-900 p-4">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-3xl font-bold text-white">Access Denied</h1>
          <p className="mt-2 text-lg text-gray-400">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="fixed top-1/2 -translate-y-1/2 right-2 md:right-4 z-10 pointer-events-none">
        <div className="flex flex-col items-center rounded-full border border-amber-400/30 bg-black/30 backdrop-blur-lg px-1.5 py-4 md:px-2 md:py-5">
          <Crown className="h-5 w-5 text-amber-400 md:h-6 md:w-6 mb-2" />
          {"CREATORS".split("").map((char, index) => (
            <span
              key={index}
              className="font-mono text-xs font-bold uppercase text-amber-300/80 md:text-xl"
            >
              {char}
            </span>
          ))}
        </div>
      </div>
      <div
        {...swipeHandlers}
        className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-24 pb-12 sm:px-14 lg:px-8 bg-gradient-to-br from-gray-900 via-slate-900 to-black"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Helmet>
            <title>Admin - Manage Testimonials</title>
            <meta
              name="description"
              content="Review, approve, and feature student feedback."
            />
          </Helmet>
          <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-slate-900 to-black" />
          <div className="relative z-10 mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Manage Testimonials
                </span>
              </h1>
              <p className="mt-2 text-lg text-gray-400">
                Review, approve, and feature student feedback.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-xl"
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="flex flex-col items-center justify-center rounded-xl border border-cyan-700/30 bg-cyan-600/10 p-4 text-center transition-transform duration-300 hover:-translate-y-1">
                  <MessageCircle className="mb-2 h-6 w-6 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-cyan-300">Total</h3>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl border border-green-700/30 bg-green-600/10 p-4 text-center transition-transform duration-300 hover:-translate-y-1">
                  <CheckCircle className="mb-2 h-6 w-6 text-green-400" />
                  <h3 className="text-sm font-semibold text-green-300">
                    Approved
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {stats.approved}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl border border-orange-700/30 bg-orange-600/10 p-4 text-center transition-transform duration-300 hover:-translate-y-1">
                  <Clock className="mb-2 h-6 w-6 text-orange-400" />
                  <h3 className="text-sm font-semibold text-orange-300">
                    Pending
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {stats.pending}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl border border-purple-700/30 bg-purple-600/10 p-4 text-center transition-transform duration-300 hover:-translate-y-1">
                  <User className="mb-2 h-6 w-6 text-purple-400" />
                  <h3 className="text-sm font-semibold text-purple-300">
                    Uploaders
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {stats.uploaders}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="group col-span-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal-700/50 bg-teal-900/10 p-4 text-center transition-all duration-300 hover:border-teal-500 hover:bg-teal-900/20 hover:-translate-y-1 md:col-span-1"
                >
                  <PlusCircle className="h-8 w-8 text-teal-500 transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="mt-2 text-sm font-semibold text-teal-300">
                    Add New
                  </h3>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative z-20 mb-8 flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-800/50 p-4 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative w-full lg:flex-grow">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or message..."
                    className="w-full rounded-xl border border-gray-600 bg-gray-700/50 py-2 pl-12 pr-4 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                {isAnyFilterActive && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-red-600 bg-red-700/50 px-4 py-2 text-white transition-all duration-200 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    <RotateCcw size={16} />
                    <span className="text-sm">Reset</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FilterDropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allLabel="All Statuses"
                  icon={Filter}
                />
                <FilterDropdown
                  options={uniqueUploaders}
                  value={uploaderFilter}
                  onChange={setUploaderFilter}
                  allLabel="All Uploaders"
                  icon={User}
                />
                <FilterDropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  allLabel="Sort By"
                  icon={Calendar}
                />
              </div>
            </motion.div>

            {error && (
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-red-500/10 p-6 text-center text-red-400">
                <AlertCircle size={24} />
                <span className="text-lg">{error}</span>
              </div>
            )}
            {!loading && !error && filteredTestimonials.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-700 bg-gray-800/30 py-16 text-center"
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-gray-700 bg-gray-800/50">
                  <Info className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-white">
                  No Testimonials Found
                </h3>
                <p className="mx-auto mt-2 max-w-md text-gray-400">
                  No submissions match the current filters.
                </p>
              </motion.div>
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredTestimonials.map((testimonial) => (
                  <motion.div
                    layout
                    key={testimonial._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800/60 backdrop-blur-xl transition-all duration-300 hover:border-green-500/50"
                  >
                    <div className="flex-grow p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                            {testimonial.user?.name || "Anonymous"}
                            {testimonial.user?.email &&
                              creatorEmails.has(testimonial.user.email) && (
                                <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-gray-900 px-2 py-0.5 text-xs font-bold text-amber-400">
                                  <Crown className="h-3 w-3" /> Creator
                                </span>
                              )}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(
                                testimonial.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${testimonial.show === "yes"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-orange-500/20 text-orange-300"
                            }`}
                        >
                          {testimonial.show === "yes" ? (
                            <CheckCircle size={12} />
                          ) : (
                            <Clock size={12} />
                          )}{" "}
                          {testimonial.show === "yes" ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-300 line-clamp-4">
                        "{testimonial.message}"
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-700/50 bg-black/20 p-3">
                      <button
                        type="button"
                        onClick={() => openModal("confirm", testimonial)}
                        className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-colors ${testimonial.show === "yes"
                          ? "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
                          : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                          }`}
                      >
                        {testimonial.show === "yes" ? (
                          <>
                            <ThumbsDown size={14} /> Disapprove
                          </>
                        ) : (
                          <>
                            <ThumbsUp size={14} /> Approve
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal("view", testimonial)}
                        className="flex items-center justify-center gap-1.5 rounded-md bg-cyan-500/20 px-3 py-2 text-xs font-bold text-cyan-300 transition-colors hover:bg-cyan-500/30"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal("delete", testimonial)}
                        className="flex items-center justify-center gap-1.5 rounded-md bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/30"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={closeUploadModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-700 bg-slate-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleReviewSubmit} className="!z-50 relative">
                <div className="flex items-center justify-between border-b border-gray-700/50 bg-white/[.03] p-5">
                  <h3 className="flex items-center gap-3 text-xl font-bold text-white">
                    <PlusCircle className="text-teal-400" /> Add Testimonial
                  </h3>
                  <button
                    type="button"
                    onClick={closeUploadModal}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    <X />
                  </button>
                </div>

                <div className="p-8 space-y-6 h-[calc(100vh-240px)] overflow-y-scroll">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Author's Name"
                        required
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="email"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        placeholder="Author's Email"
                        required
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      value={authorProfession}
                      onChange={(e) => setAuthorProfession(e.target.value)}
                      placeholder="Profession (e.g., Software Engineer)"
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={5}
                      placeholder="Share your experience in detail..."
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {["Good", "Outstanding"].map((r) => (
                          <label
                            key={r}
                            className={`flex-1 cursor-pointer rounded-lg p-2 text-center text-sm font-semibold transition-all ${rating === r ? "bg-green-600 text-white" : "bg-gray-700/50 hover:bg-gray-700"}`}
                          >
                            <input
                              type="radio"
                              name="rating"
                              value={r}
                              checked={rating === r}
                              onChange={(e) => setRating(e.target.value)}
                              className="sr-only"
                            />
                            {r}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Important Label
                      </label>
                      <div className="flex gap-2">
                        <label
                          className={`flex-1 cursor-pointer rounded-lg p-2 text-center text-sm font-semibold transition-all ${isImportant ? "bg-green-600 text-white" : "bg-gray-700/50 hover:bg-gray-700"}`}
                        >
                          <input
                            type="radio"
                            name="isImportant"
                            checked={isImportant}
                            onChange={() => setIsImportant(true)}
                            className="sr-only"
                          />
                          Yes
                        </label>
                        <label
                          className={`flex-1 cursor-pointer rounded-lg p-2 text-center text-sm font-semibold transition-all ${!isImportant ? "bg-red-600 text-white" : "bg-gray-700/50 hover:bg-gray-700"}`}
                        >
                          <input
                            type="radio"
                            name="isImportant"
                            checked={!isImportant}
                            onChange={() => setIsImportant(false)}
                            className="sr-only"
                          />
                          No
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profile Picture (Optional)
                    </label>
                    <div className="flex rounded-lg bg-gray-800 p-1">
                      <button
                        type="button"
                        onClick={() => setProfileInputType("link")}
                        className={`w-1/2 rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${profileInputType === "link" ? "bg-green-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                      >
                        <Link size={16} /> Link
                      </button>
                      <button
                        type="button"
                        disabled={true}
                        className={`w-1/2 rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${profileInputType === "upload" ? "bg-green-600 text-white" : "text-gray-300 opacity-20"}`}
                      >
                        <UploadCloud size={16} /> Upload
                      </button>
                    </div>
                    <div className="mt-3">
                      {profileInputType === "link" ? (
                        <input
                          type="url"
                          value={profileLink}
                          onChange={(e) => setProfileLink(e.target.value)}
                          placeholder="https://example.com/profile.jpg"
                          className="w-full rounded-lg border border-gray-600 bg-gray-800 p-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <label className="w-full flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-gray-600 bg-gray-800 p-2.5 text-gray-400 hover:bg-gray-700">
                          <FileText size={16} />
                          <span className="truncate max-w-xs">
                            {profileFile ? profileFile.name : "Choose an image"}
                          </span>
                          <input
                            type="file"
                            onChange={(e) => setProfileFile(e.target.files[0])}
                            accept="image/*"
                            className="sr-only"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 bg-white/[.03] p-4">
                  <motion.button
                    type="button"
                    onClick={closeUploadModal}
                    whileHover={{ scale: 1.03 }}
                    disabled={isSubmittingReview}
                    className="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    disabled={isSubmittingReview}
                    onClick={() => handleReviewSubmit()}
                    className="flex min-w-[100px] items-center justify-center rounded-lg bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isViewModalOpen && selectedTestimonial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm min-h-[95vh]"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-br from-slate-900 via-black to-slate-900 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-700/50 bg-white/[.03] p-5">
                <h3 className="flex items-center gap-3 text-xl font-bold text-white">
                  <MessageCircle className="text-cyan-400" />
                  Testimonial Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <X />
                </button>
              </div>
              <div className="grid gap-x-8 gap-y-6 p-8 md:grid-cols-2">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 text-cyan-400">
                      {" "}
                      {selectedTestimonial?.userProfile ? (
                        <img
                          src={selectedTestimonial?.userProfile}
                          alt={selectedTestimonial?.user?.name}
                          className="w-24 h-24 mb-4 rounded-full flex items-center justify-center font-bold text-white text-4xl shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white text-4xl shrink-0">
                          {selectedTestimonial?.user?.name
                            ?.split(" ")
                            ?.map((n) => n[0])
                            ?.slice(0, 2)
                            ?.join("")}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start h-full w-full my-auto pb-3">
                      <p className="text-sm text-gray-400">Author</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">
                          {selectedTestimonial.user?.name || "Anonymous"}
                        </p>
                        {selectedTestimonial.isUserAdmin && (
                          <span className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300">
                            <Shield size={12} /> Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 text-cyan-400">
                      <Mail />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-semibold text-white">
                        {selectedTestimonial.user?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 text-cyan-400">
                      <BookOpen />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Academic Info</p>
                      <p className="font-semibold text-white">
                        {selectedTestimonial.course || "N/A"} - Semester{" "}
                        {selectedTestimonial.semester || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {selectedTestimonial.show === "yes" ? (
                        <CheckCircle className="text-green-400" />
                      ) : (
                        <Clock className="text-orange-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p
                        className={`font-semibold ${selectedTestimonial.show === "yes" ? "text-green-300" : "text-orange-300"}`}
                      >
                        {selectedTestimonial.show === "yes"
                          ? "Approved"
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <Star
                        className={
                          selectedTestimonial.rating === "Outstanding"
                            ? "text-amber-400"
                            : selectedTestimonial.rating === "Good"
                              ? "text-sky-400"
                              : "text-gray-500"
                        }
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Rating</p>
                      <p
                        className={`font-semibold ${selectedTestimonial.rating === "Outstanding" ? "text-amber-300" : selectedTestimonial.rating === "Good" ? "text-sky-300" : "text-gray-500"}`}
                      >
                        {selectedTestimonial.rating || "Not Rated"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 text-cyan-400">
                      <Calendar />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Timestamps</p>
                      <p className="font-semibold text-white">
                        Submitted:{" "}
                        {new Date(
                          selectedTestimonial.createdAt,
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Updated:{" "}
                        {new Date(
                          selectedTestimonial.updatedAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 pt-0">
                <div className="space-y-2 rounded-xl border border-gray-700 bg-black/20 p-4">
                  <h4 className="text-sm font-semibold text-gray-300">
                    Testimonial Message
                  </h4>
                  <div className="max-h-32 overflow-y-auto pr-2">
                    <p className="italic text-gray-200">
                      "{selectedTestimonial.message}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {isConfirmModalOpen && selectedTestimonial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center shadow-2xl"
            >
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${selectedTestimonial.show === "yes" ? "bg-orange-500/10" : "bg-green-500/10"}`}
              >
                {selectedTestimonial.show === "yes" ? (
                  <ThumbsDown className="h-8 w-8 text-orange-500" />
                ) : (
                  <ThumbsUp className="h-8 w-8 text-green-500" />
                )}
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white">
                {selectedTestimonial.show === "yes" ? "Disapprove" : "Approve"}{" "}
                Testimonial?
              </h3>
              <p className="mt-2 text-gray-300">
                Are you sure you want to{" "}
                <strong className="text-white">
                  {selectedTestimonial.show === "yes"
                    ? "disapprove"
                    : "approve"}
                </strong>{" "}
                this testimonial?
              </p>
              <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={closeModal}
                  whileHover={{ scale: 1.03 }}
                  disabled={isSubmitting}
                  className="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={performShowUpdate}
                  whileHover={{ scale: 1.03 }}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center rounded-lg px-6 py-2 font-semibold disabled:opacity-50 ${selectedTestimonial.show === "yes" ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-green-600 text-white hover:bg-green-700"}`}
                >
                  {isSubmitting ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {isDeleteModalOpen && selectedTestimonial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center shadow-2xl"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white">
                Delete Testimonial?
              </h3>
              <p className="mt-2 text-gray-300">
                Are you sure you want to delete this testimonial? This action
                cannot be undone.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={closeModal}
                  whileHover={{ scale: 1.03 }}
                  disabled={isSubmitting}
                  className="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={performDelete}
                  whileHover={{ scale: 1.03 }}
                  disabled={isSubmitting}
                  className="flex items-center justify-center rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

export default ManageTestimonials;