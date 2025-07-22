"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, FileText, Check, X, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import UploadVerify from "../components/UploadVerify"
import Select from "react-select"
import { Helmet } from "react-helmet-async"

const UploadDocumentPage = () => {
  const navigate = useNavigate()
  const [fileName, setFileName] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedCategory, setSelectedCategory] = useState([])
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const fileInputRef = useRef(null)
  const { user } = useAuthStore()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const courses = [
    { value: "BCA", label: "Bachelor of Computer Applications (BCA)" },
    { value: "MCA", label: "Master of Computer Applications (MCA)" },
    { value: "BCA_INT", label: "BCA Integrated" },
    { value: "MTECH", label: "Master of Technology (MTech)" },
    { value: "PHD", label: "Doctor of Philosophy (PhD)" },
  ]

  const semestersByCourse = {
    "BCA": ["1", "2", "3", "4", "5", "6"],
    "MCA": ["1", "2", "3", "4"],
    "BCA_INT": ["1", "2", "3", "4", "5", "6", "7", "8"],
    "MTECH": ["1", "2", "3", "4"],
    "PHD": ["1", "2", "3", "4", "5", "6"],
  }

  const staticSemesterData = {
    1: {
      title: "1st Semester",
      subjects: [
        { name: "Computer Organisation and Architecture", papers: [] },
        { name: "Mathematical Foundation for Computer Application", papers: [] },
        { name: "Data Structures Using C++", papers: [] },
        { name: "Operating System", papers: [] },
        { name: "Communication Skills and Report Writing", papers: [] },
      ],
    },
    2: {
      title: "2nd Semester",
      subjects: [
        { name: "Software Engineering", papers: [] },
        { name: "Database Management System", papers: [] },
        { name: "Design and Analysis of Algorithms", papers: [] },
        { name: "Computer Networks", papers: [] },
        { name: "Internet and Web Technology", papers: [] },
      ],
    },
    3: {
      title: "3rd Semester",
      subjects: [
        { name: "Information Security", papers: [] },
        { name: "Automata Theory and Compiler Constructions", papers: [] },
        { name: "Artificial Intelligence and Machine Learning", papers: [] },
        { name: "Cloud Computing", papers: [] },
        { name: "Information Technology Project Management", papers: [] },
      ],
    },
    4: {
      title: "4th Semester",
      subjects: [{ name: "Project Work", papers: [] }],
    },
  }

  const subjectsByCourseAndSemester = {
    "BCA": {
      "1": [
        "Programming in C",
        "Mathematics for Computing",
        "Digital Electronics",
        "Communication Skills",
        "Computer Organization",
      ],
      "2": [
        "Data Structures",
        "Discrete Mathematics",
        "Web Development",
        "Object Oriented Programming",
        "Database Management Systems",
      ],
      "3": [
        "Operating Systems",
        "Computer Networks",
        "Java Programming",
        "Software Engineering",
        "Computer Graphics",
      ],
      "4": [
        "Advanced Database Systems",
        "Web Technologies",
        "Project Work",
      ],
      "5": [
        "Artificial Intelligence",
        "Cyber Security",
        "Mobile Application Development",
      ],
      "6": [
        "Cloud Computing",
        "Big Data Analytics",
        "Project Work",
      ],
    },
    "MCA": staticSemesterData,
    "BCA_INT": {
      "1": [
        "Programming in C",
        "Mathematics for Computing",
        "Digital Electronics",
        "Communication Skills",
      ],
      "2": [
        "Data Structures",
        "Discrete Mathematics",
        "Web Development",
        "Computer Organization",
      ],
      "3": [
        "Operating Systems",
        "Object Oriented Programming",
        "Database Management Systems",
      ],
      "4": [
        "Computer Networks",
        "Java Programming",
        "Software Engineering",
      ],
      "5": [
        "Computer Graphics",
        "Web Technologies",
        "Advanced Database Systems",
      ],
      "6": [
        "Artificial Intelligence",
        "Cloud Computing",
        "Project Work",
      ],
      "7": [
        "Big Data Analytics",
        "Cyber Security",
        "Mobile Application Development",
      ],
      "8": [
        "Advanced Web Technologies",
        "Project Work",
      ],
    },
    "MTECH": {
      "1": [
        "Advanced Algorithms",
        "Machine Learning",
        "Cloud Computing",
        "Data Science",
      ],
      "2": [
        "Distributed Systems",
        "Cyber Security",
        "Big Data Analytics",
        "Internet of Things",
      ],
      "3": [
        "High Performance Computing",
        "Software Architecture",
        "Deep Learning",
      ],
      "4": [
        "Project Work",
      ],
    },
    "PHD": {
      "1": [
        "Research Methodology",
        "Advanced Computing",
        "Statistical Methods",
      ],
      "2": [
        "Machine Learning",
        "Data Science",
        "Literature Review",
      ],
      "3": [
        "Artificial Intelligence",
        "Advanced Algorithms",
        "Big Data Analytics",
      ],
      "4": [
        "Cyber Security",
        "Cloud Computing",
        "Thesis Work",
      ],
      "5": [
        "Advanced Topics in Computing",
        "Research Seminar",
      ],
      "6": [
        "Thesis Work",
      ],
    },
  }

  const availableSemesters = selectedCourse ? semestersByCourse?.[selectedCourse]?.map(sem => ({ value: sem, label: `${sem}st Semester` })) ?? [] : []
  const availableSubjects = selectedCourse && selectedSemester ? 
    (selectedCourse === "MCA" ? 
      subjectsByCourseAndSemester?.[selectedCourse]?.[selectedSemester]?.subjects?.map(sub => ({ value: sub.name, label: sub.name })) ?? [] 
      : subjectsByCourseAndSemester?.[selectedCourse]?.[selectedSemester]?.map(sub => ({ value: sub, label: sub })) ?? []) 
    : []

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
    const files = e.dataTransfer?.files
    if (files?.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file?.type)) {
      setUploadStatus("error")
      setUploadMessage("Please select a PDF or image file (JPG, PNG)")
      return
    }

    if (file?.size > 10 * 1024 * 1024) {
      setUploadStatus("error")
      setUploadMessage("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)
    if (!fileName) {
      setFileName(file?.name?.replace(/\.[^/.]+$/, "") ?? "")
    }
    setUploadStatus("idle")
    setUploadMessage("")
  }

  const handleFileInputChange = (e) => {
    const files = e.target?.files
    if (files?.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleTypeChange = (type) => {
    if (selectedTypes === type) {
      setSelectedTypes(null)
    } else {
      setSelectedTypes(type)
    }
  }

  const handleCategoryChange = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null)
    } else {
      setSelectedCategory(category)
    }
  }

  const handleYearChange = (e) => {
    const value = e.target?.value
    if (/^\d{0,4}$/.test(value ?? "")) {
      setSelectedYear(value ?? "")
    }
  }

  const handleUpload = async () => {
    if (!user?.isAdmin || user?.isAdmin !== 'admin') {
      setUploadStatus("error")
      setUploadMessage("Only admins are authorized to upload documents.")
      return
    }
    if (
      !selectedFile ||
      !fileName ||
      !selectedCourse ||
      !selectedSemester ||
      !selectedSubject ||
      selectedTypes?.length === 0 ||
      !/^\d{4}$/.test(selectedYear)
    ) {
      setUploadStatus("error")
      setUploadMessage("Please fill in all fields, select a file, choose at least one type, and enter a valid year")
      return
    }

    setIsUploading(true)
    setUploadStatus("idle")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("name", fileName)
      formData.append("course", selectedCourse)
      formData.append("semester", selectedSemester)
      formData.append("subject", selectedSubject)
      formData.append("types", selectedTypes)
      formData.append("year", selectedYear)
      formData.append("category", selectedCategory)

      const res = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        body: formData,
      })

      const json = await res?.json()

      if (!res?.ok || !json?.success) {
        throw new Error(json?.message || "Upload failed")
      }

      setSelectedFile(null)
      setFileName("")
      setSelectedCourse("")
      setSelectedSemester("")
      setSelectedSubject("")
      setSelectedTypes([])
      setSelectedCategory([])
      setSelectedYear("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setUploadStatus("success")
      setUploadMessage("File uploaded successfully!")
    } catch (err) {
      setUploadStatus("error")
      setUploadMessage(err?.message || "Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(55, 65, 81, 0.5)',
      borderColor: '#4b5563',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      color: '#ffffff',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#10b981',
      },
      '&:focus': {
        borderColor: '#10b981',
        boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      borderRadius: '0.5rem',
      marginTop: '0.25rem',
      border: '1px solid #4b5563',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state?.isSelected ? '#10b981' : 'transparent',
      color: state?.isSelected ? '#ffffff' : '#d1d5db',
      padding: '0.5rem 1rem',
      '&:hover': {
        backgroundColor: state?.isSelected ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
        color: '#ffffff',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#ffffff',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
    input: (provided) => ({
      ...provided,
      color: '#ffffff',
    }),
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center p-0 pb-4 pt-16">
      <Helmet>
        <title>Upload Document - LastMinute SCSIT</title>
        <meta name="description" content="Upload your examination papers and study materials for BCA" />
      </Helmet>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text tracking-tight mb-3 sm:mb-4">
            Upload Examination Papers
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-4 sm:mb-6 leading-relaxed">
            Contribute to the SCSIT, Indore community by uploading previous year question papers and study materials for MCA and other programs.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1 || "/courses")}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors mx-auto text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Previous Page</span>
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl border border-gray-700 p-4 sm:p-6 md:p-8">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                Paper Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target?.value ?? "")}
                placeholder="Enter paper name (e.g., Data Structures - 2023)"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:bg-opacity-75 text-white placeholder-gray-400 transition duration-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                Course
              </label>
              <Select
                options={courses}
                value={uploadStatus === "success" ? null : courses?.find(course => course?.value === selectedCourse)}
                onChange={(option) => {
                  setSelectedCourse(option?.value ?? "")
                  setSelectedSemester("")
                  setSelectedSubject("")
                  setUploadStatus("idle")
                }}
                placeholder="Select Course"
                styles={customSelectStyles}
                isSearchable
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                Semester
              </label>
              <Select
                options={availableSemesters}
                value={uploadStatus === "success" ? null : availableSemesters?.find(sem => sem?.value === selectedSemester)}
                onChange={(option) => {
                  setSelectedSemester(option?.value ?? "")
                  setSelectedSubject("")
                  setUploadStatus("idle")
                }}
                placeholder="Select Semester"
                isDisabled={!selectedCourse}
                styles={customSelectStyles}
                isSearchable
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                Subject
              </label>
              <Select
                options={availableSubjects}
                value={uploadStatus === "success" ? null : availableSubjects?.find(sub => sub?.value === selectedSubject)}
                onChange={(option) => {
                  setSelectedSubject(option?.value ?? "")
                  setUploadStatus("idle")
                }}
                placeholder="Select Subject"
                isDisabled={!selectedCourse || !selectedSemester}
                styles={customSelectStyles}
                isSearchable
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="flex-1 mb-4 sm:mb-0">
                <label class人不            className="block text-sm sm:text-base font-medium text-gray-300">
                  Category
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategory === "paper"}
                      onChange={() => handleCategoryChange("paper")}
                      className="hidden peer"
                    />
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-200">
                      {selectedCategory === "paper" && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                    </span>
                    <span className="text-gray-300 text-sm sm:text-base">Paper</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategory === "notes"}
                      onChange={() => handleCategoryChange("notes")}
                      className="hidden peer"
                    />
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-200">
                      {selectedCategory === "notes" && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                    </span>
                    <span className="text-gray-300 text-sm sm:text-base">Notes</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategory === "syllabus"}
                      onChange={() => handleCategoryChange("syllabus")}
                      className="hidden peer"
                    />
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-200">
                      {selectedCategory === "syllabus" && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                    </span>
                    <span className="text-gray-300 text-sm sm:text-base">Syllabus</span>
                  </label>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                  Year
                </label>
                <input
                  type="text"
                  value={selectedYear}
                  onChange={handleYearChange}
                  placeholder="Enter year (e.g., 2023)"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:bg-opacity-75 text-white placeholder-gray-400 transition duration-200 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm sm:text-base font-medium text-gray-300">
                Type
              </label>
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-5">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes === "image"}
                    onChange={() => handleTypeChange("image")}
                    className="hidden peer"
                  />
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-200">
                    {selectedTypes === "image" && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                  </span>
                  <span className="text-gray-300 text-sm sm:text-base">Image</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes === "document"}
                    onChange={() => handleTypeChange("document")}
                    className="hidden peer"
                  />
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-200">
                    {selectedTypes === "document" && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                  </span>
                  <span className="text-gray-300 text-sm sm:text-base">Document</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                Upload File
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 ${isDragging
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
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                      <div className="text-left">
                        <p className="text-white font-medium text-sm sm:text-base">{selectedFile?.name}</p>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          {(selectedFile?.size / 1024 / 1024)?.toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        Supports PDF, JPG, PNG files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {uploadMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center space-x-2 p-3 sm:p-4 rounded-lg ${uploadStatus === "success"
                  ? "bg-green-600 bg-opacity-20 border border-green-500"
                  : "bg-red-600 bg-opacity-20 border border-red-500"
                  }`}
              >
                {uploadStatus === "success" ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                )}
                <span
                  className={uploadStatus === "success" ? "text-green-300 text-sm sm:text-base" : "text-red-300 text-sm sm:text-base"}
                >
                  {uploadMessage}
                </span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={
                isUploading ||
                !selectedFile ||
                !fileName ||
                !selectedCourse ||
                !selectedSemester ||
                !selectedSubject ||
                selectedTypes?.length === 0 ||
                !/^\d{4}$/.test(selectedYear)
              }
              className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Upload Paper</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-12 sm:mb-16"
      >
        <div className="bg-gray-800 bg-opacity-30 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Upload Guidelines</h3>
          <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
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
              <span>Select the correct course, semester, subject, and year for proper categorization</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

export default UploadDocumentPage