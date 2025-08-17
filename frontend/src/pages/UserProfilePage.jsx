"use client";

import { useState, useEffect, useCallback } from "react";
import {
    motion,
    AnimatePresence,
    useSpring,
    useTransform,
} from "framer-motion";
import { Helmet } from "react-helmet-async";
import toast, { Toaster } from "react-hot-toast";
import {
    User,
    Calendar,
    ShieldCheck,
    FileText,
    Eye,
    UploadCloud,
    Star,
    PlusCircle,
    Quote,
    Edit,
    BookOpen,
    BarChart3,
    Clock,
    Image as ImageIcon,
    Video,
    Briefcase,
    Loader,
    AlertCircle,
    Book,
    GraduationCap,
    ChevronDown,
    ChevronUp,
    Trash2,
    X,
    Crown,
    Shield,
    Mail,
    CheckCircle,
    MessageCircle,
    UserCheck,
} from "lucide-react";
import { API_URL } from "../utils/urls";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import FileViewer from "../fileComponents/FileViewer";
import { EditProfileModal } from "../components/EditProfileModal";
import { ValuesContext } from "../context/ValuesContext";
import { useContext } from "react";
import { useSwipeable } from "react-swipeable";

const ProfileSkeleton = () => (
    <div className="flex flex-col md:flex-row items-center gap-8 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-10 animate-pulse">
        <div className="w-32 h-32 rounded-full bg-white/10 ring-4 ring-white/5"></div>
        <div className="flex-1 w-full md:w-auto">
            <div className="h-10 bg-white/10 rounded w-3/4 mx-auto md:mx-0"></div>
            <div className="h-6 bg-white/10 rounded w-1/2 mt-3 mx-auto md:mx-0"></div>
            <div className="flex justify-center md:justify-start gap-6 mt-4">
                <div className="h-5 bg-white/10 rounded w-24"></div>
                <div className="h-5 bg-white/10 rounded w-28"></div>
            </div>
        </div>
    </div>
);

const FileCardSkeleton = () => (
    <div className="bg-black/20 rounded-xl border border-white/10 p-5 animate-pulse">
        <div className="flex items-start gap-4 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/10"></div>
            <div className="flex-1">
                <div className="h-5 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mt-2"></div>
            </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
            <div className="h-5 bg-white/10 rounded w-20"></div>
            <div className="h-9 bg-white/10 rounded-lg w-16"></div>
        </div>
    </div>
);

const AnimatedStat = ({ value }) => {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString(),
    );

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return (
        <motion.p className="text-3xl font-bold text-white">{display}</motion.p>
    );
};

const StatCard = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        blue: "from-blue-500/80 to-cyan-500/80",
        green: "from-green-500/80 to-emerald-500/80",
        yellow: "from-yellow-500/80 to-orange-500/80",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-5 bg-black/30 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
        >
            <div
                className={`absolute -top-1/2 -left-1/2 w-full h-[200%] bg-gradient-to-br ${colorClasses[color]} opacity-10 blur-3xl`}
            ></div>
            <div
                className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
            >
                <Icon className="w-8 h-8 text-gray-900" />
            </div>
            <div>
                <AnimatedStat value={value} />
                <p className="text-sm text-gray-400">{label}</p>
            </div>
        </motion.div>
    );
};

const getFileIcon = (type) => {
    switch (type) {
        case "document":
            return (
                <FileText className="w-6 h-6 text-blue-400 transition-colors duration-300 group-hover:text-yellow-400" />
            );
        case "image":
            return (
                <ImageIcon className="w-6 h-6 text-green-400 transition-colors duration-300 group-hover:text-yellow-400" />
            );
        case "video":
            return (
                <Video className="w-6 h-6 text-red-400 transition-colors duration-300 group-hover:text-yellow-400" />
            );
        default:
            return (
                <FileText className="w-6 h-6 text-gray-400 transition-colors duration-300 group-hover:text-yellow-400" />
            );
    }
};

const FileCard = ({ file, index, setSelectedFile }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="group relative bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-5 flex flex-col justify-between transition-all duration-300 hover:border-yellow-500/50 hover:bg-black/30 hover:-translate-y-1.5"
    >
        <div className="absolute top-0 left-0 w-full h-full rounded-xl bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex flex-col h-full">
            <div className="flex items-start gap-4 mb-3">
                <div className="flex-shrink-0 pt-1">{getFileIcon(file.type)}</div>
                <div className="min-w-0">
                    <h3 className="font-bold text-white truncate transition-colors group-hover:text-yellow-400">
                        {file.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                        {file.subject || "No Subject"}
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded-full">
                    {file.course}
                </span>
                <span className="bg-green-500/10 text-green-300 px-2 py-1 rounded-full">
                    Sem {file.semester}
                </span>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Eye size={16} />
                    <span>{(file.views || 0).toLocaleString()} views</span>
                </div>
                <button
                    onClick={() => setSelectedFile(file)}
                    className="px-4 py-2 bg-yellow-500/10 text-yellow-400 font-semibold rounded-lg text-sm hover:bg-yellow-500/20 transition-all duration-300 transform hover:scale-105"
                >
                    View
                </button>
            </div>
        </div>
    </motion.div>
);

const TestimonialCard = ({
    testimonial,
    index,
    currentUser,
    onEdit,
    onDelete,
    setIsViewModalOpen,
    setSelectedTestimonial,
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-6 relative"
    >
        <div className="flex items-start gap-4 pb-8 sm:pb-4">
            <img
                src={
                    testimonial.userProfile ||
                    `https://ui-avatars.com/api/?name=${testimonial.username.replace(" ", "+")}&background=1f2937&color=f59e0b`
                }
                alt={testimonial.username}
                className="w-12 h-12 rounded-full border-2 border-yellow-500/50"
            />
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-white">{testimonial.username}</p>
                        <p className="text-xs text-gray-400">
                            {testimonial.course} - Sem {testimonial.semester}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full text-xs font-bold">
                        <Star size={12} className="fill-current" />
                        <span>{testimonial.rating}</span>
                    </div>
                </div>
                <p className="text-gray-300 mt-3 italic">"{testimonial.text}"</p>
            </div>
        </div>
        {currentUser?._id === testimonial.userId && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1">
                <button
                    onClick={() => {
                        setIsViewModalOpen(true);
                        setSelectedTestimonial(testimonial);
                    }}
                    className="p-2 rounded-full bg-black/30 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                >
                    <Eye size={14} />
                </button>
                <button
                    onClick={onEdit}
                    className="p-2 rounded-full bg-black/30 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                >
                    <Edit size={14} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 rounded-full bg-black/30 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        )}
    </motion.div>
);

const EditTestimonialModal = ({ isOpen, onClose, testimonial, onUpdate }) => {
    const [text, setText] = useState("");
    const [rating, setRating] = useState("");
    const [userProfile, setUserProfile] = useState("");

    useEffect(() => {
        if (testimonial) {
            setText(testimonial.text || "");
            setRating(testimonial.rating || "");
            setUserProfile(testimonial.userProfile || "");
        }
    }, [testimonial]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(testimonial._id, { text, rating, userProfile });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-8 w-full max-w-lg relative shadow-2xl shadow-yellow-500/10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X />
                </button>
                <h3 className="text-2xl font-bold mb-6 text-white">Edit Testimonial</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Review
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-32 p-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Rating
                        </label>
                        <div className="flex items-center gap-4">
                            {["Good", "Outstanding"].map((r) => (
                                <label
                                    key={r}
                                    className="flex items-center gap-2 cursor-pointer text-gray-300"
                                >
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={r}
                                        checked={rating === r}
                                        onChange={(e) => setRating(e.target.value)}
                                        className="hidden"
                                    />
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${rating === r ? "border-yellow-500 bg-yellow-500" : "border-gray-600"}`}
                                    />
                                    {r}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Profile Picture URL (Optional)
                        </label>
                        <input
                            type="url"
                            value={userProfile}
                            onChange={(e) => setUserProfile(e.target.value)}
                            placeholder="https://example.com/image.png"
                            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl shadow-red-500/10"
            >
                <h3 className="text-2xl font-bold text-white mb-4">Confirm Deletion</h3>
                <p className="text-gray-400 mb-8">
                    Are you sure you want to delete this testimonial? This action cannot
                    be undone.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const SectionHeader = ({ icon: Icon, title, children }) => (
    <div className="mb-6">
        <div className="flex justify-between items-center pb-2">
            <div className="flex items-center gap-3">
                <Icon className="w-7 h-7 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    {title}
                </h2>
            </div>
            <div>{children}</div>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg flex items-center justify-center gap-2 border border-red-500/30">
        <AlertCircle /> {message || "An error occurred."}
    </div>
);

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuthStore();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ uploads: 0, views: 0, testimonials: 0 });
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [userError, setUserError] = useState(null);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [isRecentLoading, setIsRecentLoading] = useState(false);
    const [recentError, setRecentError] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploadsLoading, setIsUploadsLoading] = useState(false);
    const [uploadsError, setUploadsError] = useState(null);
    const [isUploadsExpanded, setIsUploadsExpanded] = useState(false);
    const [testimonials, setTestimonials] = useState([]);
    const [isTestimonialsLoading, setIsTestimonialsLoading] = useState(false);
    const [testimonialsError, setTestimonialsError] = useState(null);
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isUserEdited, setIsUserEdited] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (
            selectedFile ||
            isEditModalOpen ||
            modalState.type === "edit" ||
            modalState.type === "delete"
        ) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [selectedFile, isEditModalOpen, modalState.type]);

    const fetchTestimonials = useCallback(async () => {
        if (!user?._id) return;
        setIsTestimonialsLoading(true);
        setTestimonialsError(null);
        try {
            const response = await fetch(
                `${API_URL}/api/testimonials/gettestimonialsbyuser/${user._id}`,
            );
            if (!response.ok) throw new Error("Network response was not ok.");
            const data = await response.json();
            if (data.success) {
                setTestimonials(data.testimonials);
            } else {
                throw new Error(data.message || "Failed to fetch testimonials.");
            }
        } catch (error) {
            console.error("Failed to fetch testimonials", error);
            setTestimonialsError(error.message);
        } finally {
            setIsTestimonialsLoading(false);
        }
    }, [user?._id]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!authUser?._id) {
                setIsUserLoading(false);
                setUserError("You must be logged in to view your profile.");
                return;
            }
            setIsUserLoading(true);
            setUserError(null);
            try {
                const response = await fetch(
                    `${API_URL}/api/auth/fetchuser/${authUser._id}`,
                );
                if (!response.ok) throw new Error("Failed to fetch user data.");
                const data = await response.json();
                if (data.success) setUser(data.user);
                else throw new Error(data.message || "Could not retrieve user.");
            } catch (error) {
                setUserError(error.message);
            } finally {
                setIsUserLoading(false);
            }
        };
        fetchUserData();
    }, [authUser?._id, isUserEdited]);

    useEffect(() => {
        if (!user) return;

        const fetchAllData = async () => {
            if (user.openedFiles && user.openedFiles.length > 0) {
                setIsRecentLoading(true);
                setRecentError(null);
                try {
                    const filePromises = user.openedFiles.slice(0, 6).map((id) =>
                        fetch(`${API_URL}/api/files/getfilebyid`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id }),
                        }).then((res) => res.json()),
                    );
                    const results = await Promise.all(filePromises);
                    setRecentlyViewed(
                        results.filter((r) => r.success).map((r) => r.data),
                    );
                } catch (error) {
                    setRecentError("Failed to fetch recently viewed files.");
                } finally {
                    setIsRecentLoading(false);
                }
            }

            if (user.isAdmin === "admin") {
                setIsUploadsLoading(true);
                setUploadsError(null);
                try {
                    const response = await fetch(`${API_URL}/api/files/adminfiles`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user._id }),
                    });
                    if (!response.ok) throw new Error("Failed to fetch uploaded files.");
                    const data = await response.json();
                    if (data.success) setUploadedFiles(data.data);
                    else
                        throw new Error(
                            data.message || "Could not retrieve uploaded files.",
                        );
                } catch (error) {
                    setUploadsError(error.message);
                } finally {
                    setIsUploadsLoading(false);
                }
            }
            fetchTestimonials();
        };

        fetchAllData();
    }, [user, fetchTestimonials]);

    useEffect(() => {
        const totalViews = uploadedFiles.reduce(
            (sum, file) => sum + (file.views || 0),
            0,
        );
        setStats({
            uploads: uploadedFiles.length,
            views: totalViews,
            testimonials: testimonials.length,
        });
    }, [uploadedFiles, testimonials]);

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

    const handleUpdateTestimonial = async (id, data) => {
        try {
            const response = await fetch(
                `${API_URL}/api/testimonials/updatetestimonial/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...data,
                        course: user?.course || "Unknown",
                        semester: user?.semester || "Unknown",
                    }),
                },
            );
            const result = await response.json();
            if (result.success) {
                toast.success("Testimonial updated successfully!");
                fetchTestimonials();
                setModalState({ type: null, data: null });
            } else {
                toast.error(result.message || "Failed to update testimonial.");
                console.error("Failed to update testimonial:", result.message);
            }
        } catch (error) {
            toast.error("An error occurred while updating.");
            console.error("Error updating testimonial:", error);
        }
    };

    const handleDeleteTestimonial = async (id) => {
        try {
            const response = await fetch(
                `${API_URL}/api/testimonials/deletetestimonial/${id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user }),
                },
            );
            const result = await response.json();
            if (result.success) {
                toast.success("Testimonial deleted.");
                setTestimonials(testimonials.filter((t) => t._id !== id));
                setModalState({ type: null, data: null });
            } else {
                toast.error(result.message || "Failed to delete testimonial.");
                console.error("Failed to delete testimonial:", result.message);
            }
        } catch (error) {
            toast.error("An error occurred while deleting.");
            console.error("Error deleting testimonial:", error);
        }
    };

    const getUserInitials = (name) => {
        if (!name) return "?";
        const names = name.split(" ").filter(Boolean);
        if (names.length > 1)
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const filesToShow = isUploadsExpanded
        ? uploadedFiles
        : uploadedFiles.slice(0, 4);

    return (
        <>
            <div className="fixed top-1/2 -translate-y-1/2 right-2 md:right-4 z-10 pointer-events-none hidden sm:block">
                <div className="flex flex-col items-center rounded-full border border-blue-400/30 bg-black/30 backdrop-blur-lg px-1.5 py-4 md:px-2 md:py-5">
                    <UserCheck className="h-5 w-5 text-blue-400 md:h-6 md:w-6 mb-2" />
                    {"USER".split("").map((char, index) => (
                        <span
                            key={index}
                            className="font-mono text-xs font-bold uppercase text-blue-300/80 md:text-xl"
                        >
                            {char}
                        </span>
                    ))}
                </div>
            </div>
            <div
                {...swipeHandlers}
                className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-gray-900 text-white p-0 pb-32 pt-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Toaster
                        position="bottom-center"
                        toastOptions={{ style: { background: "#333", color: "#fff" } }}
                    />
                    <Helmet>
                        <title>{user ? `Profile - ${user.name}` : "My Profile"}</title>
                        <meta
                            name="description"
                            content="Profile page to view your activity and contributions."
                        />
                    </Helmet>

                    <div className="w-full border-b border-gray-800 pb-6 mb-3">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Profile</h1>
                            <p className="text-gray-400 mt-2 text-sm sm:text-base">Manage your account settings and preferences</p>
                        </div>
                    </div>

                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-900/50 via-gray-900 to-gray-900 -z-10"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-96 bg-gradient-to-tr from-yellow-900/40 to-transparent rounded-full opacity-30 blur-3xl -z-10"></div>

                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {isUserLoading ? (
                            <ProfileSkeleton />
                        ) : userError ? (
                            <ErrorDisplay message={userError} />
                        ) : (
                            user && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="flex flex-col md:flex-row items-center gap-8 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-12 shadow-2xl shadow-black/20"
                                    >
                                        <div className="relative">
                                            {user.profileUrl ? (
                                                <img
                                                    src={user.profileUrl}
                                                    alt={user.name}
                                                    className="w-32 h-32 rounded-full ring-4 ring-offset-4 ring-offset-gray-900 ring-yellow-500 object-cover"
                                                />
                                            ) : (
                                                <div className="w-32 h-32 rounded-full ring-4 ring-offset-4 ring-offset-gray-900 ring-yellow-500 bg-gray-700 flex items-center justify-center">
                                                    <span className="text-4xl font-bold text-white">
                                                        {getUserInitials(user.name)}
                                                    </span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setEditModalOpen(true)}
                                                className="absolute bottom-1 right-1 bg-yellow-500 p-2.5 rounded-full hover:bg-yellow-400 transition-all duration-300 shadow-lg border-2 border-gray-900 transform hover:scale-110"
                                            >
                                                <Edit size={16} className="text-gray-900" />
                                            </button>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h1 className="text-4xl font-extrabold text-white tracking-tight">
                                                {user.name}
                                            </h1>
                                            <p className="text-lg text-gray-400 mt-1 font-mono">
                                                {user.email}
                                            </p>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-4 text-gray-300 text-sm">
                                                <span className="flex items-center gap-2">
                                                    <Calendar size={16} /> Joined on{" "}
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </span>
                                                {user.course && (
                                                    <span className="flex items-center gap-2">
                                                        <Book size={16} /> {user.course}
                                                    </span>
                                                )}
                                                {user.semester && (
                                                    <span className="flex items-center gap-2">
                                                        <GraduationCap size={16} /> Semester {user.semester}
                                                    </span>
                                                )}
                                                {user.isAdmin === "admin" && (
                                                    <span className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-bold">
                                                        <ShieldCheck size={16} /> Administrator
                                                    </span>
                                                )}
                                                {(user?.email === "bdhakad886@gmail.com" ||
                                                    user?.email === "pratikajbe40@gmail.com") && (
                                                        <span className="flex items-center gap-2 border-amber-400/30 bg-black/30 backdrop-blur-lg text-amber-300/80 px-3 py-1 rounded-full font-bold">
                                                            <Crown size={16} className="text-amber-400" /> Creator
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </motion.div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                                        {
                                            user?.isAdmin === "admin" && (
                                                <StatCard
                                                    icon={UploadCloud}
                                                    value={stats.uploads}
                                                    label="Uploads"
                                                    color="blue"
                                                />
                                            )}
                                        {user?.isAdmin === "admin" && (
                                            <StatCard
                                                icon={Eye}
                                                value={stats.views}
                                                label="Total Views on Uploads"
                                                color="green"
                                            />
                                        )}
                                        <StatCard
                                            icon={Star}
                                            value={stats.testimonials}
                                            label="Testimonials Given"
                                            color="yellow"
                                        />
                                    </div>
                                </>
                            )
                        )}

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-16"
                        >
                            <SectionHeader icon={Clock} title="Recently Viewed Files" />
                            {isRecentLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(3)].map((_, i) => (
                                        <FileCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : recentError ? (
                                <ErrorDisplay message={recentError} />
                            ) : recentlyViewed.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recentlyViewed.map((file, index) => (
                                        <FileCard
                                            key={file._id}
                                            file={file}
                                            index={index}
                                            setSelectedFile={setSelectedFile}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-black/20 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/10">
                                    <Eye className="mx-auto w-12 h-12 text-gray-500" />
                                    <h3 className="mt-4 text-lg font-semibold text-white">
                                        No Recently Viewed Files
                                    </h3>
                                    <p className="text-gray-400 mt-1">
                                        Start exploring to see your history here.
                                    </p>
                                </div>
                            )}
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mb-16"
                        >
                            <SectionHeader icon={Star} title="My Testimonials">
                                <button
                                    onClick={() => navigate("/about?action=postreview")}
                                    className="flex items-center gap-2 sm:px-4 sm:py-2 px-2 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg shadow-yellow-800/20 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-yellow-800/30 active:scale-95"
                                >
                                    <PlusCircle size={18} /> Add{" "}
                                    <p className="hidden sm:block">New</p>
                                </button>
                            </SectionHeader>
                            {isTestimonialsLoading ? (
                                <p className="text-center text-gray-400 flex items-center justify-center gap-2">
                                    <Loader className="animate-spin" />
                                    Loading testimonials...
                                </p>
                            ) : testimonialsError ? (
                                <ErrorDisplay message={testimonialsError} />
                            ) : testimonials.length > 0 ? (
                                <div className="space-y-4">
                                    {testimonials.map((item, index) => (
                                        <TestimonialCard
                                            key={item._id}
                                            testimonial={item}
                                            index={index}
                                            currentUser={user}
                                            onEdit={() => setModalState({ type: "edit", data: item })}
                                            onDelete={() =>
                                                setModalState({ type: "delete", data: item })
                                            }
                                            setIsViewModalOpen={setIsViewModalOpen}
                                            setSelectedTestimonial={setSelectedTestimonial}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-black/20 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/10">
                                    <Quote className="mx-auto w-12 h-12 text-gray-500" />
                                    <h3 className="mt-4 text-lg font-semibold text-white">
                                        No Testimonials Yet
                                    </h3>
                                    <p className="text-gray-400 mt-1">
                                        You haven't written any testimonials.
                                    </p>
                                </div>
                            )}
                        </motion.section>

                        <AnimatePresence>
                            {user?.isAdmin === "admin" && (
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="mb-16"
                                >
                                    <SectionHeader icon={Briefcase} title="My Uploaded Files">
                                        {uploadedFiles.length > 4 && (
                                            <button
                                                onClick={() => setIsUploadsExpanded(!isUploadsExpanded)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 font-semibold rounded-lg hover:bg-yellow-500/10 transition-colors"
                                            >
                                                {isUploadsExpanded ? "Collapse" : "Show All"}
                                                {isUploadsExpanded ? (
                                                    <ChevronUp size={16} />
                                                ) : (
                                                    <ChevronDown size={16} />
                                                )}
                                            </button>
                                        )}
                                    </SectionHeader>
                                    {isUploadsLoading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[...Array(4)].map((_, i) => (
                                                <FileCardSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : uploadsError ? (
                                        <ErrorDisplay message={uploadsError} />
                                    ) : uploadedFiles.length > 0 ? (
                                        <motion.div
                                            layout
                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                                        >
                                            <AnimatePresence>
                                                {filesToShow.map((file, index) => (
                                                    <FileCard
                                                        key={file._id}
                                                        file={file}
                                                        index={index}
                                                        setSelectedFile={setSelectedFile}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-12 bg-black/20 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/10">
                                            <UploadCloud className="mx-auto w-12 h-12 text-gray-500" />
                                            <h3 className="mt-4 text-lg font-semibold text-white">
                                                No Files Uploaded
                                            </h3>
                                            <p className="text-gray-400 mt-1">
                                                You haven't uploaded any files yet.
                                            </p>
                                        </div>
                                    )}
                                </motion.section>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-center"
                        >
                            <div className="group relative bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8 transition-all duration-300 hover:border-blue-500/50">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="mx-auto bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center border border-blue-700/30">
                                    <BookOpen className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-white">
                                    Explore Courses
                                </h3>
                                <p className="mt-2 text-gray-400">
                                    Dive into various courses and find the resources you need.
                                </p>
                                <button
                                    onClick={() => navigate("/scsit/courses")}
                                    className="mt-4 font-semibold text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer relative z-30"
                                >
                                    Browse Now &rarr;
                                </button>
                            </div>
                            <div className="group relative bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8 transition-all duration-300 hover:border-green-500/50">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="mx-auto bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center border border-green-700/30">
                                    <BarChart3 className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-white">
                                    Check Leaderboard
                                </h3>
                                <p className="mt-2 text-gray-400">
                                    See how your contributions rank among your peers.
                                </p>
                                <button
                                    onClick={() => navigate("/admins/leaderboard")}
                                    className="mt-4 font-semibold text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer relative z-30"
                                >
                                    View Rankings &rarr;
                                </button>
                            </div>
                        </motion.div>
                    </div>
                    <EditTestimonialModal
                        isOpen={modalState.type === "edit"}
                        onClose={() => setModalState({ type: null, data: null })}
                        testimonial={modalState.data}
                        onUpdate={handleUpdateTestimonial}
                    />
                    <DeleteConfirmationModal
                        isOpen={modalState.type === "delete"}
                        onClose={() => setModalState({ type: null, data: null })}
                        onConfirm={() => handleDeleteTestimonial(modalState.data?._id)}
                    />
                </div>
            </div>
            {selectedFile && (
                <FileViewer file={selectedFile} onClose={() => setSelectedFile(null)} />
            )}
            {isEditModalOpen && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    setIsOpen={setEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    setIsUserEdited={setIsUserEdited}
                />
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
                        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-br from-slate-900 via-black to-slate-900 shadow-2xl min-h-[90vh]"
                    >
                        <div className="flex items-center justify-between border-b border-gray-700/50 bg-white/[.03] p-5">
                            <h3 className="flex items-center gap-3 text-xl font-bold text-white">
                                <MessageCircle className="text-cyan-400" />
                                Testimonial Details
                            </h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
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
                                                alt={selectedTestimonial?.username}
                                                className="w-24 h-24 mb-4 rounded-full flex items-center justify-center font-bold text-white text-4xl shrink-0"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white text-4xl shrink-0">
                                                {selectedTestimonial?.username
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
                                                {selectedTestimonial?.username || "Anonymous"}
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
                                            {selectedTestimonial?.userEmail || "N/A"}
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
                                            {new Date(selectedTestimonial.createdAt).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Updated:{" "}
                                            {new Date(selectedTestimonial.updatedAt).toLocaleString()}
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
                                        "{selectedTestimonial.text}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};

export default ProfilePage;
