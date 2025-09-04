"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
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
  Star,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ValuesContext } from "../context/ValuesContext";
import { useSwipeable } from "react-swipeable";
import { API_URL } from "../utils/urls";
import { useAuthStore } from "../store/authStore";
import React from "react";
import toast from "react-hot-toast";

const LoadingSpinner = ({ size = 20, className = "" }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className={className}
  >
    <Loader2 size={size} />
  </motion.div>
);

const StatCardSkeleton = () => (
  <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 animate-pulse">
    <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-4" />
    <div className="h-8 bg-slate-700 rounded mb-2" />
    <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto" />
  </div>
);

const Section = React.forwardRef(
  ({ title, children, subtitle, isLoading = false, ...props }, ref) => (
    <div ref={ref} className="py-16 md:py-24" {...props}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16"
      >
        <div className="relative inline-block">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-gray-300 relative z-10">
            {title}
          </h2>
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-cyan-500/20 blur-xl opacity-30"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-gray-400 max-w-3xl mx-auto text-base md:text-lg px-4"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-12"
          >
            <div className="flex items-center gap-3 text-green-400">
              <LoadingSpinner size={24} />
              <span className="text-lg">Loading...</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ),
);

const FeatureCard = ({ feature, index, navigate }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeInOut"
      }
    }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{
      scale: 1.025,
      transition: { duration: 0.2, ease: "circOut" }
    }}
    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/20"
  >
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(52,211,153,0.1),rgba(52,211,153,0)_40%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    <div className="absolute inset-0 -z-20 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900" />
    <div className="p-6 md:p-8 flex flex-col flex-grow">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:border-green-500/50 group-hover:bg-slate-800/60 group-hover:shadow-lg group-hover:shadow-green-500/20">
        <feature.icon className="h-7 w-7 text-green-400 transition-colors duration-300 group-hover:text-green-300" />
      </div>

      <div className="flex flex-grow flex-col">
        <h3 className="mb-3 text-xl font-bold text-slate-100 transition-colors duration-300 group-hover:text-white md:text-2xl">
          {feature.title}
        </h3>
        <p className="flex-grow text-sm leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300 md:text-base">
          {feature.description}
        </p>
      </div>

      {feature.href && (
        <motion.button
          onClick={() => navigate(feature.href)}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          className="group/btn mt-8 flex items-center gap-2 self-start font-semibold text-green-400 transition-colors duration-300 hover:text-green-300"
        >
          Explore
          <ArrowRight size={16} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
        </motion.button>
      )}
    </div>
  </motion.div>
);

const DeveloperCard = ({ dev, index }) => {
  const handleImageError = (e) => {
    const nameInitial = dev.name.charAt(0).toUpperCase();
    e.target.src = `https://placehold.co/200x200/1e293b/94a3b8?text=${nameInitial}`;
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-200, 200], [-8, 8]);
  const rotateY = useTransform(mouseX, [-200, 200], [8, -8]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: "easeOut"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full"
    >
      <div
        className="relative bg-slate-900/60 backdrop-blur-lg p-6 md:p-8 rounded-2xl text-center flex flex-col items-center h-full overflow-hidden transition-all duration-500 border border-slate-800/50 group hover:border-green-400/50 shadow-2xl shadow-slate-950/50 hover:shadow-green-500/10"
        style={{
          transform: "translateZ(8px)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-slate-900/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0" />

        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-300 font-semibold overflow-hidden backdrop-blur-sm">
          <motion.div
            style={{ transform: "translateZ(32px)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Star size={14} className="text-green-400 fill-green-500/30" />
          </motion.div>
          <span className="relative z-10">Creator</span>
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite] opacity-60" />
        </div>

        <motion.div
          className="relative z-10 mb-4"
          style={{ transform: "translateZ(40px)" }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <img
              className="w-28 h-28 md:w-32 md:h-32 rounded-full mx-auto border-4 border-slate-700 group-hover:border-green-400 transition-all duration-500 object-cover shadow-xl group-hover:shadow-green-500/30"
              src={dev.imageUrl}
              alt={`${dev.name}'s profile picture`}
              onError={handleImageError}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-green-400/50 opacity-0 group-hover:opacity-100"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 flex flex-col flex-grow items-center"
          style={{ transform: "translateZ(20px)" }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-white bg-gradient-to-r from-white via-green-100 to-slate-300 text-transparent bg-clip-text mb-2">
            {dev.name}
          </h3>
          <p className="text-green-400 font-medium mb-6 text-sm md:text-base">{dev.role}</p>

          <div className="flex gap-3 md:gap-4 mt-auto">
            {[
              { url: dev.linkedinUrl, icon: Linkedin, color: "blue", label: "LinkedIn" },
              { url: dev.githubUrl, icon: Github, color: "gray", label: "GitHub" },
              { url: `mailto:${dev.email}`, icon: Mail, color: "red", label: "Email" }
            ].map((social, idx) => (
              <motion.a
                key={idx}
                href={social.url}
                target={social.label !== "Email" ? "_blank" : undefined}
                rel={social.label !== "Email" ? "noopener noreferrer" : undefined}
                aria-label={`${dev.name}'s ${social.label}`}
                whileHover={{
                  scale: 1.1,
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 bg-slate-700/50 rounded-full border border-slate-600 hover:border-${social.color}-500/70 hover:bg-${social.color}-500/20 hover:shadow-lg hover:shadow-${social.color}-500/20 transition-all duration-300 backdrop-blur-sm group/social`}
              >
                <social.icon size={18} className={`text-gray-300 group-hover/social:text-${social.color}-400 transition-colors duration-300`} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const TechIcon = ({ tech, index }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{
      scale: 1.1,
      y: -5,
      transition: { duration: 0.2 }
    }}
    className="flex flex-col items-center group cursor-pointer"
  >
    <div className="h-16 w-16 md:h-20 md:w-20 mb-3 flex items-center justify-center transition-all duration-300 group-hover:scale-110 relative">
      {typeof tech.icon === "string" ? (
        <img
          src={tech.icon}
          alt={tech.name}
          className="h-12 w-12 md:h-16 md:w-16 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
        />
      ) : (
        <tech.icon className="w-12 h-12 md:w-16 md:h-16 text-gray-400 group-hover:text-green-400 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
      )}
      <motion.div
        className="absolute inset-0 bg-green-400/10 rounded-full opacity-0 group-hover:opacity-100"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
    <h4 className="font-semibold text-white transition-colors duration-300 group-hover:text-green-400 text-sm md:text-base text-center">
      {tech.name}
    </h4>
  </motion.div>
);

const StatCard = ({ icon: Icon, value, label, index, isLoading }) => {
  if (isLoading) {
    return <StatCardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{
        scale: 1.05,
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-slate-700/50 text-center group hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <motion.div
        className="w-12 h-12 md:w-16 md:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-green-500/30 transition-colors duration-300 relative"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
        <motion.div
          className="absolute inset-0 bg-green-400/20 rounded-full opacity-0 group-hover:opacity-100"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <motion.div
        className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2 relative z-10"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
      >
        {value}
      </motion.div>
      <div className="text-gray-400 text-sm md:text-base relative z-10">{label}</div>
    </motion.div>
  );
};

const ValueCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay: index * 0.15 }}
    whileHover={{
      scale: 1.02,
      y: -8,
      transition: { duration: 0.3 }
    }}
    className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700/50 text-center group hover:border-green-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10 relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <motion.div
      className="w-14 h-14 md:w-16 md:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-green-500/30 transition-colors duration-300 relative"
      whileHover={{ rotate: 360, scale: 1.1 }}
      transition={{ duration: 0.6 }}
    >
      <Icon className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
      <motion.div
        className="absolute inset-0 bg-green-400/20 rounded-full opacity-0 group-hover:opacity-100"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>

    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 group-hover:text-green-50 transition-colors duration-300 relative z-10">
      {title}
    </h3>
    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm md:text-base leading-relaxed relative z-10">
      {description}
    </p>
  </motion.div>
);

const TimelineItem = ({ year, title, description, index }) => (
  <div className="relative pl-8 md:pl-0 md:flex md:justify-center">
    <div className="md:w-1/2 md:pr-8 md:text-right">
      {index % 2 === 0 && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-slate-800/40 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-slate-700/50 mb-6 md:mb-0 hover:border-green-500/30 transition-all duration-300 group"
        >
          <div className="text-green-400 font-bold text-base md:text-lg mb-2 group-hover:text-green-300 transition-colors duration-300">
            {year}
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-green-50 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </motion.div>
      )}
    </div>
    <div className="absolute md:relative left-0 md:left-auto md:w-auto h-full md:h-auto flex items-center">
      <div className="h-full w-0.5 bg-slate-700 md:hidden"></div>
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 md:static md:translate-y-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 md:border-4 border-slate-900 z-10"
        whileInView={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
    </div>
    <div className="md:w-1/2 md:pl-8">
      {index % 2 !== 0 && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-slate-800/40 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-slate-700/50 mb-6 md:mb-0 hover:border-green-500/30 transition-all duration-300 group"
        >
          <div className="text-green-400 font-bold text-base md:text-lg mb-2 group-hover:text-green-300 transition-colors duration-300">
            {year}
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-green-50 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </motion.div>
      )}
    </div>
  </div>
);

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
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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
        "All academic resources organized by course and semester in one place for easy access.",
      href: "/scsit/courses",
    },
    {
      icon: Filter,
      title: "Advanced Search",
      description:
        "Find resources instantly with powerful search and intelligent filtering options.",
      href: "/allfiles",
    },
    {
      icon: Shield,
      title: "Secure Viewer",
      description:
        "Preview documents directly in browser with zoom, rotate, and download controls.",
      href: null,
    },
    {
      icon: Upload,
      title: "Community Driven",
      description:
        "Contribute and access resources uploaded by the vibrant student community.",
      href: "/upload",
    },
    {
      icon: Target,
      title: "Study Tools",
      description:
        "Integrated tools for CGPA calculation, attendance tracking, and academic planning.",
      href: "/calculations/tools/cgpa",
    },
    {
      icon: BookOpen,
      title: "Task Planner",
      description:
        "Organize your studies with built-in task management and deadline tracking.",
      href: "/planner/todos",
    },
    {
      icon: Users,
      title: "User Management",
      description:
        "Personalized dashboard and comprehensive profile management for each student.",
      href: "/profile",
    },
    {
      icon: FileChartPie,
      title: "Admin Dashboard",
      description: "Comprehensive administrative tools for content and user management.",
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
        "https://res.cloudinary.com/dbf1lifdi/image/upload/v1751438203/user_profiles/wpy4rxqhlb7dch0qgo7j.jpg",
    },
    {
      name: "Balram Dhakad",
      role: "Full-Stack Developer",
      linkedinUrl: "https://www.linkedin.com/in/balram-dhakad-2a9110210/",
      githubUrl: "https://github.com/balram2002",
      email: "bdhakad886@gmail.com",
      imageUrl:
        "https://avatars.githubusercontent.com/u/162151085?v=4",
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
        "Constantly evolving to meet student needs with cutting-edge solutions and modern technology.",
    },
    {
      icon: Heart,
      title: "Community",
      description:
        "Built by students, for students, fostering collaborative learning and knowledge sharing.",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "Commitment to providing the highest quality academic resources and user experience.",
    },
    {
      icon: TrendingUp,
      title: "Growth",
      description: "Empowering students to achieve their full academic potential and career goals.",
    },
  ];

  const timeline = [
    {
      year: "Dec 2024",
      title: "The Problem",
      description:
        "End-semester resource mismanagement highlighted the urgent need for a centralized academic platform.",
    },
    {
      year: "Feb 2025",
      title: "Planning & Design",
      description:
        "Conceptualized comprehensive platform architecture and intuitive user experience design.",
    },
    {
      year: "Jul 2025",
      title: "Development",
      description:
        "Started full-scale development with extensive beta testing among select students.",
    },
    {
      year: "Aug 2025",
      title: "Public Release",
      description: "Successfully launched stable version to the entire SCSIT community.",
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
    if (user) {
      fetchTestimonials();
    }
  }, [location, user]);

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
      setIsLoadingStats(true);
      try {
        const [usersResponse, filesResponse, testimonialsResponse] = await Promise.all([
          fetch(`${API_URL}/api/auth/fetchallusers`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))._id : ""}`,
            },
          }),
          fetch(`${API_URL}/api/files/allfiles`),
          fetch(`${API_URL}/api/testimonials/getalltestimonialsapproved`)
        ]);

        const [usersResult, filesResult, testimonialsResult] = await Promise.all([
          usersResponse.json(),
          filesResponse.json(),
          testimonialsResponse.json()
        ]);

        const usersCount = usersResult.success ? usersResult.users.length : 0;
        const filesCount = filesResult.success ? filesResult.data.length : 0;
        const testimonialsCount = testimonialsResult.success ? testimonialsResult.testimonials.length : 0;

        setStats([
          { icon: Files, value: filesCount.toString(), label: "Documents" },
          { icon: Users, value: usersCount.toString(), label: "Active Users" },
          { icon: GraduationCap, value: "13", label: "Courses" },
          {
            icon: MessageCircle,
            value: testimonialsCount.toString(),
            label: "Testimonials",
          },
          { icon: Calendar, value: "1", label: "Active Year" },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        toast.error("Failed to load statistics");
      } finally {
        setIsLoadingStats(false);
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
          message: "Thank you! Your feedback has been submitted for review.",
          type: "success",
        });
        setFeedback("");
        setRating("");
        fetchTestimonials();
        toast.success("Feedback submitted successfully!");
      } else {
        setReviewStatus({
          loading: false,
          message: result.message || "An error occurred while submitting feedback.",
          type: "error",
        });
        toast.error(result.message || "Failed to submit feedback");
      }
    } catch (error) {
      setReviewStatus({
        loading: false,
        message: "Server error. Please try again later.",
        type: "error",
      });
      toast.error("Server error. Please try again later.");
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
          content="Learn about the mission and technology behind LastMinute SCSIT, the comprehensive academic resource hub for SCSIT, Indore."
        />
        <meta name="keywords" content="SCSIT, academic resources, student platform, Indore, education" />
        <meta property="og:title" content="About Us - LastMinute SCSIT" />
        <meta property="og:description" content="Empowering SCSIT students with a centralized platform for academic resources, study tools, and collaborative learning." />
      </Helmet>

      <div className="absolute inset-0 -z-20 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="relative w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          onMouseMove={handleMouseMove}
          className="relative text-center pt-32 md:pt-40 pb-24 md:pb-32 flex flex-col items-center justify-center overflow-hidden px-4"
        >
          <motion.div
            style={{
              x: useTransform(mouseX, [0, 1], [-30, 30]),
              y: useTransform(mouseY, [0, 1], [-30, 30]),
            }}
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_#10b98122,_transparent_70%)]"
          />

          <motion.div
            className="w-72 h-72 md:w-96 md:h-96 absolute bg-green-500/20 rounded-full blur-3xl -z-20 top-1/4 left-1/4"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />

          <motion.div
            className="w-72 h-72 md:w-96 md:h-96 absolute bg-emerald-500/10 rounded-full blur-3xl -z-20 bottom-1/4 right-1/4"
            animate={{
              y: [0, 40, 0],
              scale: [1, 0.9, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
              ease: "easeInOut"
            }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <motion.div
              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/40"
              whileHover={{
                scale: 1.1,
                rotate: 360,
                shadow: "0 0 30px rgba(16, 185, 129, 0.6)"
              }}
              transition={{ duration: 0.6 }}
            >
              <Code className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-200">
              LastMinute SCSIT
            </h1>
          </motion.div>

          <h2 className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-50 via-gray-200 to-gray-500 mb-6 relative">
            {headline.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.4 + i * 0.2,
                  ease: "easeOut"
                }}
                className="inline-block mr-2 md:mr-4"
              >
                {word}
              </motion.span>
            ))}

            <motion.div
              className="absolute -top-4 -right-4 text-green-400"
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles size={24} />
            </motion.div>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-base md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Empowering SCSIT students with a centralized platform for academic
            resources, study tools, and collaborative learning experiences.
          </motion.p>

          <motion.button
            onClick={() => navigate("/scsit/courses")}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/25"
          >
            Get Started Today
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
          </motion.button>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section
            title="By The Numbers"
            subtitle="Our growing impact on the SCSIT community"
            isLoading={isLoadingStats}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  {...stat}
                  index={index}
                  isLoading={isLoadingStats}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Core Features"
            subtitle="Comprehensive tools designed to streamline your academic journey"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
            subtitle="Core principles that guide our development and vision"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {values.map((value, index) => (
                <ValueCard key={index} {...value} index={index} />
              ))}
            </div>
          </Section>

          <Section
            title="Meet the Developers"
            subtitle="The passionate minds behind this innovative platform"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {developers.map((dev, index) => (
                <DeveloperCard key={index} dev={dev} index={index} />
              ))}
            </div>
          </Section>

          <Section
            ref={reviewSectionRef}
            title="Share Your Feedback"
            subtitle="Your thoughts and suggestions help us improve the platform for everyone"
          >
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-50" />

                {user ? (
                  <form onSubmit={handleReviewSubmit} className="relative z-10">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Feedback
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={`Hi ${user.name}, share your thoughts about the platform...`}
                        className="w-full h-32 p-4 bg-slate-700/50 rounded-lg border border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-white placeholder-gray-400 resize-none"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Rate Your Experience
                      </label>
                      <div className="flex items-center gap-6">
                        {["Good", "Outstanding"].map((r) => (
                          <motion.label
                            key={r}
                            className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${rating === r
                                  ? "border-green-500 bg-green-500 shadow-lg shadow-green-500/30"
                                  : "border-slate-600 hover:border-green-400"
                                }`}
                            >
                              {rating === r && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <CheckCircle2 size={12} className="text-white" />
                                </motion.div>
                              )}
                            </div>
                            <span className="select-none">{r}</span>
                          </motion.label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        {reviewStatus.message && (
                          <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={
                              reviewStatus.type === "success"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {reviewStatus.message}
                          </motion.p>
                        )}
                      </div>
                      <motion.button
                        type="submit"
                        disabled={reviewStatus.loading || !feedback.trim()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
                      >
                        {reviewStatus.loading ? (
                          <>
                            <LoadingSpinner size={18} />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Feedback
                            <Send size={18} />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center relative z-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <MessageSquare className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-300 mb-6">
                        Please log in to share your feedback and help us improve the platform
                        for the entire community.
                      </p>
                      <motion.button
                        onClick={() => navigate("/login")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/25"
                      >
                        Login to Continue
                        <ArrowRight size={18} />
                      </motion.button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section
            title="Technology Stack"
            subtitle="Built with cutting-edge tools for optimal performance and scalability"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 md:gap-8">
              {techStack.map((tech, index) => (
                <TechIcon key={index} tech={tech} index={index} />
              ))}
            </div>
          </Section>

          <Section
            title="Our Journey"
            subtitle="Key milestones in our platform development and growth"
          >
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-green-500 via-slate-700 to-green-500 -translate-x-1/2 hidden md:block" />
              <div className="space-y-6 md:space-y-8">
                {timeline.map((item, index) => (
                  <TimelineItem key={index} {...item} index={index} />
                ))}
              </div>
            </div>
          </Section>

          <Section title="Our Mission">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700/50 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-50" />

                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                >
                  <Globe className="w-14 h-14 md:w-16 md:h-16 text-green-400 mx-auto mb-6" />
                </motion.div>

                <blockquote className="text-lg md:text-xl text-gray-300 mb-6 italic relative z-10">
                  "To eliminate the stress of finding academic resources and
                  create a single source of truth for every student at the
                  School of Computer Science & IT."
                </blockquote>

                <p className="text-gray-400 text-sm md:text-base leading-relaxed relative z-10">
                  We believe in democratizing access to knowledge and fostering
                  a collaborative learning environment where students can thrive
                  academically. Our platform is designed to be intuitive,
                  comprehensive, and constantly evolving to meet the changing
                  needs of modern education.
                </p>
              </motion.div>
            </div>
          </Section>

          <Section title="Get Started Today">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-green-500/30 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />

                <motion.div
                  className="relative z-10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Ready to transform your academic experience?
                  </h3>
                  <p className="text-gray-300 mb-8 text-base md:text-lg leading-relaxed">
                    Join thousands of SCSIT students who are already using our
                    platform to excel in their studies and achieve their goals.
                  </p>
                  <motion.button
                    onClick={() => navigate("/scsit/courses")}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 25px 50px rgba(16, 185, 129, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-xl shadow-green-500/25"
                  >
                    Explore Resources
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </motion.button>
                </motion.div>

                <motion.div
                  className="absolute top-4 right-4 text-green-400/30"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles size={24} />
                </motion.div>

                <motion.div
                  className="absolute bottom-4 left-4 text-emerald-400/20"
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                >
                  <Code size={28} />
                </motion.div>
              </motion.div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
