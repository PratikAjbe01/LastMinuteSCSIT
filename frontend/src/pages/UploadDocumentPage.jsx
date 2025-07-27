"use client"

import { useState, useRef, useEffect, useContext } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, FileText, Check, X, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import Select from "react-select"
import { Helmet } from "react-helmet-async"
import { API_URL } from "../utils/urls"
import { useSwipeable } from "react-swipeable"
import { ValuesContext } from "../context/ValuesContext"

const UploadDocumentPage = () => {
  const navigate = useNavigate()
  const [fileName, setFileName] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedTypes, setSelectedTypes] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
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

  useEffect(() => {
    if (selectedCategory === "paper") {
      setSelectedTypes("image")
    } else {
      setSelectedTypes(null)
    }
  }, [selectedCategory])

  const courses = [
    { value: "BCA", label: "Bachelor of Computer Applications (BCA)" },
    { value: "MCA", label: "Master of Computer Applications (MCA)" },
    { value: "BCA_INT", label: "BCA Integrated" },
    { value: "MSC_INT_CS", label: "M.Sc. Integrated (Cyber Security)" },
    { value: "MTECH_CS", label: "M.Tech(CS)" },
    { value: "MTECH_CS_EXEC", label: "M.Tech(CS) Executive" },
    { value: "MTECH_NM_IS", label: "M.Tech(NM & IS)" },
    { value: "MTECH_IA_SE", label: "M.Tech(IA & SE)" },
    { value: "PHD", label: "Doctor of Philosophy (PhD)" },
    { value: "MSC_CS", label: "Master of Science (CS)" },
    { value: "MSC_IT", label: "Master of Science (IT)" },
    { value: "MBA_CM", label: "MBA (Computer Management)" },
    { value: "PGDCA", label: "PG Diploma in Computer Applications (PGDCA)" },
  ]

  const semestersByCourse = {
    "BCA": ["1", "2", "3", "4", "5", "6"],
    "MCA": ["1", "2", "3", "4"],
    "BCA_INT": ["1", "2", "3", "4", "5", "6", "7", "8"],
    "MSC_INT_CS": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "MTECH_CS": ["1", "2", "3", "4"],
    "MTECH_CS_EXEC": ["1", "2", "3", "4"],
    "MTECH_NM_IS": ["1", "2", "3", "4"],
    "MTECH_IA_SE": ["1", "2", "3", "4"],
    "PHD": ["1", "2", "3", "4", "5", "6"],
    "MSC_CS": ["1", "2", "3", "4"],
    "MSC_IT": ["1", "2", "3", "4"],
    "MBA_CM": ["1", "2", "3", "4"],
    "PGDCA": ["1", "2"],
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
      "1": ["Programming in C", "Mathematics for Computing", "Digital Electronics", "Communication Skills", "Computer Organization"],
      "2": ["Data Structures", "Discrete Mathematics", "Web Development", "Object Oriented Programming", "Database Management Systems"],
      "3": ["Operating Systems", "Computer Networks", "Java Programming", "Software Engineering", "Computer Graphics"],
      "4": ["Advanced Database Systems", "Web Technologies", "Project Work"],
      "5": ["Artificial Intelligence", "Cyber Security", "Mobile Application Development"],
      "6": ["Cloud Computing", "Big Data Analytics", "Project Work"],
    },
    "MCA": staticSemesterData,
    "BCA_INT": {
      "1": ["Programming in C", "Mathematics for Computing", "Digital Electronics", "Communication Skills"],
      "2": ["Data Structures", "Discrete Mathematics", "Web Development", "Computer Organization"],
      "3": ["Operating Systems", "Object Oriented Programming", "Database Management Systems"],
      "4": ["Computer Networks", "Java Programming", "Software Engineering"],
      "5": ["Computer Graphics", "Web Technologies", "Advanced Database Systems"],
      "6": ["Artificial Intelligence", "Cloud Computing", "Project Work"],
      "7": ["Big Data Analytics", "Cyber Security", "Mobile Application Development"],
      "8": ["Advanced Web Technologies", "Project Work"],
    },
    "MSC_INT_CS": {
      "1": ["Fundamentals of IT & Programming", "Digital Logic", "Mathematics-I", "Communication Skills"],
      "2": ["Data Structures", "Computer Organization", "Mathematics-II", "Intro to Cyber Security"],
      "3": ["Object-Oriented Programming", "Operating Systems", "Database Management Systems", "Network Fundamentals"],
      "4": ["Web Technologies", "Software Engineering", "Principles of Information Security", "Python for Security"],
      "5": ["Computer Networks & Security", "Cryptography Basics", "Ethical Hacking Fundamentals", "Cyber Law & Ethics"],
      "6": ["Secure Coding Practices", "Web Application Security", "Digital Forensics-I", "Minor Project-I"],
      "7": ["Network Security & Firewalls", "Malware Analysis", "Intrusion Detection Systems", "Elective-I"],
      "8": ["Cloud Security", "Mobile & Wireless Security", "Digital Forensics-II", "Elective-II"],
      "9": ["Advanced Cryptography", "IoT Security", "Cyber Threat Intelligence", "Minor Project-II"],
      "10": ["Major Project / Internship"],
    },
    "MTECH_CS": {
      "1": ["Advanced Data Structures", "Theory of Computation", "Modern Computer Architecture", "Advanced Algorithms"],
      "2": ["Machine Learning", "Advanced Database Systems", "Compiler Design", "Research Methodology"],
      "3": ["Deep Learning", "Cloud Computing", "Minor Project"],
      "4": ["Dissertation / Major Project"],
    },
    "MTECH_CS_EXEC": {
      "1": ["Software Project Management", "Advanced Operating Systems", "Data Warehousing & Mining", "IT Strategy"],
      "2": ["Agile Methodologies", "Information Systems Security", "Business Intelligence", "Cloud Services"],
      "3": ["Big Data Analytics", "DevOps", "Case Studies Project"],
      "4": ["Dissertation / Major Project"],
    },
    "MTECH_NM_IS": {
      "1": ["Advanced Computer Networks", "Cryptography & Network Security", "Network Programming", "Wireless & Mobile Networks"],
      "2": ["Information & System Security", "Network Management & Operations", "Ethical Hacking", "Research Methodology"],
      "3": ["Cloud & Data Center Networking", "Intrusion Detection & Prevention Systems", "Digital Forensics", "Minor Project"],
      "4": ["Dissertation / Major Project"],
    },
    "MTECH_IA_SE": {
      "1": ["Advanced Software Engineering", "Information Architecture & Design", "Software Metrics & Quality Assurance", "Object-Oriented Analysis & Design"],
      "2": ["Software Architecture & Patterns", "Component-Based Software Engineering", "User Experience (UX) Design", "Research Methodology"],
      "3": ["Software Project & Risk Management", "Agile Software Development", "Service-Oriented Architecture", "Minor Project"],
      "4": ["Dissertation / Major Project"],
    },
    "PHD": {
      "1": ["Research Methodology", "Advanced Computing", "Statistical Methods"],
      "2": ["Machine Learning", "Data Science", "Literature Review"],
      "3": ["Artificial Intelligence", "Advanced Algorithms", "Big Data Analytics"],
      "4": ["Cyber Security", "Cloud Computing", "Thesis Work"],
      "5": ["Advanced Topics in Computing", "Research Seminar"],
      "6": ["Thesis Work"],
    },
    "MSC_CS": {
      "1": ["Advanced Data Structures", "Theory of Computation", "Advanced Algorithms", "Computer Systems and Networks"],
      "2": ["Artificial Intelligence", "Compiler Design", "Advanced Database Systems", "Software Project Management"],
      "3": ["Machine Learning", "Cryptography and Network Security", "Cloud Computing", "Elective I"],
      "4": ["Major Project"],
    },
    "MSC_IT": {
      "1": ["IT Fundamentals", "Web Technologies", "Object-Oriented Programming", "Network Essentials"],
      "2": ["Data Warehousing and Mining", "Mobile Computing", "Information Security", "E-Commerce"],
      "3": ["Big Data Technologies", "Internet of Things (IoT)", "Digital Image Processing", "Elective II"],
      "4": ["Major Project"],
    },
    "MBA_CM": {
      "1": ["Principles of Management", "Managerial Economics", "IT for Managers", "Accounting for Managers"],
      "2": ["Marketing Management", "Human Resource Management", "Database Management Systems", "Business Communication"],
      "3": ["Software Project Management", "E-Business Strategies", "Information Systems Security", "Strategic Management"],
      "4": ["Internship and Project Report"],
    },
    "PGDCA": {
      "1": ["Computer Fundamentals & PC Software", "Programming in 'C'", "Database Management using FoxPro", "System Analysis and Design"],
      "2": ["GUI Programming with Visual Basic", "Web Design and Internet", "Object-Oriented Programming with C++", "Project Work"],
    },
  }

  const getOrdinalSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  const availableSemesters = selectedCourse ? semestersByCourse?.[selectedCourse]?.map((sem) => ({ value: sem, label: `${sem}${getOrdinalSuffix(parseInt(sem, 10))} Semester` })) ?? [] : []

  const availableSubjects = selectedCourse && selectedSemester ? (selectedCourse === "MCA" ? subjectsByCourseAndSemester?.[selectedCourse]?.[selectedSemester]?.subjects?.map(sub => ({ value: sub.name, label: sub.name })) ?? [] : subjectsByCourseAndSemester?.[selectedCourse]?.[selectedSemester]?.map(sub => ({ value: sub, label: sub })) ?? []) : []

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
    let allowedTypes
    if (selectedCategory === "paper") {
      allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
    } else {
      allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    }
    if (!allowedTypes.includes(file?.type)) {
      setUploadStatus("error")
      setUploadMessage(`Please select ${selectedCategory === "paper" ? "an image file (JPG, PNG)" : "a PDF or image file (JPG, PNG)"}`)
      return
    }
    if (file?.size > 10 * 1024 * 1024) {
      setUploadStatus("error")
      setUploadMessage("File size must be less than 10MB")
      return
    }
    setSelectedFile(file)
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
    if (!selectedFile || !fileName || !selectedCourse || !selectedSemester || !selectedSubject || !selectedTypes || !selectedCategory || !/^\d{4}$/.test(selectedYear)) {
      setUploadStatus("error")
      setUploadMessage("Please fill in all fields, select a file, choose a type, select a category, and enter a valid year")
      return
    }
    if (selectedCategory === "paper" && !["image/jpeg", "image/png", "image/jpg"].includes(selectedFile.type)) {
      setUploadStatus("error")
      setUploadMessage("Only image files are allowed for papers")
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
      formData.append("uploadedBy", user?._id || user?.id)
      const res = await fetch(`${API_URL}/api/files/upload`, {
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
      setSelectedTypes(null)
      setSelectedCategory(null)
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

  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);

  const isExcludedRoute = location.pathname.startsWith("/login") || location.pathname === "/signup";
  const isMobile = window.innerWidth <= 768;
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !isExcludedRoute) {
        setIsSidebarOpen(true);
        console.log("Swiped left - opening sidebar");
      }
    },
    onSwipedRight: () => {
      if (isMobile && !isExcludedRoute && isSidebarOpen) {
        setIsSidebarOpen(false);
        console.log("Swiped right - closing sidebar");
      }
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 30,
  });

  return (
    <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center p-0 pb-4 pt-20 sm:pt-24">
      <Helmet>
        <title>Upload Document - LastMinute SCSIT</title>
        <meta name="description" content="Upload your examination papers and study materials for various courses at SCSIT, Indore." />
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
            Contribute to the SCSIT, Indore community by uploading previous year question papers and study materials for various programs.
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
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
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
                <label className="block text-sm sm:text-base font-medium text-gray-300">
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

            {selectedCategory !== "paper" && (
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
            )}

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                Upload File
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col lg:flex-row gap-4 ${selectedFile ? "lg:flex-row" : "lg:flex-col"}`}
              >
                <div className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 ${isDragging ? "border-green-400 bg-green-400 bg-opacity-10" : "border-gray-600 hover:border-green-500"} ${selectedFile ? "lg:w-1/2" : "lg:w-full"}`}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={selectedCategory === "paper" ? "image/jpeg,image/png,image/jpg" : ".pdf,image/jpeg,image/png,image/jpg"}
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-3 sm:space-y-4">
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        Supports {selectedCategory === "paper" ? "JPG, PNG" : "PDF, JPG, PNG"} files up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
                {selectedFile && (
                  <div className="lg:w-1/2">
                    <div className="space-y-3 sm:space-y-4">
                      {["image/jpeg", "image/png", "image/jpg"].includes(selectedFile?.type) ? (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt={selectedFile?.name}
                            className="w-full h-auto max-h-96 object-contain rounded-lg"
                          />
                          <button
                            onClick={removeFile}
                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-700 bg-opacity-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                            <div className="text-left">
                              <p className="text-white font-medium text-sm sm:text-base">{selectedFile?.name}</p>
                              <p className="text-gray-400 text-xs sm:text-sm">
                                {(selectedFile?.size / 1024 / 1024)?.toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={removeFile}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {uploadMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center space-x-2 p-3 sm:p-4 rounded-lg ${uploadStatus === "success" ? "bg-green-600 bg-opacity-20 border border-green-500" : "bg-red-600 bg-opacity-20 border border-red-500"}`}
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
              disabled={isUploading || !selectedFile || !fileName || !selectedCourse || !selectedSemester || !selectedSubject || !selectedTypes || !selectedCategory || !/^\d{4}$/.test(selectedYear) || (selectedCategory === "paper" && selectedFile && !["image/jpeg", "image/png", "image/jpg"].includes(selectedFile.type))}
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
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-12 sm:mb-16"
      >
        <div className="bg-gray-800 bg-opacity-30 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Upload Guidelines</h3>
          <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Supported file formats: Only images (JPG, PNG) for papers; PDFs and images (JPG, PNG) for notes and syllabus</span>
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
              <span>For papers with multiple pages, upload each page separately with the same field values, adding a suffix like "- Page 1", "- Page 2", etc., to the paper name; for single-page papers, upload without a suffix</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Ensure the file is clear, readable, and a valid {selectedCategory === "paper" ? "image (JPG, PNG)" : "PDF or image (JPG, PNG)"} before uploading</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Select the correct course, semester, subject, type, category, and a valid four-digit year (e.g., 2023) for proper categorization</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Only admins can upload files; ensure you are logged in with admin privileges</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>When a file is selected, preview it on the right (images display as thumbnails, PDFs show as file names with size)</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

export default UploadDocumentPage