"use client"

import { motion } from "framer-motion"
import { BookOpen, FileText, GraduationCap, Code, Laptop, Briefcase, School, Shield } from "lucide-react"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"

const Courses = () => {

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])
  
  const courses = [
    {
      id: 1,
      title: "BCA",
      description: "Foundational program in programming, databases, and software development.",
      icon: Laptop,
      duration: "3 Years",
      slug: "bca",
    },
    {
      id: 2,
      title: "MCA",
      description: "Advanced study in software engineering, system design, and IT management.",
      icon: Code,
      duration: "2 Years",
      slug: "mca",
    },
    {
      id: 3,
      title: "BCA Integrated",
      description: "A comprehensive program combining undergraduate and postgraduate IT studies.",
      icon: BookOpen,
      duration: "4 Years",
      slug: "bca_int",
    },
    {
      id: 4,
      title: "M.Sc. Integrated (CS)",
      description: "5-year integrated science program specializing in Cyber Security.",
      icon: Shield,
      duration: "5 Years",
      slug: "msc_int_cs",
    },
    {
      id: 5,
      title: "M.Tech(CS)",
      description: "Core postgraduate engineering program in Computer Science.",
      icon: FileText,
      duration: "2 Years",
      slug: "mtech_cs",
    },
    {
      id: 6,
      title: "M.Tech(CS) Executive",
      description: "Specialized M.Tech for working professionals in Computer Science.",
      icon: Briefcase,
      duration: "2 Years",
      slug: "mtech_cs_exec",
    },
    {
      id: 7,
      title: "M.Tech(NM & IS)",
      description: "Specialization in Network Management & Information Security.",
      icon: FileText,
      duration: "2 Years",
      slug: "mtech_nm_is",
    },
    {
      id: 8,
      title: "M.Tech(IA & SE)",
      description: "Specialization in Information Architecture & Software Engineering.",
      icon: FileText,
      duration: "2 Years",
      slug: "mtech_ia_se",
    },
    {
      id: 9,
      title: "M.Sc. (CS)",
      description: "Postgraduate science degree focusing on Computer Science concepts.",
      icon: School,
      duration: "2 Years",
      slug: "msc_cs",
    },
    {
      id: 10,
      title: "M.Sc. (IT)",
      description: "Postgraduate science degree focusing on Information Technology.",
      icon: School,
      duration: "2 Years",
      slug: "msc_it",
    },
    {
      id: 11,
      title: "MBA (CM)",
      description: "Management degree with a specialization in Computer Management.",
      icon: Briefcase,
      duration: "2 Years",
      slug: "mba_cm",
    },
    {
      id: 12,
      title: "PGDCA",
      description: "Post Graduate Diploma covering fundamentals of computer applications.",
      icon: Laptop,
      duration: "1 Year",
      slug: "pgdca",
    },
    {
      id: 13,
      title: "PhD",
      description: "Doctoral program for advanced research in computer science and IT.",
      icon: GraduationCap,
      duration: "As per UGC norms",
      slug: "phd",
    },
  ]

  const navigate  = useNavigate();

  return (
    <div className="min-h-full w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center justify-center p-0 pb-8 pt-16">
     <Helmet>
        <title>Courses - LastMinute SCSIT</title>
        <meta name="description" content="Explore the diverse range of courses offered at LastMinute SCSIT." />
      </Helmet>
      <div className="w-full h-full flex flex-col flex-1">
        <div className="text-center mb-12 mt-12 px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text tracking-tight sm:text-4xl md:text-5xl"
          >
            School of Computer Science and Information Technology, Indore
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-300 max-w-3xl mx-auto mt-4 md:text-xl"
          >
            Discover our diverse range of programs designed to empower students with cutting-edge skills in computer science and IT at SCSIT, Indore.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-8 flex-1">
          {courses.map((course, index) => {
            const IconComponent = course.icon
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer border border-gray-700 hover:border-green-500 transition-all duration-300 h-full flex flex-col justify-between"
                onClick={() => {navigate(`/scsit/${course.slug}/semesters`)}}
              >
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-white">{course.title}</h3>

                  <p className="text-gray-300 mb-4 leading-relaxed">{course.description}</p>

                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <span className="text-sm font-medium">Duration: {course.duration}</span>
                  </div>
                </div>

                <div className="px-8 py-4 bg-gray-900 bg-opacity-50">
                    <div className="w-full py-2 text-center text-green-400 font-semibold hover:text-green-300 transition-colors">
                      See Semesters →
                    </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Courses