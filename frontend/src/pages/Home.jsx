"use client"

import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Upload, FileText, Users } from "lucide-react"
import { useEffect } from "react"

const HomePage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const features = [
    {
      id: 1,
      title: "Access Previous Papers",
      description: "Explore a comprehensive collection of previous year question papers for MCA and other programs at SCSIT, Indore.",
      icon: FileText,
      path: "scsit/courses",
      linkText: "Browse Courses",
    },
    {
      id: 2,
      title: "Upload Documents",
      description: "Contribute to the community by uploading question papers and study materials to help fellow students.",
      icon: Upload,
      path: "/upload",
      linkText: "Upload Now",
    },
    {
      id: 3,
      title: "Student Community",
      description: "Join a vibrant community of learners at SCSIT, Indore, to share resources and succeed together.",
      icon: Users,
      path: "/about",
      linkText: "Learn More",
    },
  ]

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center p-0 pb-4">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 sm:pt-20 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text tracking-tight mb-4 sm:mb-6">
            lastMinuteSCSIT
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Your one-stop platform for accessing and sharing previous year question papers and study resources for the School of Computer Science and Information Technology, Indore.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/scsit/courses")}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            >
              Explore Courses
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/upload")}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-800 bg-opacity-50 text-green-400 font-bold rounded-lg border border-gray-700 hover:border-green-500 transition duration-200"
            >
              Upload Papers
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12"
        >
          Why Choose lastMinuteSCSIT?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-300 h-full flex flex-col justify-between"
              >
                <div className="p-6 sm:p-8 text-center">
                  <div className="mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 leading-relaxed">{feature.description}</p>
                </div>
                <div className="px-6 py-3 sm:px-8 sm:py-4 bg-gray-900 bg-opacity-50">
                  <div
                    onClick={() => navigate(feature.path)}
                    className="w-full py-2 text-center text-green-400 font-semibold hover:text-green-300 transition-colors cursor-pointer"
                  >
                    {feature.linkText} →
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

export default HomePage