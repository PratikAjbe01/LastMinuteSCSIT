"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Users,
  ListTodo,
  Calculator,
  CheckSquare,
  ArrowRight,
  Sparkles,
  Star,
  Settings,
  Keyboard,
  Smartphone,
  MoveLeft,
  MoveRight,
  Home,
  Eye,
} from "lucide-react";
import { useContext, useEffect, useMemo, useCallback, memo } from "react";
import { Helmet } from "react-helmet-async";
import { useSwipeable } from "react-swipeable";
import { ValuesContext } from "../context/ValuesContext";
import { EditProfileModal } from "../components/EditProfileModal";
import { useState } from "react";
import Testimonials from "../components/Testimonials";
import { useAuthStore } from "../store/authStore";

const FloatingParticle = memo(({ style, animationProps }) => (
  <motion.div
    className="absolute w-1 h-1 bg-green-400/80 rounded-full"
    style={style}
    animate={animationProps.animate}
    transition={animationProps.transition}
  />
));

const FeatureCard = memo(({ feature, onNavigate }) => {
  const IconComponent = feature.icon;

  const handleClick = useCallback(() => {
    onNavigate(feature.path);
  }, [feature.path, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: feature.delay }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8, transition: { duration: 0.2, ease: "easeOut" } }}
      className="group relative will-change-transform"
    >
      <div className="relative h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors duration-200">
        <div className="relative p-8">
          <div
            className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200`}
          >
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            {feature.title}
          </h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            {feature.description}
          </p>
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all duration-200"
          >
            <span className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
              {feature.linkText}
            </span>
            <ArrowRight className="w-5 h-5 text-green-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

const ShortcutItem = memo(({ shortcut }) => (
  <div className="flex justify-between items-center p-3 bg-gray-500/10 rounded-lg transition-colors hover:bg-gray-500/20 duration-200">
    <span className="text-gray-300">{shortcut.action}</span>
    <kbd className="px-2 py-1.5 text-xs font-sans font-semibold text-gray-300 bg-gray-500/20 border border-gray-500/30 rounded-md">
      {shortcut.keys}
    </kbd>
  </div>
));

const HomePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const handleEditModalClose = useCallback(() => {
    setEditModalOpen(false);
  }, []);

  const handleEditModalOpen = useCallback(() => {
    setEditModalOpen(true);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const features = useMemo(
    () => [
      {
        id: 1,
        title: "Access Question Papers",
        description:
          "Explore a comprehensive collection of previous year question papers for MCA and other programs at SCSIT, Indore.",
        icon: FileText,
        path: "/scsit/courses",
        linkText: "Browse Courses",
        gradient: "from-blue-500 to-cyan-500",
        delay: 0.1,
      },
      {
        id: 2,
        title: "Upload Documents",
        description:
          "Contribute to the community by uploading question papers and study materials to help fellow students.",
        icon: Upload,
        path: "/upload",
        linkText: "Upload Now",
        gradient: "from-purple-500 to-pink-500",
        delay: 0.2,
      },
      {
        id: 3,
        title: "About This Website",
        description:
          "Learn more about our mission to provide a centralized hub for academic resources for all students at SCSIT, Indore.",
        icon: Users,
        path: "/about",
        linkText: "Learn More",
        gradient: "from-orange-500 to-red-500",
        delay: 0.3,
      },
      // {
      //   id: 4,
      //   title: "Attendance Manager",
      //   description:
      //     "Easily track your attendance for each subject and receive timely alerts to stay on top of your academic requirements.",
      //   icon: CheckSquare,
      //   path: "/tools/attendance-manager",
      //   linkText: "Track Attendance",
      //   gradient: "from-green-500 to-emerald-500",
      //   delay: 0.4,
      // },
      {
        id: 5,
        title: "Advanced Tools",
        description:
          "Calculate your CGPA, SGPA, attendance, and percentages with our suite of powerful scientific and academic calculators.",
        icon: Calculator,
        path: "/calculations/tools/scientific",
        linkText: "Access Tools",
        gradient: "from-indigo-500 to-purple-500",
        delay: 0.5,
      },
      // {
      //   id: 6,
      //   title: "Task Planner",
      //   description:
      //     "Organize your assignments, projects, and study schedule with an intuitive task planner to boost your productivity.",
      //   icon: ListTodo,
      //   path: "/planner/todos",
      //   linkText: "Organize Tasks",
      //   gradient: "from-teal-500 to-cyan-500",
      //   delay: 0.6,
      // },
    ],
    [],
  );

  const isExcludedRoute =
    location.pathname.startsWith("/login") || location.pathname === "/signup";

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isSidebarOpen && !isExcludedRoute) {
        setIsSidebarOpen(true);
      }
    },
    onSwipedRight: () => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      } else if (!isExcludedRoute && user?.course && user?.semester) {
        navigate(`/scsit/${user.course}/semesters/${user.semester}`);
      } else if (!user?.course || !user?.semester) {
        navigate("/scsit/mca/semesters/3");
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 60,
  });

  const floatingParticles = useMemo(
    () =>
      [...Array(85)].map((_, i) => {
        const animationProps = {
          animate: {
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          },
          transition: {
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }
        };

        return (
          <FloatingParticle
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animationProps={animationProps}
          />
        );
      }),
    [],
  );

  const desktopShortcuts = useMemo(() => [
    { keys: "Ctrl + S", action: "Toggle Sidebar" },
    { keys: "Ctrl + P", action: "View All Programs" },
    { keys: "Ctrl + U", action: "Upload a File", admin: true },
    { keys: "Ctrl + A", action: "Explore All Files" },
    {
      keys: "Ctrl + Q",
      action: "Open tools page with CGPA Calculator as default",
    },
    { keys: "Ctrl + H", action: "Return to Home" },
    { keys: "Ctrl + L", action: "View Leaderboard" },
  ], []);

  const filteredShortcuts = useMemo(() =>
    desktopShortcuts.filter(sc =>
      (!sc.auth || (sc.auth && user?._id)) &&
      (!sc.admin || (sc.admin && user?.role === "admin"))
    ), [desktopShortcuts, user]
  );

  return (
    <>
      <div
        {...swipeHandlers}
        className="min-h-screen w-full relative bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 z-0 overflow-x-hidden"
      >
        <Helmet>
          <title>lastMinuteSCSIT - Home</title>
          <meta
            name="description"
            content="Access and share previous year question papers and study resources for SCSIT, Indore."
          />
        </Helmet>

        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0" />
          {/* <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900 to-emerald-900/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent" />
          </div> */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_40%,transparent)]" />
          <div className="absolute inset-0">{floatingParticles}</div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-1">
          <div className="w-full max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/15 to-emerald-500/15 backdrop-filter backdrop-blur-xl border border-green-500/30 rounded-full mb-8 shadow-lg"
            >
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-300 font-semibold tracking-wide">
                Your Academic Success Partner
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 text-transparent bg-clip-text drop-shadow-lg">
                  LastMinute{" "}
                </span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text drop-shadow-lg">
                  SCSIT
                </span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-cyan-400/20 blur-3xl" />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light"
            >
              Your comprehensive platform for accessing and sharing previous
              year question papers and study resources for the School of
              Computer Science and Information Technology, Indore.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 flex flex-col sm:flex-row gap-6 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/scsit/courses")}
                className="group relative px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl overflow-hidden shadow-2xl hover:shadow-green-500/20 transition-all duration-200"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Explore Courses
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/upload")}
                className="group px-10 py-4 bg-white/10 backdrop-filter backdrop-blur-xl text-white font-bold rounded-2xl border border-white/20 hover:border-green-500/50 hover:bg-white/15 transition-all duration-200 shadow-lg"
              >
                <span className="flex items-center justify-center gap-3">
                  <Upload className="w-5 h-5" />
                  Upload Papers
                </span>
              </motion.button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
            >
              <div className="w-1 h-3 bg-green-400/60 rounded-full mt-2" />
            </motion.div>
          </motion.div>
        </div>

        <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                  Why Choose lastMinuteSCSIT?
                </span>
              </h2>
              <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
                Everything you need to excel in your academic journey, all in
                one place.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                  See It in Action
                </span>
              </h2>
              <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
                Watch a quick overview of how LastMinuteSCSIT helps you stay
                organized and prepared for your exams.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative bg-gray-800/30 backdrop-filter backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl shadow-green-500/5 overflow-hidden"
            >
              <div
                className="relative w-full overflow-hidden rounded-3xl"
                style={{ paddingTop: "56.25%" }}
              >
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-3xl"
                  src="https://www.youtube.com/embed/StnOGs-kOiE?autoplay=1&mute=1&rel=0"
                  title="LastMinuteSCSIT video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>

        <Testimonials />

        <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                  Navigate Like a Pro
                </span>
              </h2>
              <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
                Use these handy shortcuts and gestures to master the platform and speed up your workflow.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <Keyboard className="w-8 h-8 text-green-400" />
                  <h3 className="text-3xl font-bold text-white">
                    Desktop Shortcuts
                  </h3>
                </div>
                <div className="space-y-8">
                  <div className="relative p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Settings className="w-6 h-6 text-green-400" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg flex items-center gap-2">
                          Quick Dashboard
                          <kbd className="px-2 py-1 text-xs font-sans font-semibold text-gray-300 bg-gray-500/20 border border-gray-500/30 rounded-md hover:bg-gray-500/40 transition-colors">
                            Ctrl + D
                          </kbd>
                        </h4>
                        <p className="text-gray-400 text-sm mt-1">
                          Access Your current Course/semester
                          {`${user?.course ? ", in your case " + user?.course + " - Sem " + user?.semester : ""}`}
                          files directly.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleEditModalOpen}
                      className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg text-sm hover:bg-green-600 transition-colors duration-200"
                    >
                      Set Course/Semester
                    </button>
                  </div>

                  <div className="relative p-6 bg-gradient-to-br from-blue-500/10 to-sky-500/10 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-lg">
                        Files Page Navigation
                      </h4>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-300">Jump to subject by index</p>
                        <div className="flex items-center gap-1.5">
                          <kbd className="px-2 py-1 text-xs font-sans font-semibold text-gray-300 bg-gray-500/20 border border-gray-500/30 rounded-md hover:bg-gray-500/40 transition-colors">Shift</kbd>
                          <span>+</span>
                          <kbd className="px-2 py-1 text-xs font-sans font-semibold text-gray-300 bg-gray-500/20 border border-gray-500/30 rounded-md hover:bg-gray-500/40 transition-colors">1-9</kbd>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-300">Cycle through subjects</p>
                        <kbd className="px-2 py-1 text-xs font-sans font-semibold text-gray-300 bg-gray-500/20 border border-gray-500/30 rounded-md hover:bg-gray-500/40 transition-colors">a - z</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-300">Go to Common Files</p>
                        <kbd className="px-2 py-1 text-xs font-sans font-semibold text-gray-300 bg-gray-500/20 border border-gray-500/30 rounded-md hover:bg-gray-500/40 transition-colors">Ctrl + C</kbd>
                      </div>
                    </div>
                  </div>

                  <div className="relative p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <Eye className="w-6 h-6 text-orange-400" />
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-lg">
                        File Viewer Controls
                      </h4>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-300">Open/Close the Hide UI button</p>
                        <kbd className="px-2 py-1 text-xs font-sans font-semibold text-gray-300 bg-gray-500/20 border border-gray-500/30 rounded-md hover:bg-gray-500/40 transition-colors">Ctrl + V</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-300">Clicking on Hide UI button will give seamless view experience</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Home className="w-6 h-6 text-purple-400" />
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-lg">
                        Homepage Shortcuts
                      </h4>
                    </div>
                    <div className="space-y-4 text-sm">
                      {filteredShortcuts.map((sc) => (
                        <div key={sc.action} className="flex items-center justify-between">
                          <p className="text-gray-300">{sc.action}</p>
                          <kbd className="px-2 py-1 text-xs font-sans font-semibold text-gray-300 bg-gray-500/20 border border-gray-500/30 rounded-md hover:bg-gray-500/40 transition-colors">{sc.keys}</kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <Smartphone className="w-8 h-8 text-cyan-400" />
                  <h3 className="text-3xl font-bold text-white">
                    Mobile Gestures
                  </h3>
                </div>
                <div className="space-y-8">
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-2">
                      <MoveLeft className="w-7 h-7 text-cyan-400" />
                      <h4 className="font-bold text-white text-lg">
                        Swipe Left to Open Sidebar
                      </h4>
                    </div>
                    <p className="text-gray-400 pl-11">
                      From the homepage, swipe left to quickly open the navigation menu.
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-2">
                      <MoveRight className="w-7 h-7 text-cyan-400" />
                      <h4 className="font-bold text-white text-lg">
                        Swipe Right for Actions
                      </h4>
                    </div>
                    <ul className="list-disc list-inside text-gray-400 space-y-2 pl-11">
                      <li>
                        <span className="font-semibold text-gray-300">
                          If sidebar is open:
                        </span>
                        closes the sidebar.
                      </li>
                      <li>
                        <span className="font-semibold text-gray-300">
                          If on homepage:
                        </span>
                        goes to your current semester papers.
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-5xl mx-auto text-center"
          >
            <div className="relative bg-gradient-to-r from-green-500/15 to-emerald-500/15 backdrop-filter backdrop-blur-xl rounded-3xl border border-green-500/30 p-10 md:p-16 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5" />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block"
                >
                  <Star className="w-16 h-16 text-green-400 mx-auto mb-8" />
                </motion.div>
                <h3 className="text-4xl font-bold text-white mb-6">
                  Ready to Excel in Your Studies?
                </h3>
                <p className="text-gray-300 text-lg mb-10 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of students who are already benefiting from our
                  comprehensive collection of resources and advanced academic
                  tools.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/scsit/courses")}
                  className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-green-500/20 transition-all duration-200 text-lg"
                >
                  Get Started Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {editModalOpen && (
        <EditProfileModal
          isOpen={editModalOpen}
          onClose={handleEditModalClose}
        />
      )}
    </>
  );
};

export default HomePage;