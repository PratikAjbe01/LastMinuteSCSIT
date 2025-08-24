"use client"

import { motion, AnimatePresence, stagger, useInView } from "framer-motion"
import { BookOpen, FileText, GraduationCap, Code, Laptop, Briefcase, School, Shield } from "lucide-react"
import { useContext, useEffect, useCallback, useMemo, useRef } from "react"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"
import { useSwipeable } from "react-swipeable"
import { ValuesContext } from "../context/ValuesContext"

const Courses = () => {
  const navigate = useNavigate()
  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext)
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  const courses = useMemo(() => [
    {
      id: 1,
      title: "BCA",
      description: "Foundational program in programming, databases, and software development.",
      icon: Laptop,
      duration: "3 Years",
      slug: "bca",
      category: "undergraduate"
    },
    {
      id: 2,
      title: "MCA",
      description: "Advanced study in software engineering, system design, and IT management.",
      icon: Code,
      duration: "2 Years",
      slug: "mca",
      category: "postgraduate"
    },
    {
      id: 3,
      title: "BCA Integrated",
      description: "A comprehensive program combining undergraduate and postgraduate IT studies.",
      icon: BookOpen,
      duration: "4 Years",
      slug: "bca_int",
      category: "integrated"
    },
    {
      id: 4,
      title: "M.Sc. Integrated (CS)",
      description: "5-year integrated science program specializing in Cyber Security.",
      icon: Shield,
      duration: "5 Years",
      slug: "msc_int_cs",
      category: "integrated"
    },
    {
      id: 5,
      title: "M.Tech(CS)",
      description: "Core postgraduate engineering program in Computer Science.",
      icon: FileText,
      duration: "2 Years",
      slug: "mtech_cs",
      category: "postgraduate"
    },
    {
      id: 6,
      title: "M.Tech(CS) Executive",
      description: "Specialized M.Tech for working professionals in Computer Science.",
      icon: Briefcase,
      duration: "2 Years",
      slug: "mtech_cs_exec",
      category: "executive"
    },
    {
      id: 7,
      title: "M.Tech(NM & IS)",
      description: "Specialization in Network Management & Information Security.",
      icon: FileText,
      duration: "2 Years",
      slug: "mtech_nm_is",
      category: "postgraduate"
    },
    {
      id: 8,
      title: "M.Tech(IA & SE)",
      description: "Specialization in Information Architecture & Software Engineering.",
      icon: FileText,
      duration: "2 Years",
      slug: "mtech_ia_se",
      category: "postgraduate"
    },
    {
      id: 9,
      title: "M.Sc. (CS)",
      description: "Postgraduate science degree focusing on Computer Science concepts.",
      icon: School,
      duration: "2 Years",
      slug: "msc_cs",
      category: "postgraduate"
    },
    {
      id: 10,
      title: "M.Sc. (IT)",
      description: "Postgraduate science degree focusing on Information Technology.",
      icon: School,
      duration: "2 Years",
      slug: "msc_it",
      category: "postgraduate"
    },
    {
      id: 11,
      title: "MBA (CM)",
      description: "Management degree with a specialization in Computer Management.",
      icon: Briefcase,
      duration: "2 Years",
      slug: "mba_cm",
      category: "management"
    },
    {
      id: 12,
      title: "PGDCA",
      description: "Post Graduate Diploma covering fundamentals of computer applications.",
      icon: Laptop,
      duration: "1 Year",
      slug: "pgdca",
      category: "diploma"
    },
    {
      id: 13,
      title: "PhD",
      description: "Doctoral program for advanced research in computer science and IT.",
      icon: GraduationCap,
      duration: "As per UGC norms",
      slug: "phd",
      category: "doctoral"
    },
  ], [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleCourseClick = useCallback((slug) => {
    navigate(`/scsit/${slug}/semesters`)
  }, [navigate])

  const isExcludedRoute = location.pathname.startsWith("/login") || location.pathname === "/signup"
  const isMobile = window.innerWidth <= 768
  
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !isExcludedRoute) {
        setIsSidebarOpen(true)
      }
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 30,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.4
      }
    }
  }

  const iconVariants = {
    rest: { 
      scale: 1,
      rotate: 0,
      transition: { duration: 0.2 }
    },
    hover: { 
      scale: 1.1,
      rotate: 5,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  }

  const CourseCard = ({ course, index }) => {
    const IconComponent = course.icon
    
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        whileHover={{ 
          scale: 1.03, 
          y: -8,
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        whileTap={{ scale: 0.98 }}
        className="group bg-gray-800/60 backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer border border-gray-700/50 hover:border-green-500/70 transition-all duration-300 h-full flex flex-col shadow-xl hover:shadow-green-500/10"
        onClick={() => handleCourseClick(course.slug)}
      >
        <div className="p-6 text-center flex-1 flex flex-col justify-between">
          <div>
            <motion.div 
              className="mb-6"
              initial="rest"
              whileHover="hover"
              variants={iconVariants}
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/30 transition-all duration-300">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.h3 
              className="text-xl font-bold mb-3 text-white group-hover:text-green-400 transition-colors duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {course.title}
            </motion.h3>

            <motion.p 
              className="text-gray-300 mb-4 leading-relaxed text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {course.description}
            </motion.p>
          </div>

          <motion.div 
            className="flex items-center justify-center space-x-2 text-green-400 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span>Duration: {course.duration}</span>
          </motion.div>
        </div>

        <motion.div 
          className="px-6 py-3 bg-gray-900/60 backdrop-blur-sm"
          whileHover={{ backgroundColor: "rgba(17, 24, 39, 0.8)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-full py-2 text-center text-green-400 font-semibold group-hover:text-green-300 transition-colors flex items-center justify-center gap-2">
            <span>View Semesters</span>
            <motion.span
              className="inline-block"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              →
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 pt-14">
      <Helmet>
        <title>Courses - LastMinute SCSIT</title>
        <meta name="description" content="Explore the diverse range of courses offered at LastMinute SCSIT." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-16">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <motion.h1
              className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text tracking-tight sm:text-4xl lg:text-5xl mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              School of Computer Science and Information Technology, Indore
            </motion.h1>
            
            <motion.p
              className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover our diverse range of programs designed to empower students with cutting-edge skills in computer science and IT at SCSIT, Indore.
            </motion.p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Courses