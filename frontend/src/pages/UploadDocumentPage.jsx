"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, FileText, Check, X, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import UploadVerify from "../components/UploadVerify"

const UploadDocumentPage = () => {
  const navigate = useNavigate()
  const [fileName, setFileName] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const fileInputRef = useRef(null)
  const { user } = useAuthStore()

  // Debug log to confirm page rendering
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    console.log("Rendering UploadPage")
  }, [])

  // Check for admin status after all hooks are called
  if (user?.isAdmin !== 'admin') {
    return <UploadVerify />
  }

  const semesters = [
    { value: "1", label: "1st Semester" },
    { value: "2", label: "2nd Semester" },
    { value: "3", label: "3rd Semester" },
  ]

  const coursesBySemester = {
    "1": [
      "Data Structures",
      "Programming in C",
      "Computer Organization",
      "Mathematics for Computing",
      "Digital Electronics",
      "Communication Skills",
    ],
    "2": [
      "Operating Systems",
      "Database Management Systems",
      "Object Oriented Programming",
      "Computer Networks",
      "Software Engineering",
      "Web Technologies",
    ],
    "3": [
      "Machine Learning",
      "Mobile Application Development",
      "Cloud Computing",
      "Artificial Intelligence",
      "Project Work",
      "Advanced Database Systems",
    ],
  }

  const availableCourses = selectedSemester ? coursesBySemester[selectedSemester] : []

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus("error")
      setUploadMessage("Please select a PDF or image file (JPG, PNG)")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("error")
      setUploadMessage("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)
    if (!fileName) {
      setFileName(file.name.replace(/\.[^/.]+$/, ""))
    }
    setUploadStatus("idle")
    setUploadMessage("")
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !fileName || !selectedSemester || !selectedCourse) {
      setUploadStatus("error")
      setUploadMessage("Please fill in all fields and select a file")
      return
    }

    setIsUploading(true)
    setUploadStatus("idle")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("name", fileName)
      formData.append("semester", selectedSemester)
      formData.append("course", selectedCourse)

      const res = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Upload failed")
      }

      console.log("Uploaded:", json.data)
      setUploadStatus("success")
      setUploadMessage("File uploaded successfully!")
    } catch (err) {
      setUploadStatus("error")
      setUploadMessage(err.message || "Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      setTimeout(() => {
        removeFile()
        setFileName("")
        setSelectedSemester("")
        setSelectedCourse("")
        setUploadStatus("idle")
        setUploadMessage("")
      }, 2000)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center p-0 pb-8 pt-20">
      {/* Hero Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text tracking-tight mb-4">
            Upload Examination Papers
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6 leading-relaxed">
            Contribute to the SCSIT, Indore community by uploading previous year question papers and study materials for MCA and other programs.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1 || "/courses")}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Previous Page</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Upload Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl border border-gray-700 p-8">
          <div className="space-y-6">
            {/* File Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paper Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter paper name (e.g., Data Structures - 2023)"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:bg-opacity-75 text-white placeholder-gray-400 transition duration-200"
              />
            </div>

            {/* Semester Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value)
                  setSelectedCourse("")
                }}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:bg-opacity-75 text-white transition duration-200"
              >
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester.value} value={semester.value}>
                    {semester.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course/Subject
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={!selectedSemester}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:bg-opacity-75 text-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Course</option>
                {availableCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload File
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-green-400 bg-green-400 bg-opacity-10"
                    : "border-gray-600 hover:border-green-500"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <FileText className="w-8 h-8 text-green-400" />
                      <div className="text-left">
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-white font-medium">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Supports PDF, JPG, PNG files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Message */}
            {uploadMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center space-x-2 p-4 rounded-lg ${
                  uploadStatus === "success"
                    ? "bg-green-600 bg-opacity-20 border border-green-500"
                    : "bg-red-600 bg-opacity-20 border border-red-500"
                }`}
              >
                {uploadStatus === "success" ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span
                  className={uploadStatus === "success" ? "text-green-300" : "text-red-300"}
                >
                  {uploadMessage}
                </span>
              </motion.div>
            )}

            {/* Upload Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={
                isUploading || !selectedFile || !fileName || !selectedSemester || !selectedCourse
              }
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Paper</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Upload Guidelines Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16"
      >
        <div className="bg-gray-800 bg-opacity-30 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upload Guidelines</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Supported file formats: PDF, JPG, PNG</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Maximum file size: 10MB</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Use descriptive names like "Data Structures - 2023" or "Operating Systems - 2022"</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Ensure the paper is clear and readable before uploading</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Select the correct semester and course for proper categorization</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

export default UploadDocumentPage