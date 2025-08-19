"use client";
import { useState, useRef, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  FileText,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Select from "react-select";
import { Helmet } from "react-helmet-async";
import { API_URL } from "../utils/urls";
import { useSwipeable } from "react-swipeable";
import { ValuesContext } from "../context/ValuesContext";
import toast from "react-hot-toast";
import {
  courses,
  NotesResourceTypes,
  ResourceTypes,
  semestersByCourse,
  subjectsByCourseAndSemester,
} from "../utils/Data";
const UploadDocumentPage = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTypes, setSelectedTypes] = useState(null);
  const [selectedResourceType, setSelectedResourceType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTextContent, setSelectedTextContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (user?.isAdmin && user.isAdmin !== "admin") {
      toast.error("User Must Be Admin to upload Resources!", {
        style: {
          border: "1px solid #713200",
          padding: "16px",
          color: "#713200",
        },
        iconTheme: {
          primary: "#4ade80",
          secondary: "#ffffff",
        },
      });
    }
  }, []);
  useEffect(() => {
    if (selectedCategory === "paper") {
      setSelectedTypes("image");
    } else {
      setSelectedTypes(null);
    }
  }, [selectedCategory]);
  const getOrdinalSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  const availableSemesters = selectedCourse
    ? (semestersByCourse?.[selectedCourse]?.map((sem) => ({
      value: sem,
      label:
        sem === "0"
          ? `Whole Course(${selectedCourse})`
          : `${sem}${getOrdinalSuffix(parseInt(sem, 10))} Semester`,
    })) ?? [])
    : [];
  const getSubjectsForCourseAndSemester = (course, semester) => {
    const semesterData = subjectsByCourseAndSemester?.[course]?.[semester];
    if (Array.isArray(semesterData)) {
      return semesterData;
    }
    if (
      semesterData &&
      typeof semesterData === "object" &&
      semesterData.subjects &&
      Array.isArray(semesterData.subjects)
    ) {
      return semesterData.subjects.map((sub) => sub.name || sub);
    }
    return [];
  };
  const availableSubjects =
    selectedCourse && selectedSemester
      ? getSubjectsForCourseAndSemester(selectedCourse, selectedSemester).map(
        (sub) => ({
          value: sub,
          label: sub,
        }),
      )
      : [];
  useEffect(() => {
    if (selectedSemester === "0") {
      setSelectedSubject("Whole Semester");
    }
  }, [selectedSemester]);
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files?.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  const handleFileSelect = (file) => {
    let allowedTypes;
    if (selectedCategory === "paper") {
      allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    } else {
      allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
    }
    if (!allowedTypes.includes(file?.type)) {
      setUploadStatus("error");
      setUploadMessage(
        `Please select ${selectedCategory === "paper" ? "an image file (JPG, PNG)" : "a PDF or image file (JPG, PNG)"}`,
      );
      return;
    }
    if (file?.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
    setUploadStatus("idle");
    setUploadMessage("");
  };
  const handleFileInputChange = (e) => {
    const files = e.target?.files;
    if (files?.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  const handleTypeChange = (type) => {
    if (selectedTypes === type) {
      setSelectedTypes(null);
    } else {
      setSelectedTypes(type);
    }
  };
  const handleCategoryChange = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setSelectedResourceType(null);
    } else {
      setSelectedCategory(category);
      setSelectedResourceType(null);
    }
  };
  const handleYearChange = (e) => {
    const value = e.target?.value;
    if (/^\d{0,4}$/.test(value ?? "")) {
      setSelectedYear(value ?? "");
    }
  };

  useEffect(() => {
    const isWholeCourse = selectedSemester === "0";
    const isWholeSemester = selectedSubject === "Whole Semester";

    if (isWholeCourse || isWholeSemester) {
      setSelectedCategory("syllabus");
    }
  }, [selectedSemester, selectedSubject]);

  const handleUpload = async () => {
    if (user.isAdmin !== "admin") {
      setUploadStatus("error");
      setUploadMessage("Only admins are authorized to upload documents.");
      return;
    }

    const isInvalid =
      !fileName ||
      !selectedCourse ||
      !selectedSemester ||
      !selectedCategory ||
      !/^\d{4}$/.test(selectedYear) ||
      (selectedSemester !== "0" && !selectedSubject) ||
      ((selectedCategory === "paper" || selectedCategory === "notes") &&
        !selectedResourceType) ||
      (selectedCategory !== "paper" && !selectedTypes) ||
      (selectedTypes === "text" ? !selectedTextContent : !selectedFile);

    if (isInvalid) {
      setUploadStatus("error");
      setUploadMessage(
        "Please ensure all visible and required fields are filled correctly.",
      );
      return;
    }

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage("File size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");

    const resetForm = () => {
      setSelectedFile(null);
      setFileName("");
      setSelectedCourse(null);
      setSelectedSemester(null);
      setSelectedSubject(null);
      setSelectedTypes(null);
      setSelectedCategory(null);
      setSelectedYear("");
      setSelectedTextContent("");
      setSelectedResourceType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    try {
      let payload = {
        name: fileName.trim(),
        course: selectedCourse.trim(),
        semester: selectedSemester.trim(),
        subject: selectedSubject.trim(),
        types: selectedTypes,
        year: selectedYear,
        category: selectedCategory,
        resourceType: selectedResourceType,
        uploadedBy: user._id || user.id,
      };

      if (selectedTypes === "text") {
        payload.text = selectedTextContent;
        payload.format = 'text';
      } else if (selectedFile) {
        const cloudName = "dbf1lifdi";
        const uploadPreset = "frontend_uploads";
        const resourceType = selectedFile.type === "application/pdf" ? "raw" : "auto";

        const cloudFormData = new FormData();
        cloudFormData.append("file", selectedFile);
        cloudFormData.append("upload_preset", uploadPreset);
        cloudFormData.append("folder", "documents");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          {
            method: "POST",
            body: cloudFormData,
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!cloudRes.ok) {
          const errorData = await cloudRes.json();
          throw new Error(errorData.error?.message || "Cloudinary upload failed");
        }

        const cloudData = await cloudRes.json();

        if (!cloudData.secure_url) {
          throw new Error("Cloudinary upload failed: No secure URL returned");
        }

        const fileExtension = selectedFile.name.split('.').pop();

        payload.fileUrl = cloudData.secure_url;
        payload.contentType = cloudData.resource_type;
        payload.format = cloudData.format || fileExtension;
      }

      const res = await fetch(`${API_URL}/api/files/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?._id}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save file metadata");
      }

      resetForm();
      setUploadStatus("success");
      setUploadMessage("File uploaded successfully!");
    } catch (err) {
      setUploadStatus("error");
      setUploadMessage(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "rgba(55, 65, 81, 0.5)",
      borderColor: "#4b5563",
      borderRadius: "0.5rem",
      padding: "0.5rem",
      color: "#ffffff",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#10b981",
      },
      "&:focus": {
        borderColor: "#10b981",
        boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "rgba(31, 41, 55, 0.95)",
      borderRadius: "0.5rem",
      marginTop: "0.25rem",
      border: "1px solid #4b5563",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state?.isSelected ? "#10b981" : "transparent",
      color: state?.isSelected ? "#ffffff" : "#d1d5db",
      padding: "0.5rem 1rem",
      "&:hover": {
        backgroundColor: state?.isSelected
          ? "#10b981"
          : "rgba(16, 185, 129, 0.1)",
        color: "#ffffff",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
    input: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
  };
  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
  const isExcludedRoute =
    typeof window !== "undefined"
      ? window.location.pathname.startsWith("/login") ||
      window.location.pathname === "/signup"
      : false;
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !isExcludedRoute) {
        setIsSidebarOpen(true);
        console.log("Swiped left - opening sidebar");
      }
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 30,
  });
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "p":
          case "a":
          case "c":
          case "h":
          case "m":
          case "b":
          case "d":
          case "u":
          case "q":
          case "l":
          case "p":
            e.preventDefault();
            e.stopPropagation();
            return false;
          default:
            break;
        }
      }
    };
    if (typeof window !== "undefined") {
      document.addEventListener("keydown", handleKeyDown, true);
      return () => {
        document.removeEventListener("keydown", handleKeyDown, true);
      };
    }
  }, [user]);
  console.log("selectedTypes:", selectedTypes, "type:", typeof selectedTypes);

  return (
    <>
      <div className="fixed top-1/2 -translate-y-1/2 right-2 md:right-4 z-10 pointer-events-none">
        <div className="flex flex-col items-center rounded-full border border-blue-400/30 bg-black/30 backdrop-blur-lg px-1.5 py-4 md:px-2 md:py-5">
          <ShieldCheck className="h-5 w-5 text-blue-400 md:h-6 md:w-6 mb-2" />
          {"ADMINS".split("").map((char, index) => (
            <span
              key={index}
              className="font-mono text-xs font-bold uppercase text-blue-300/80 md:text-xl"
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      <div
        {...swipeHandlers}
        className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center p-0 pb-4 pt-20 sm:pt-24"
      >
        <Helmet>
          <title>Upload Document - LastMinute SCSIT</title>
          <meta
            name="description"
            content="Upload your examination papers and study materials for various courses at SCSIT, Indore."
          />
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
              Contribute to the SCSIT, Indore community by uploading previous
              year question papers and study materials for various programs.
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
                  onChange={(e) => {
                    setFileName(e.target?.value ?? "");
                    setUploadMessage("");
                  }}
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
                  value={
                    uploadStatus === "success"
                      ? null
                      : courses?.find(
                        (course) => course?.value === selectedCourse,
                      )
                  }
                  onChange={(option) => {
                    setSelectedCourse(option ? option.value : null);
                    setSelectedSemester(null);
                    setSelectedSubject(null);
                    setUploadStatus("idle");
                    setUploadMessage("");
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
                  value={
                    uploadStatus === "success"
                      ? null
                      : availableSemesters?.find(
                        (sem) => sem?.value === selectedSemester,
                      )
                  }
                  onChange={(option) => {
                    setSelectedSemester(option ? option.value : null);
                    setSelectedSubject(null);
                    setUploadStatus("idle");
                  }}
                  placeholder="Select Semester"
                  isDisabled={!selectedCourse}
                  styles={customSelectStyles}
                  isSearchable
                />
              </div>
              {selectedSemester !== "0" && (
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <Select
                    options={availableSubjects}
                    value={
                      uploadStatus === "success"
                        ? null
                        : availableSubjects?.find(
                          (sub) => sub?.value === selectedSubject,
                        )
                    }
                    onChange={(option) => {
                      setSelectedSubject(option ? option.value : null);
                      setUploadStatus("idle");
                    }}
                    placeholder="Select Subject"
                    isDisabled={
                      !selectedCourse ||
                      !selectedSemester ||
                      selectedSemester === "0"
                    }
                    styles={customSelectStyles}
                    isSearchable
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                {selectedSemester !== "0" &&
                  selectedSubject !== "Whole Semester" && (
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
                            {selectedCategory === "paper" && (
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            )}
                          </span>
                          <span className="text-gray-300 text-sm sm:text-base">
                            Paper
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategory === "notes"}
                            onChange={() => handleCategoryChange("notes")}
                            className="hidden peer"
                          />
                          <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-200">
                            {selectedCategory === "notes" && (
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            )}
                          </span>
                          <span className="text-gray-300 text-sm sm:text-base">
                            Notes
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategory === "syllabus"}
                            onChange={() => handleCategoryChange("syllabus")}
                            className="hidden peer"
                          />
                          <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-200">
                            {selectedCategory === "syllabus" && (
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            )}
                          </span>
                          <span className="text-gray-300 text-sm sm:text-base">
                            Syllabus
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
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
              {selectedCategory === "paper" && (
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                    Resource Type
                  </label>
                  <Select
                    options={Object.values(ResourceTypes)}
                    value={
                      uploadStatus === "success"
                        ? null
                        : Object.values(ResourceTypes)?.find(
                          (type) => type?.value === selectedResourceType,
                        )
                    }
                    onChange={(option) => {
                      setSelectedResourceType(option?.value ?? "");
                      setUploadStatus("idle");
                    }}
                    placeholder="Select Resource Type"
                    styles={customSelectStyles}
                    isSearchable
                  />
                </div>
              )}
              {selectedCategory === "notes" && (
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                    Resource Type
                  </label>
                  <Select
                    options={Object.values(NotesResourceTypes)}
                    value={
                      uploadStatus === "success"
                        ? null
                        : Object.values(NotesResourceTypes)?.find(
                          (type) => type?.value === selectedResourceType,
                        )
                    }
                    onChange={(option) => {
                      setSelectedResourceType(option?.value ?? "");
                      setUploadStatus("idle");
                    }}
                    placeholder="Select Resource Type"
                    styles={customSelectStyles}
                    isSearchable
                  />
                </div>
              )}
              {selectedCategory !== "paper" && (
                <div className="flex-1 w-full">
                  <label className="block text-sm sm:text-base font-medium text-gray-300">
                    File Type
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
                        {selectedTypes === "image" && (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        )}
                      </span>
                      <span className="text-gray-300 text-sm sm:text-base">
                        Image
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes === "document"}
                        onChange={() => handleTypeChange("document")}
                        className="hidden peer"
                      />
                      <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-200">
                        {selectedTypes === "document" && (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        )}
                      </span>
                      <span className="text-gray-300 text-sm sm:text-base">
                        Document
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes === "text"}
                        onChange={() => handleTypeChange("text")}
                        className="hidden peer"
                      />
                      <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-200">
                        {selectedTypes === "text" && (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        )}
                      </span>
                      <span className="text-gray-300 text-sm sm:text-base">
                        Text
                      </span>
                    </label>
                  </div>
                </div>
              )}
              {(selectedTypes === "image" ||
                selectedTypes === "document" ||
                selectedTypes === null) && (
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
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 ${isDragging ? "border-green-400 bg-green-400 bg-opacity-10" : "border-gray-600 hover:border-green-500"} ${selectedFile ? "lg:w-1/2" : "lg:w-full"}`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={
                            selectedCategory === "paper"
                              ? "image/jpeg,image/png,image/jpg"
                              : ".pdf,image/jpeg,image/png,image/jpg"
                          }
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
                              Supports{" "}
                              {selectedCategory === "paper"
                                ? "JPG, PNG"
                                : "PDF, JPG, PNG"}{" "}
                              files up to 10MB
                            </p>
                          </div>
                        </div>
                      </div>
                      {selectedFile && (
                        <div className="lg:w-1/2">
                          <div className="space-y-3 sm:space-y-4">
                            {["image/jpeg", "image/png", "image/jpg"].includes(
                              selectedFile?.type,
                            ) ? (
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
                                    <p className="text-white font-medium text-sm sm:text-base">
                                      {selectedFile?.name}
                                    </p>
                                    <p className="text-gray-400 text-xs sm:text-sm">
                                      {(
                                        selectedFile?.size /
                                        1024 /
                                        1024
                                      )?.toFixed(2)}{" "}
                                      MB
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
                )}
              {selectedTypes === "text" && (
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={selectedTextContent}
                    onChange={(e) => {
                      setSelectedTextContent(e.target?.value ?? "");
                      setUploadMessage("");
                    }}
                    placeholder="Enter text content, in a formatted format ..."
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:bg-opacity-75 text-white placeholder-gray-400 transition duration-200 text-sm sm:text-base"
                  />
                </div>
              )}
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
                    className={
                      uploadStatus === "success"
                        ? "text-green-300 text-sm sm:text-base"
                        : "text-red-300 text-sm sm:text-base"
                    }
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
                  !fileName ||
                  !selectedCourse ||
                  !selectedSemester ||
                  !selectedCategory ||
                  !/^\d{4}$/.test(selectedYear) ||
                  (selectedSemester !== "0" && !selectedSubject) ||
                  ((selectedCategory === "paper" ||
                    selectedCategory === "notes") &&
                    !selectedResourceType) ||
                  (selectedCategory !== "paper" && !selectedTypes) ||
                  (selectedTypes === "text"
                    ? !selectedTextContent
                    : !selectedFile) ||
                  (selectedCategory === "paper" &&
                    selectedFile &&
                    !["image/jpeg", "image/png", "image/jpg"].includes(
                      selectedFile.type,
                    ))
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
          className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-12 sm:mb-16"
        >
          <div className="bg-gray-800 bg-opacity-30 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Upload Guidelines
            </h3>
            <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>
                  Supported file formats: Only images (JPG, PNG) for papers;
                  PDFs and images (JPG, PNG) for notes and syllabus
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Maximum file size: 10MB</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>
                  Use descriptive names like "Data Structures - 2023" or
                  "Operating Systems - 2022"
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>
                  For papers with multiple pages, upload each page separately
                  with the same field values, adding a suffix like "- Page 1",
                  "- Page 2", etc., to the paper name; for single-page papers,
                  upload without a suffix
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>
                  To upload common files for whole course ex- mca than choose
                  semester value as "Whole Course{"(Your Course)"}", in ex case
                  select semester value as "{"Whole Course(MCA)"}".
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>
                  To upload common files for whole semester ex- mca 3rd
                  semester, than choose subject value as "Whole Semester", in ex
                  case select subject value as "{"Whole Semester"}".
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>
                  Ensure the file is clear, readable, and a valid{" "}
                  {selectedCategory === "paper"
                    ? "image (JPG, PNG)"
                    : "PDF or image (JPG, PNG)"}{" "}
                  before uploading
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>
                  Select the correct course, semester, subject, file type,
                  category, resourceType and a valid four-digit year (e.g.,
                  2023) for proper categorization
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>
                  Only admins can upload files; ensure you are logged in with
                  admin privileges
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>
                  When a file is selected, preview it on the right (images
                  display as thumbnails, PDFs show as file names with size)
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </>
  );
};
export default UploadDocumentPage;
