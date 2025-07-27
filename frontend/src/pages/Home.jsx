"use client"

import { useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { Upload, FileText, Users, ListTodo, Calculator, CheckSquare, ArrowRight, Sparkles, Star } from "lucide-react"
import { useContext, useEffect, useRef } from "react"
import { Helmet } from 'react-helmet-async';
import { useSwipeable } from "react-swipeable"
import { ValuesContext } from "../context/ValuesContext"

const HomePage = () => {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const features = [
    {
      id: 1,
      title: "Access Question Papers",
      description: "Explore a comprehensive collection of previous year question papers for MCA and other programs at SCSIT, Indore.",
      icon: FileText,
      path: "/scsit/courses",
      linkText: "Browse Courses",
      gradient: "from-blue-500 to-cyan-500",
      delay: 0.1
    },
    {
      id: 2,
      title: "Upload Documents",
      description: "Contribute to the community by uploading question papers and study materials to help fellow students.",
      icon: Upload,
      path: "/upload",
      linkText: "Upload Now",
      gradient: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      id: 3,
      title: "About This Website",
      description: "Learn more about our mission to provide a centralized hub for academic resources for all students at SCSIT, Indore.",
      icon: Users,
      path: "/about",
      linkText: "Learn More",
      gradient: "from-orange-500 to-red-500",
      delay: 0.3
    },
    {
      id: 4,
      title: "Attendance Manager",
      description: "Easily track your attendance for each subject and receive timely alerts to stay on top of your academic requirements.",
      icon: CheckSquare,
      path: "/tools/attendance-manager",
      linkText: "Track Attendance",
      gradient: "from-green-500 to-emerald-500",
      delay: 0.4
    },
    {
      id: 5,
      title: "Advanced Tools",
      description: "Calculate your CGPA, SGPA, attendance, and percentages with our suite of powerful scientific and academic calculators.",
      icon: Calculator,
      path: "/calculations/tools/scientific",
      linkText: "Access Tools",
      gradient: "from-indigo-500 to-purple-500",
      delay: 0.5
    },
    {
      id: 6,
      title: "Task Planner",
      description: "Organize your assignments, projects, and study schedule with an intuitive task planner to boost your productivity.",
      icon: ListTodo,
      path: "/planner/todos",
      linkText: "Organize Tasks",
      gradient: "from-teal-500 to-cyan-500",
      delay: 0.6
    },
  ];

  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
  
  const isExcludedRoute = location.pathname.startsWith("/login") || location.pathname === "/signup";
  const isMobile = window.innerWidth <= 768;
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !isExcludedRoute) {
        setIsSidebarOpen(true);
      }
    },
    onSwipedRight: () => {
      if (isMobile && !isExcludedRoute && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 30,
  });

  return (
    <div ref={containerRef} {...swipeHandlers} className="min-h-screen w-full relative overflow-hidden mt-18">
      <Helmet>
        <title>lastMinuteSCSIT - Home</title>
        <meta name="description" content="Access and share previous year question papers and study resources for SCSIT, Indore." />
      </Helmet>

      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <motion.div 
          style={{ y }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-emerald-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        </motion.div>
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_40%,transparent)]" />
        
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div style={{ opacity }} className="w-full max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Your Academic Success Partner</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                LastMinute{" "}
              </span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
                SCSIT
              </span>
            </span>
            
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-cyan-400/20 blur-3xl" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Your comprehensive platform for accessing and sharing previous year question papers and study resources for the School of Computer Science and Information Technology, Indore.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/scsit/courses")}
              className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl overflow-hidden shadow-lg hover:shadow-green-500/25 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore Courses
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/upload")}
              className="group px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-bold rounded-xl border border-white/10 hover:border-green-500/50 hover:bg-white/10 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Papers
              </span>
            </motion.button>
          </motion.div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-white/40 rounded-full mt-2" />
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
                Why Choose lastMinuteSCSIT?
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to excel in your academic journey, all in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  className="group relative"
                >
                  <div className="relative h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative p-8">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-400 mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <button
                        onClick={() => navigate(feature.path)}
                        className={`inline-flex items-center gap-2 text-white font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}
                      >
                        {feature.linkText}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500`} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-3xl border border-green-500/20 p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5" />
            
            <div className="relative z-10">
              <Star className="w-12 h-12 text-green-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Excel in Your Studies?
              </h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already benefiting from our comprehensive collection of resources.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/scsit/courses")}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300"
              >
                Get Started Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HomePage