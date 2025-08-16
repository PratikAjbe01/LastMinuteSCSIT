"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Target,
  BookOpen,
  Users,
  Archive,
  Filter,
  Shield,
  Upload,
  BrainCircuit,
  Database,
  Wind,
  Palette,
  Linkedin,
  ArrowRight,
  Cloud,
  Github,
  Mail,
  Code,
  Zap,
  Globe,
  Lightbulb,
  TrendingUp,
  Heart,
  Award,
  Calendar,
  Clock,
  BookMarked,
  Workflow,
  File,
  Files,
  GraduationCap,
  Home,
  PanelTopClose,
  FileChartPie,
  MessageSquare,
  Send,
  CheckCircle2,
  Edit,
  Trash2,
  X,
  MessageCircle,
} from "lucide-react";
import { ValuesContext } from "../context/ValuesContext";
import { useSwipeable } from "react-swipeable";
import { API_URL } from "../utils/urls";
import { useAuthStore } from "../store/authStore";
import React from "react";

const Section = React.forwardRef(
  ({ title, children, subtitle, ...props }, ref) => (
    <div ref={ref} className="py-24" {...props}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-gray-400 max-w-3xl mx-auto text-lg">
            {subtitle}
          </p>
        )}
      </motion.div>
      {children}
    </div>
  ),
);

const FeatureCard = ({ feature, index, navigate }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="relative bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700 flex flex-col group hover:border-green-500/50 transition-all duration-300 h-full hover:shadow-2xl hover:shadow-green-500/10"
  >
    <div className="absolute -top-3 -left-3 w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600 group-hover:bg-green-500/20 group-hover:border-green-500 transition-all duration-300">
      <feature.icon className="w-8 h-8 text-green-400" />
    </div>
    <h3 className="text-2xl font-bold mt-12 mb-3 text-white">
      {feature.title}
    </h3>
    <p className="text-gray-400 flex-grow">{feature.description}</p>
    {feature.href && (
      <button
        onClick={() => navigate(feature.href)}
        className="mt-6 text-green-400 font-semibold hover:text-green-300 transition-colors flex items-center gap-2 self-start"
      >
        Explore <ArrowRight size={16} />
      </button>
    )}
  </motion.div>
);

const DeveloperCard = ({ dev, index }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="relative bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700 text-center flex flex-col items-center group overflow-hidden h-full hover:shadow-2xl hover:shadow-green-500/10"
  >
    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-green-500/10 to-transparent"></div>
    <img
      className="relative w-32 h-32 rounded-full mx-auto mb-4 border-4 border-slate-600 group-hover:border-green-500 transition-colors duration-300 object-cover"
      src={dev.imageUrl}
      alt={dev.name}
    />
    <h3 className="text-2xl font-bold text-white">{dev.name}</h3>
    <p className="text-green-400 font-semibold mb-4">{dev.role}</p>
    <div className="flex gap-3 mt-auto">
      <a
        href={dev.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-10 h-10 bg-slate-700 hover:bg-blue-600 text-white rounded-full transition-colors"
      >
        <Linkedin size={18} />
      </a>
      <a
        href={dev.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-10 h-10 bg-slate-700 hover:bg-gray-600 text-white rounded-full transition-colors"
      >
        <Github size={18} />
      </a>
      <a
        href={`mailto:${dev.email}`}
        className="inline-flex items-center justify-center w-10 h-10 bg-slate-700 hover:bg-green-600 text-white rounded-full transition-colors"
      >
        <Mail size={18} />
      </a>
    </div>
  </motion.div>
);

const TechIcon = ({ tech, index }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="flex flex-col items-center group"
  >
    <div className="h-20 w-20 mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
      {typeof tech.icon === "string" ? (
        <img src={tech.icon} alt={tech.name} className="h-16 w-16" />
      ) : (
        <tech.icon className="w-16 h-16 text-gray-400 group-hover:text-white transition-colors duration-300" />
      )}
    </div>
    <h4 className="font-semibold text-white transition-colors duration-300 group-hover:text-green-400">
      {tech.name}
    </h4>
  </motion.div>
);

const StatCard = ({ icon: Icon, value, label, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700 text-center"
  >
    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-green-400" />
    </div>
    <div className="text-4xl font-bold text-white mb-2">{value}</div>
    <div className="text-gray-400">{label}</div>
  </motion.div>
);

const ValueCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 text-center group hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10"
  >
    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 transition-colors duration-300">
      <Icon className="w-8 h-8 text-green-400" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

const TimelineItem = ({ year, title, description, index }) => (
  <div className="relative pl-12 md:pl-0 md:flex md:justify-center">
    <div className="md:w-1/2 md:pr-8 md:text-right">
      {index % 2 === 0 && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 mb-8 md:mb-0"
        >
          <div className="text-green-400 font-bold text-lg mb-2">{year}</div>
          <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-400">{description}</p>
        </motion.div>
      )}
    </div>
    <div className="absolute md:relative left-0 md:left-auto md:w-auto h-full md:h-auto flex items-center">
      <div className="h-full w-0.5 bg-slate-700 md:hidden"></div>
      <div className="absolute top-1/2 -translate-y-1/2 md:static md:translate-y-0 w-4 h-4 bg-green-500 rounded-full border-4 border-slate-900 z-10"></div>
    </div>
    <div className="md:w-1/2 md:pl-8">
      {index % 2 !== 0 && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 mb-8 md:mb-0"
        >
          <div className="text-green-400 font-bold text-lg mb-2">{year}</div>
          <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-400">{description}</p>
        </motion.div>
      )}
    </div>
  </div>
);

const TestimonialCard = ({ testimonial, onEdit, onDelete, currentUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 flex flex-col"
  >
    <p className="text-gray-300 flex-grow">"{testimonial.text}"</p>
    <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
      <div>
        <p className="font-bold text-white">{testimonial.username}</p>
        <p className="text-sm text-green-400">{testimonial.rating}</p>
      </div>
      {(currentUser?.role === "admin" ||
        currentUser?._id === testimonial.userId) && (
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
    </div>
  </motion.div>
);

const EditModal = ({ isOpen, onClose, testimonial, onUpdate, user }) => {
  const [editedText, setEditedText] = useState(testimonial?.text || "");
  const [editedRating, setEditedRating] = useState(testimonial?.rating || "");

  useEffect(() => {
    if (testimonial) {
      setEditedText(testimonial.text);
      setEditedRating(testimonial.rating);
    }
  }, [testimonial]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(testimonial._id, { text: editedText, rating: editedRating });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-2xl p-8 border border-slate-700 w-full max-w-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X />
        </button>
        <h3 className="text-2xl font-bold mb-6 text-white">Edit Testimonial</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-32 p-4 bg-slate-700/50 rounded-lg border border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
          <div className="mt-4 flex items-center gap-6">
            {["Good", "Outstanding"].map((r) => (
              <label
                key={r}
                className="flex items-center gap-2 cursor-pointer text-gray-300"
              >
                <input
                  type="radio"
                  name="rating"
                  value={r}
                  checked={editedRating === r}
                  onChange={(e) => setEditedRating(e.target.value)}
                  className="hidden"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editedRating === r ? "border-green-500 bg-green-500" : "border-slate-600"}`}
                >
                  {editedRating === r && <CheckCircle2 size={12} />}
                </div>
                {r}
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-2xl p-8 border border-slate-700 w-full max-w-md text-center"
      >
        <h3 className="text-2xl font-bold mb-4 text-white">Confirm Deletion</h3>
        <p className="text-gray-400 mb-8">
          Are you sure you want to delete this testimonial? This action cannot
          be undone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
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

const AboutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuthStore();
  const reviewSectionRef = useRef(null);
  const { setIsSidebarOpen } = useContext(ValuesContext);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("");
  const [reviewStatus, setReviewStatus] = useState({
    loading: false,
    message: "",
    type: "",
  });
  const [shouldScroll, setShouldScroll] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [modalState, setModalState] = useState({ type: null, data: null });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set((clientX - left) / width);
    mouseY.set((clientY - top) / height);
  };

  const [stats, setStats] = useState([
    { icon: Files, value: "0", label: "Documents" },
    { icon: Users, value: "0", label: "Active Users" },
    { icon: GraduationCap, value: "13", label: "Courses" },
    { icon: Calendar, value: "1", label: "Active Year" },
  ]);

  const features = [
    {
      icon: Archive,
      title: "Centralized Repository",
      description:
        "All academic resources organized by course and semester in one place.",
      href: "/scsit/courses",
    },
    {
      icon: Filter,
      title: "Advanced Search",
      description:
        "Find resources instantly with powerful search and filtering options.",
      href: "/allfiles",
    },
    {
      icon: Shield,
      title: "Secure Viewer",
      description:
        "Preview documents directly in browser with zoom and rotate controls.",
      href: null,
    },
    {
      icon: Upload,
      title: "Community Driven",
      description:
        "Contribute and access resources uploaded by the student community.",
      href: "/upload",
    },
    {
      icon: Target,
      title: "Study Tools",
      description:
        "Integrated tools for CGPA calculation and attendance management.",
      href: "/calculations/tools/cgpa",
    },
    {
      icon: BookOpen,
      title: "Task Planner",
      description:
        "Organize your studies with built-in task and deadline management.",
      href: "/planner/todos",
    },
    {
      icon: Users,
      title: "User Management",
      description:
        "Personalized dashboard and profile management for each student.",
      href: "/profile",
    },
    {
      icon: FileChartPie,
      title: "Admin Dashboard",
      description: "Comprehensive admin tools for content and user management.",
      href: "/allfiles/admin",
    },
  ];

  const developers = [
    {
      name: "Pratik Ajbe",
      role: "Full-Stack Developer",
      linkedinUrl: "https://www.linkedin.com/in/pratik-ajbe-710bb326a/",
      githubUrl: "https://github.com/PratikAjbe01",
      email: "pratikajbe40@gmail.com",
      imageUrl:
        "https://media.licdn.com/dms/image/v2/D4D03AQEnC-bYyRf3gQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1697458598982?e=1756339200&v=beta&t=BzhNEaXfk1trIXNUPCGV6hYNkIjnKvGU5SmwBb6pAmU",
    },
    {
      name: "Balram Dhakad",
      role: "Full-Stack Developer",
      linkedinUrl: "https://www.linkedin.com/in/balram-dhakad-2a9110210/",
      githubUrl: "https://github.com/balram2002",
      email: "bdhakad886@gmail.com",
      imageUrl:
        "https://media.licdn.com/dms/image/v2/D5603AQHB2Xyb8bUzsA/profile-displayphoto-shrink_800_800/B56ZcplHMmGsAc-/0/1748749285834?e=1756339200&v=beta&t=-SRxJ52qlgxvp4gmkb4jmhJ56QTFwYg89Q93TAd4B0Q",
    },
  ];

  const techStack = [
    { name: "React", icon: BrainCircuit },
    {
      name: "Node.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    },
    {
      name: "Express",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
    },
    { name: "MongoDB", icon: Database },
    { name: "Tailwind CSS", icon: Wind },
    { name: "Framer Motion", icon: Zap },
    { name: "Cloudinary", icon: Cloud },
    { name: "JWT", icon: Shield },
  ];
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "Constantly evolving to meet student needs with cutting-edge solutions.",
    },
    {
      icon: Heart,
      title: "Community",
      description:
        "Built by students, for students, fostering collaborative learning.",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "Commitment to providing the highest quality academic resources.",
    },
    {
      icon: TrendingUp,
      title: "Growth",
      description: "Empowering students to achieve their academic potential.",
    },
  ];
  const timeline = [
    {
      year: "Dec 2024",
      title: "The Problem",
      description:
        "End-semester resource mismanagement highlighted the need for a centralized academic platform.",
    },
    {
      year: "Feb 2025",
      title: "Planning & Design",
      description:
        "Conceptualized platform architecture and user experience design.",
    },
    {
      year: "Jul 2025",
      title: "Development",
      description:
        "Started full-scale development with beta testing among select students.",
    },
    {
      year: "Aug 2025",
      title: "Public Release",
      description: "Launched stable version to the entire SCSIT community.",
    },
  ];

  const fetchTestimonials = async () => {
    setIsLoadingTestimonials(true);
    try {
      const response = await fetch(
        `${API_URL}/api/testimonials/gettestimonialsbyuser/${user?._id}`,
      );
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials", error);
    } finally {
      setIsLoadingTestimonials(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "postreview") setShouldScroll(true);
    else window.scrollTo({ top: 0, behavior: "instant" });
    fetchTestimonials();
  }, [location]);

  useEffect(() => {
    if (shouldScroll && reviewSectionRef.current) {
      reviewSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setShouldScroll(false);
    }
  }, [shouldScroll, testimonials]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersResponse = await fetch(`${API_URL}/api/auth/fetchallusers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : ''}`,
          }
        });

        const usersResult = await usersResponse.json();
        const usersCount = usersResult.success ? usersResult.users.length : 0;

        const filesResponse = await fetch(`${API_URL}/api/files/allfiles`);
        const filesResult = await filesResponse.json();
        const filesCount = filesResult.success ? filesResult.data.length : 0;

        const allTestimonials = await fetch(`${API_URL}/api/testimonials/getalltestimonials`);
        const testimonialsResult = await allTestimonials.json();
        const testimonialsCount = testimonialsResult.success ? testimonialsResult.testimonials.length : 0;

        setStats(prevStats => [
          { icon: Files, value: filesCount.toString(), label: "Documents" },
          { icon: Users, value: usersCount.toString(), label: "Active Users" },
          { icon: GraduationCap, value: "13", label: "Courses" },
          { icon: MessageCircle, value: testimonialsCount.toString(), label: "Testimonials" },
          { icon: Calendar, value: "1", label: "Active Year" },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim() || !user) return;
    setReviewStatus({ loading: true, message: "", type: "" });
    try {
      const response = await fetch(
        `${API_URL}/api/testimonials/uploadtestimonial`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: feedback,
            rating,
            userId: user?._id,
            username: user?.name,
            userEmail: user?.email,
            isUserAdmin: user?.isAdmin === "admin",
            semester: user?.semester || "Unknown",
            course: user?.course || "Unknown",
          }),
        },
      );
      const result = await response.json();
      if (result.success) {
        setReviewStatus({
          loading: false,
          message: "Thank you! Your feedback has been submitted.",
          type: "success",
        });
        setFeedback("");
        setRating("");
        fetchTestimonials();
      } else {
        setReviewStatus({
          loading: false,
          message: result.message || "An error occurred.",
          type: "error",
        });
      }
    } catch (error) {
      setReviewStatus({
        loading: false,
        message: "Server error. Please try again later.",
        type: "error",
      });
    }
  };

  const handleUpdateTestimonial = async (id, data) => {
    try {
      const response = await fetch(
        `${API_URL}/api/testimonials/updatetestimonial/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, course: user?.course || "Unknown", semester: user?.semester || "Unknown" }),
        },
      );
      const result = await response.json();
      if (result.success) {
        fetchTestimonials();
        setModalState({ type: null, data: null });
      } else {
        console.error("Failed to update testimonial:", result.message);
      }
    } catch (error) {
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
        setTestimonials(testimonials.filter((t) => t._id !== id));
        setModalState({ type: null, data: null });
      } else {
        console.error("Failed to delete testimonial:", result.message);
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  const isExcludedRoute =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/login") ||
      window.location.pathname === "/signup");
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !isExcludedRoute) setIsSidebarOpen(true);
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 30,
  });

  const headline = "Academic Excellence, Simplified.".split(" ");

  return (
    <div
      {...swipeHandlers}
      className="min-h-screen w-full bg-slate-950 text-white overflow-x-hidden"
    >
      <Helmet>
        <title>About Us - LastMinute SCSIT</title>
        <meta
          name="description"
          content="Learn about the mission and technology behind LastMinute SCSIT, the academic resource hub for SCSIT, Indore."
        />
      </Helmet>
      <div className="absolute inset-0 -z-20 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <div className="relative w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          onMouseMove={handleMouseMove}
          className="relative text-center pt-40 pb-32 flex flex-col items-center justify-center overflow-hidden"
        >
          <motion.div
            style={{
              x: useTransform(mouseX, [0, 1], [-20, 20]),
              y: useTransform(mouseY, [0, 1], [-20, 20]),
            }}
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_#10b98122,_transparent_60%)]"
          ></motion.div>
          <motion.div
            className="w-96 h-96 absolute bg-green-500/20 rounded-full blur-3xl -z-20 top-1/4 left-1/4"
            animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          ></motion.div>
          <motion.div
            className="w-96 h-96 absolute bg-sky-500/10 rounded-full blur-3xl -z-20 bottom-1/4 right-1/4"
            animate={{ y: [0, 20, 0], scale: [1, 0.95, 1] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 3,
            }}
          ></motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-200">
              LastMinute SCSIT
            </h1>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-50 via-gray-200 to-gray-500 mb-6 relative">
            {headline.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="inline-block mr-4"
              >
                {word}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4"
          >
            Empowering SCSIT students with a centralized platform for academic
            resources, study tools, and collaborative learning.
          </motion.p>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section
            title="By The Numbers"
            subtitle="Our impact on the SCSIT community"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 grid-rows-subgrid">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} index={index} />
              ))}
            </div>
          </Section>
          <Section
            title="Core Features"
            subtitle="Designed to streamline your academic journey"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  feature={feature}
                  index={index}
                  navigate={navigate}
                />
              ))}
            </div>
          </Section>
          <Section
            title="Our Values"
            subtitle="Principles that guide our development"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <ValueCard key={index} {...value} index={index} />
              ))}
            </div>
          </Section>
          <Section
            title="Meet the Developers"
            subtitle="The minds behind the platform"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {developers.map((dev, index) => (
                <DeveloperCard key={index} dev={dev} index={index} />
              ))}
            </div>
          </Section>

          <Section
            ref={reviewSectionRef}
            title="Share Your Feedback"
            subtitle="Have a suggestion or a word of appreciation? We'd love to hear from you!"
          >
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
                {user ? (
                  <form onSubmit={handleReviewSubmit}>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={`Hi ${user.name}, what's on your mind?`}
                      className="w-full h-32 p-4 bg-slate-700/50 rounded-lg border border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-300 text-white placeholder-gray-400"
                      required
                    />
                    <div className="mt-4 flex items-center gap-6">
                      {["Good", "Outstanding"].map((r) => (
                        <label
                          key={r}
                          className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white"
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
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${rating === r ? "border-green-500 bg-green-500" : "border-slate-600"}`}
                          >
                            {rating === r && (
                              <CheckCircle2 size={12} className="text-white" />
                            )}
                          </div>
                          {r}
                        </label>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm">
                        {reviewStatus.message && (
                          <p
                            className={
                              reviewStatus.type === "success"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {reviewStatus.message}
                          </p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={reviewStatus.loading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reviewStatus.loading
                          ? "Submitting..."
                          : "Submit Feedback"}
                        {!reviewStatus.loading && <Send size={18} />}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center">
                    <p className="text-lg text-gray-300 mb-6">
                      Please log in to post a review and share your thoughts
                      with the community.
                    </p>
                    <button
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                    >
                      Login to Continue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section
            title="My Testimonials"
            subtitle="Your feedback matters!"
          >
            <div className="max-w-5xl mx-auto">
              {isLoadingTestimonials ? (
                <div className="text-center text-gray-400">
                  Loading testimonials...
                </div>
              ) : testimonials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial._id}
                      testimonial={testimonial}
                      currentUser={user}
                      onEdit={() =>
                        setModalState({ type: "edit", data: testimonial })
                      }
                      onDelete={() =>
                        setModalState({ type: "delete", data: testimonial })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center bg-slate-800/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    No Testimonials Yet
                  </h3>
                  <p className="text-gray-400">
                    Be the first to share your experience. Post a review above!
                  </p>
                </div>
              )}
            </div>
          </Section>

          <Section
            title="Technology Stack"
            subtitle="Built with modern tools for optimal performance"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
              {techStack.map((tech, index) => (
                <TechIcon key={index} tech={tech} index={index} />
              ))}
            </div>
          </Section>
          <Section title="Our Journey" subtitle="Milestones in our development">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute left-1/2 top-0 h-full w-0.5 bg-slate-700 -translate-x-1/2 hidden md:block"></div>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <TimelineItem key={index} {...item} index={index} />
                ))}
              </div>
            </div>
          </Section>
          <Section title="Our Mission">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
                <Globe className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <p className="text-xl text-gray-300 mb-6">
                  "To eliminate the stress of finding academic resources and
                  create a single source of truth for every student at the
                  School of Computer Science & IT."
                </p>
                <p className="text-gray-400">
                  We believe in democratizing access to knowledge and fostering
                  a collaborative learning environment where students can thrive
                  academically. Our platform is designed to be intuitive,
                  comprehensive, and constantly evolving to meet the changing
                  needs of modern education.
                </p>
              </div>
            </div>
          </Section>
          <Section title="Get Started Today">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-12 border border-green-500/30">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Ready to transform your academic experience?
                </h3>
                <p className="text-gray-300 mb-8 text-lg">
                  Join thousands of SCSIT students who are already using our
                  platform to excel in their studies.
                </p>
                <button
                  onClick={() => navigate("/scsit/courses")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/20"
                >
                  Explore Resources <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>
      <EditModal
        isOpen={modalState.type === "edit"}
        onClose={() => setModalState({ type: null, data: null })}
        testimonial={modalState.data}
        onUpdate={handleUpdateTestimonial}
        user={user}
      />
      <DeleteModal
        isOpen={modalState.type === "delete"}
        onClose={() => setModalState({ type: null, data: null })}
        onConfirm={() => handleDeleteTestimonial(modalState.data._id)}
      />
    </div>
  );
};

export default AboutPage;
