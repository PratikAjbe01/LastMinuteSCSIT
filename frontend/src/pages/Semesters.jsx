"use client"

import { useCallback, useContext, useEffect, useRef, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { AlertCircle, BookOpen, Code, FileText, GraduationCap, Briefcase, School, Shield, Calendar, Filter, ChevronDown, X, Share2, Text, Image, ChevronsDown } from "lucide-react"
import FileViewer from "../fileComponents/FileViewer"
import UploadPage from "../fileComponents/UploadPage"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { API_URL, CLIENT_URL } from "../utils/urls"
import { useSwipeable } from "react-swipeable"
import { ValuesContext } from "../context/ValuesContext"
import toast from "react-hot-toast"
import { AnimatePresence } from "framer-motion"
import { RWebShare } from "react-web-share"
import { is } from "date-fns/locale"

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

const icons = [BookOpen, FileText, GraduationCap, Code, Shield, Briefcase, School];

const getOrdinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120
    }
  }
};

const SemesterCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl p-8 border border-gray-700"
  >
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full mb-6 animate-pulse"></div>
      <div className="h-6 w-3/4 bg-gray-700 rounded-md mb-3 animate-pulse"></div>
      <div className="h-4 w-full bg-gray-700 rounded-md mb-2 animate-pulse"></div>
      <div className="h-4 w-5/6 bg-gray-700 rounded-md mb-4 animate-pulse"></div>
      <div className="h-5 w-1/2 bg-gray-700 rounded-md animate-pulse"></div>
    </div>
  </motion.div>
);

const LoadingSpinner = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex justify-center py-8"
  >
    <div className="h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </motion.div>
);

const SemestersPage = () => {
  const { course } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const commonFilesSectionRef = useRef(null);
  const dropdownRef = useRef(null);

  const [semesterData, setSemesterData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadPage, setShowUploadPage] = useState(false);
  const [commonFiles, setCommonFiles] = useState([]);
  const [commonFilesLoading, setCommonFilesLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [isYearOptionsOpen, setIsYearOptionsOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const courseKey = useMemo(() => course?.toUpperCase(), [course]);
  const displayCourseName = useMemo(() => courseKey?.replace(/_/g, ' '), [courseKey]);

  const semesterNumbers = useMemo(() =>
    semestersByCourse[courseKey] || [],
    [courseKey]
  );

  const uniqueYears = useMemo(() => {
    const years = [...new Set(commonFiles.map(file => file.year).filter(Boolean))];
    return years.sort((a, b) => b - a);
  }, [commonFiles]);

  const filteredCommonFiles = useMemo(() =>
    selectedYear
      ? commonFiles.filter(file => file.year == selectedYear)
      : commonFiles,
    [commonFiles, selectedYear]
  );

  const fetchPaperCounts = useCallback(async () => {
    if (!courseKey || semesterNumbers.length === 0) {
      setSemesterData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const promises = semesterNumbers.map(semId =>
        fetch(`${API_URL}/api/files/fetchCourseAndSemester`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ course: courseKey, semester: semId }),
        }).then(res => res.json()).catch(() => ({ success: false }))
      );

      const results = await Promise.all(promises);

      const newSemesterData = semesterNumbers.map((sem, index) => {
        const paperCount = results[index]?.success ? results[index].data.length : 0;
        return {
          id: parseInt(sem),
          title: `${sem}${getOrdinalSuffix(parseInt(sem))} Semester`,
          description: `Access previous year papers for the ${sem}${getOrdinalSuffix(parseInt(sem))} semester.`,
          icon: icons[index % icons.length],
          paperCount: paperCount,
        };
      });
      setSemesterData(newSemesterData);
    } catch (error) {
      console.error("Error fetching paper counts:", error);
      const fallbackData = semesterNumbers.map((sem, index) => ({
        id: parseInt(sem),
        title: `${sem}${getOrdinalSuffix(parseInt(sem))} Semester`,
        description: `Access previous year papers for the ${sem}${getOrdinalSuffix(parseInt(sem))} semester.`,
        icon: icons[index % icons.length],
        paperCount: 0,
      }));
      setSemesterData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  }, [courseKey, semesterNumbers]);

  const fetchCommonFiles = useCallback(async () => {
    if (!courseKey) return;

    setCommonFilesLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/files/fetchCourseAndSemester`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course: courseKey, semester: "0" }),
      });

      const result = await response.json();
      if (result.success) {
        setCommonFiles(result.data);
      } else {
        setCommonFiles([]);
      }
    } catch (error) {
      console.error("Error fetching common files:", error);
      setCommonFiles([]);
    } finally {
      setCommonFilesLoading(false);
    }
  }, [courseKey]);

  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        setShowScrollButton(window.scrollY < 150);
        timeoutId = null;
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleScrollToCommonFiles = useCallback(() => {
    const offset = 220;
    if (commonFilesSectionRef.current) {
      const elementPosition = commonFilesSectionRef.current.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    fetchPaperCounts();
  }, [fetchPaperCounts]);

  useEffect(() => {
    let lastKeyPress = 0;
    const DEBOUNCE_DELAY = 150;

    const now = Date.now();
    if (now - lastKeyPress < DEBOUNCE_DELAY) return;
    lastKeyPress = now;

    const handleKeyDown = (e) => {
      if (!e || !e.key) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        e.stopPropagation();
        if (commonFilesSectionRef.current) {
          const headerHeight = 220;
          const elementPosition = commonFilesSectionRef.current.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    fetchCommonFiles();
  }, [fetchCommonFiles]);

  const handleFileClick = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const handleSemesterClick = useCallback((semesterId) => {
    if (!localStorage.getItem("lastLoginEmail")) {
      toast.error('User Must Be Logged In.', {
        style: {
          border: '1px solid #713200',
          padding: '16px',
          color: '#713200',
        },
        iconTheme: {
          primary: '#4ade80',
          secondary: '#ffffff',
        },
      });
      return;
    }
    navigate(`/scsit/${course}/semesters/${semesterId}`);
  }, [course, navigate]);

  const handleCloseViewer = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const setSubjectYearFilter = useCallback((year) => {
    setSelectedYear(year === 'all' ? null : year);
    setIsYearOptionsOpen(false);
  }, []);

  const handleNavigateToUpload = useCallback(() => {
    navigate('/upload');
  }, [navigate]);

  const handleBackToCourses = useCallback(() => {
    navigate('/scsit/courses');
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsYearOptionsOpen(false);
      }
    };

    if (isYearOptionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isYearOptionsOpen]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);

  const isExcludedRoute = location.pathname.startsWith("/login") || location.pathname === "/signup";
  const isMobile = window.innerWidth <= 768;
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !isExcludedRoute) {
        setIsSidebarOpen(true);
      }
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 30,
  });

  useEffect(() => {
    if (isLoading || !course) return;

    const queryParams = new URLSearchParams(location.search);
    const action = queryParams.get('action');
    const category = queryParams.get('category');
    const subjectName = queryParams.get('subject');

    if (action === 'redirect' && category) {
      const scrollTimeout = setTimeout(() => {
        const headerHeight = 100;
        let targetElement = null;
        const isCommonRequest = subjectName?.toLowerCase() === 'common';

        if (category === 'common' || isCommonRequest) {
          targetElement = commonFilesSectionRef.current;
        }

        if (targetElement) {
          const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          navigate(location.pathname, { replace: true });
        }
      }, 200);

      return () => clearTimeout(scrollTimeout);
    }
  }, [isLoading, course, location.search, location.pathname, navigate]);

  if (!isLoading && semesterNumbers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center justify-center p-0 pb-8 pt-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl p-8 max-w-lg mx-auto text-center border border-gray-700"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", bounce: 0.3 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Course Not Available</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            The course '{course}' has not been added yet or is not valid. Please contact the admins at SCSIT, Indore, for more information.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToCourses}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
          >
            Back to Courses
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (selectedFile) {
    return <FileViewer file={selectedFile} onClose={handleCloseViewer} />;
  }

  if (showUploadPage) {
    return <UploadPage onBack={() => setShowUploadPage(false)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...swipeHandlers}
      className="min-h-screen w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center justify-center p-0 pb-8 pt-16"
    >
      <Helmet>
        <title>{`${displayCourseName} Semesters - SCSIT Indore`}</title>
        <meta name="description" content={`Explore semesters for the ${displayCourseName} program at the School of Computer Science and IT, Indore.`} />
      </Helmet>

      <div className="w-full h-full flex flex-col flex-1">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12 mt-12 px-4"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            {displayCourseName} Semesters
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Access previous year examination papers for the {displayCourseName} program.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(52, 211, 153, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNavigateToUpload}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            >
              Upload Papers
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full px-8 flex-1"
        >
          {isLoading ? (
            Array.from({ length: semesterNumbers.length || 4 }).map((_, index) => (
              <SemesterCardSkeleton key={index} />
            ))
          ) : (
            semesterData.map((semester, index) => {
              const IconComponent = semester.icon;
              return (
                <motion.div
                  key={semester.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSemesterClick(semester.id)}
                  className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer border border-gray-700 hover:border-green-500 transition-all duration-300 h-full flex flex-col justify-between"
                >
                  <div className="p-8 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="mb-6"
                    >
                      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{semester.title}</h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{semester.description}</p>
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">{semester.paperCount} Papers Available</span>
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-gray-900 bg-opacity-50">
                    <div className="w-full py-2 text-center text-green-400 font-semibold hover:text-green-300 transition-colors">
                      View Resources →
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full px-8 mt-12 mb-8"
          ref={commonFilesSectionRef}
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text mb-8">
            {displayCourseName} Common Files
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700"
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Files Common for {displayCourseName} Semesters
                  </h2>
                  <p className="text-gray-300">
                    Shared resources and documents for the entire {displayCourseName} program
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {uniqueYears.length > 0 && (
                    <div className="relative" ref={dropdownRef}>
                      <div className="relative w-full sm:w-48">
                        <button
                          onClick={() => setIsYearOptionsOpen(!isYearOptionsOpen)}
                          className="flex w-full items-center justify-between gap-2 bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 px-4 py-2 text-white hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {selectedYear ? (
                              <X size={20} className="text-gray-400 cursor-pointer" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSubjectYearFilter('all');
                              }} />
                            ) : (
                              <Filter size={20} className="text-gray-400" />
                            )}
                            <span className="capitalize truncate">
                              {selectedYear || 'all years'}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform duration-300 ${isYearOptionsOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        <AnimatePresence>
                          {isYearOptionsOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-10 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/80 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                              <ul className="p-1 max-h-36 overflow-y-auto">
                                <li>
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSubjectYearFilter('all');
                                      setIsYearOptionsOpen(false);
                                    }}
                                    className="block rounded-lg px-4 py-2 text-white hover:bg-green-500/10 transition-colors"
                                  >
                                    All Years
                                  </a>
                                </li>
                                {uniqueYears.map((year) => (
                                  <li key={year}>
                                    <a
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setSubjectYearFilter(year);
                                        setIsYearOptionsOpen(false);
                                      }}
                                      className="block rounded-lg px-4 py-2 text-white capitalize hover:bg-green-500/10 transition-colors truncate"
                                    >
                                      {year}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  <RWebShare
                    data={{
                      text: `Check out common files for ${displayCourseName} Course`,
                      url: `${CLIENT_URL}/scsit/${course}/semesters?action=redirect&category=common`,
                      title: `LastMinute SCSIT Shared you common files for - ${displayCourseName} Course`,
                    }}
                  >
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        boxShadow: "0 5px 15px rgba(52, 211, 153, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex h-12 items-center gap-2 rounded-xl border border-gray-600 bg-gray-800/70 px-4 text-white backdrop-blur-xl transition-all duration-200 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 shadow-lg"
                      aria-label="Share common files"
                    >
                      <Share2 size={18} className="text-gray-400 transition-colors group-hover:text-green-400" />
                    </motion.button>
                  </RWebShare>
                </div>
              </div>
            </div>

            <div className="p-6">
              {commonFilesLoading ? (
                <LoadingSpinner />
              ) : filteredCommonFiles.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {filteredCommonFiles.map((file, index) => (
                    <motion.div
                      key={file._id || index}
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFileClick(file)}
                      className="bg-gray-700 bg-opacity-60 rounded-xl p-4 cursor-pointer border border-gray-600 hover:border-green-500 transition-all duration-300 backdrop-blur-sm"
                    >
                      <div className="flex items-start space-x-3">
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          className="flex-shrink-0"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            {file?.type === "document" && (
                              <FileText className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                            )}
                            {file?.type === "image" && (
                              <Image className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                            )}
                            {file?.type === "text" && (
                              <Text className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                            )}
                          </div>
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm md:text-base mb-1 truncate">
                            {file.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{file.year || "Unknown"}</span>
                            <span className="text-gray-500">•</span>
                            <span className="uppercase">{file.type}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, type: "spring", bounce: 0.3 }}
                    className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4"
                  >
                    <FileText className="w-8 h-8 text-gray-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Common Files Found</h3>
                  <p className="text-gray-400 mb-6">
                    {selectedYear
                      ? `No files available for year ${selectedYear}`
                      : `No common files have been uploaded for this course yet`}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(52, 211, 153, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNavigateToUpload}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                  >
                    Upload Common Files
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showScrollButton && filteredCommonFiles.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(52, 211, 153, 0.3)",
              transition: { duration: 0.15, ease: "easeOut" }
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleScrollToCommonFiles}
            className="flex gap-1 fixed bottom-8 right-8 z-40 rounded-full bg-green-500 p-3 text-white shadow-lg transition-colors duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Scroll to common file"
          >
            <motion.span
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="hidden sm:block"
            >
              Go to Common Files
            </motion.span>
            <motion.div
              animate={{ y: [0, 2, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <ChevronsDown className="h-6 w-6" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SemestersPage;