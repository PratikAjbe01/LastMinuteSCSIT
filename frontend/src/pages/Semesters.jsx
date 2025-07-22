"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, BookOpen, Code, FileText, GraduationCap } from "lucide-react"
import SemesterPage from "../fileComponents/SemesterPage"
import FileViewer from "../fileComponents/FileViewer"
import UploadPage from "../fileComponents/UploadPage"
import { useNavigate, useParams } from "react-router-dom"
import { Helmet } from "react-helmet-async"

const SemestersPage = () => {
const {course} = useParams();
const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(course || "mca");
  const [selectedSemester, setSelectedSemester] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showUploadPage, setShowUploadPage] = useState(false)

    useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const semesters = [
    {
      id: 1,
      title: "1st Semester",
      description: "Foundation courses and programming fundamentals",
      icon: BookOpen,
      paperCount: 8,
    },
    {
      id: 2,
      title: "2nd Semester",
      description: "Advanced programming and system concepts",
      icon: FileText,
      paperCount: 7,
    },
    {
      id: 3,
      title: "3rd Semester",
      description: "Specialized subjects and project work",
      icon: GraduationCap,
      paperCount: 6,
    },
    {
      id: 4,
      title: "4th Semester",
      description: "Machine learning and data science",
      icon: Code,
      paperCount: 6,
    },
  ]

  if( selectedCourse !== "mca" ) {
    return (
       <div className="min-h-screen w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center justify-center p-0 pb-8 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl p-8 max-w-lg mx-auto text-center border border-gray-700"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-4">Course Not Available</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          This course has not been added yet. Please contact the admins at SCSIT, Indore, for more information or to request access to course materials.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div onClick={() => navigate('/scsit/courses')}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            >
              Back to Courses
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
    )
  }

  const handleSemesterClick = (semesterId) => {
    setSelectedSemester(semesterId)
    navigate(`/scsit/${selectedCourse}/semesters/${semesterId}`)
  }

  const handleBackToHome = () => {
    setSelectedSemester(null)
    setSelectedFile(null)
  }

  const handleFileSelect = (file) => {
    setSelectedFile(file)
  }

  const handleCloseViewer = () => {
    setSelectedFile(null)
  }

  if (selectedFile) {
    return <FileViewer file={selectedFile} onClose={handleCloseViewer} />
  }

  if (showUploadPage) {
    return <UploadPage onBack={() => setShowUploadPage(false)} />
  }

  return (
    <div className="min-h-full w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center justify-center p-0 pb-8 pt-16">
      <Helmet>
        <title>{`${selectedCourse?.toUpperCase() || course?.toUpperCase()} Semesters - SCSIT Indore`}</title>
        <meta name="description" content={`Explore the diverse range of semesters offered at the School of Computer Science and Information Technology, Indore for ${selectedCourse || course}.`} />
      </Helmet>
      <div className="w-full h-full flex flex-col flex-1">
        <div className="text-center mb-12 mt-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text"
          >
            MCA Examination Papers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Access previous year examination papers for Master of Computer Applications program
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadPage(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            >
              Upload Papers
            </motion.button>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full px-8 flex-1">
          {semesters.map((semester, index) => {
            const IconComponent = semester.icon
            return (
              <motion.div
                key={semester.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSemesterClick(semester.id)}
                className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer border border-gray-700 hover:border-green-500 transition-all duration-300 h-full flex flex-col justify-between"
              >
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-white">{semester.title}</h3>

                  <p className="text-gray-300 mb-4 leading-relaxed">{semester.description}</p>

                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{semester.paperCount} Papers Available</span>
                  </div>
                </div>

                <div className="px-8 py-4 bg-gray-900 bg-opacity-50">
                  <div className="w-full py-2 text-center text-green-400 font-semibold hover:text-green-300 transition-colors">
                    View Papers →
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

export default SemestersPage
