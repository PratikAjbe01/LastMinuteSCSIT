"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Filter,
  ChevronDown,
  Cross,
  X,
  Image,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileViewer from "../fileComponents/FileViewer";
import { Helmet } from "react-helmet-async";
import loadingGif from "../../public/loadinggif.gif";
import { API_URL } from "../utils/urls";
import { useSwipeable } from "react-swipeable";
import { ValuesContext } from "../context/ValuesContext";
import {
  courses,
  semestersByCourse,
  subjectsByCourseAndSemester,
} from "../utils/Data";

const createSemesterData = (subjects) =>
  subjects.map((name) => ({ name, papers: [] }));

const ALL_SEMESTER_DATA = {};
Object.keys(subjectsByCourseAndSemester).forEach((courseKey) => {
  ALL_SEMESTER_DATA[courseKey] = {};
  const courseData = subjectsByCourseAndSemester[courseKey];
  Object.keys(courseData).forEach((semesterKey) => {
    const subjectNames = courseData[semesterKey];
    ALL_SEMESTER_DATA[courseKey][semesterKey] = {
      title: `${semesterKey}${getOrdinalSuffix(parseInt(semesterKey))} Semester`,
      subjects: createSemesterData(subjectNames),
    };
  });
});

function getOrdinalSuffix(n) {
  if (n === 0) return "All";
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

const DocumentsPage = () => {
  const { course, semesterId } = useParams();
  const semester = parseInt(semesterId, 10);
  const navigate = useNavigate();
  const [semesterData, setSemesterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("paper");
  const [subjectFilters, setSubjectFilters] = useState({});
  const [subjectTypeFilters, setSubjectTypeFilters] = useState({});

  const categories = [
    { value: "paper", label: "Question Papers" },
    { value: "notes", label: "Notes" },
    { value: "syllabus", label: "Syllabus" },
  ];

  const categoryDescriptions = {
    paper: "Previous year examination papers",
    notes: "Lecture notes and study materials",
    syllabus: "Course syllabus and outlines",
  };

  const handleCloseViewer = () => {
    setSelectedFile(null);
  };

  const selectedCourseInfo = courses.find(
    (c) => c.value === course?.toUpperCase(),
  );
  const courseLabel = selectedCourseInfo
    ? selectedCourseInfo.label
    : "Unknown Course";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchAndProcessFiles = async () => {
      if (!selectedCourseInfo || isNaN(semester)) {
        setError("Invalid course or semester specified.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/files/fetchCourseAndSemester`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              course: selectedCourseInfo.value,
              semester,
            }),
          },
        );

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        if (!result.success)
          throw new Error(result.message || "Failed to fetch files");

        const courseKey = selectedCourseInfo.value.toUpperCase();
        const semesterKey = semester.toString();
        const baseSemesterStructure =
          ALL_SEMESTER_DATA[courseKey]?.[semesterKey];

        if (!baseSemesterStructure) {
          throw new Error(
            "No subject data found for this course and semester.",
          );
        }

        const filesBySubject = result.data.reduce((acc, file) => {
          const subject = file.subject;
          if (!acc[subject]) acc[subject] = [];
          acc[subject].push(file);
          return acc;
        }, {});

        const updatedSemester = {
          ...baseSemesterStructure,
          subjects: baseSemesterStructure.subjects
            .filter((subject) => {
              if (
                selectedCategory === "paper" ||
                selectedCategory === "notes"
              ) {
                return subject.name !== "Whole Semester";
              }
              return true;
            })
            .map((subject) => ({
              ...subject,
              papers: filesBySubject[subject.name] || [],
            })),
        };

        setSemesterData(updatedSemester);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessFiles();
  }, [course, semesterId, selectedCategory]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const onBack = () => {
    navigate(`/scsit/${course}/semesters/`);
  };

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
  const [showAllMap, setShowAllMap] = useState({});

  const toggleShowAll = (subjectName) => {
    setShowAllMap((prev) => ({
      ...prev,
      [subjectName]: !prev[subjectName],
    }));
  };

  const setSubjectYearFilter = (subjectName, year) => {
    setSubjectFilters((prev) => ({
      ...prev,
      [subjectName]: year === "all" ? null : year,
    }));
  };

  const setSubjectTypeFilter = (subjectName, type) => {
    setSubjectTypeFilters((prev) => ({
      ...prev,
      [subjectName]: type === "all" ? null : type,
    }));
  };

  const getUniqueYears = (papers) => {
    const years = [
      ...new Set(papers.map((paper) => paper.year).filter(Boolean)),
    ];
    return years.sort((a, b) => b - a);
  };

  const getUniqueTypes = (papers) => {
    console.log(papers);
    const types = [
      ...new Set(papers.map((paper) => paper.resourceType).filter(Boolean)),
    ];
    return types.sort();
  };

  const isExcludedRoute =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/login") ||
      window.location.pathname === "/signup");
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !isExcludedRoute) {
        setIsSidebarOpen(true);
        console.log("Swiped left - opening sidebar");
      }
    },
    onSwipedRight: () => {
      if (isMobile && !isExcludedRoute) {
        navigate("/scsit/mca/semesters/3");
      }
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 30,
  });

  const [isYearOptionsOpen, setIsYearOptionsOpen] = useState({});
  const [isTypeOptionsOpen, setIsTypeOptionsOpen] = useState({});

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center text-white">
        <img
          src={loadingGif}
          alt="Loading..."
          className="h-32 w-32 sm:h-48 sm:w-48 md:h-60 md:w-60"
        />
      </div>
    );
  }

  if (error || !semesterData) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            An Error Occurred
          </h1>
          <p className="text-gray-300 mb-6">
            {error || "No data available for this semester."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...swipeHandlers}
      className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black flex flex-col p-0"
    >
      <Helmet>
        <title>{`${course?.toUpperCase()} - ${semesterData.title} | SCSIT`}</title>
        <meta
          name="description"
          content={`Documents for ${courseLabel} ${semesterData.title}.`}
        />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-20 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-b-2xl border-b border-gray-700 pt-16 sm:pt-20 px-4 sm:px-6 md:px-8"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            {courseLabel}
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mt-2 sm:mt-0">
            {semesterData.title}
          </h2>
        </div>
        <div className="flex items-center justify-between mt-4 pb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back</span>
          </motion.button>
          <div className="flex flex-wrap justify-end gap-2 sm:gap-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 ${selectedCategory === cat.value ? "bg-green-500 text-white shadow-lg" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="space-y-6 sm:space-y-8 w-full px-4 sm:px-6 md:px-8 flex-1 my-8">
        {semesterData.subjects.length > 0 ? (
          semesterData.subjects.map((subject, subjectIndex) => {
            console.log(semesterData?.subjects);
            const filteredPapers = subject.papers.filter(
              (paper) => paper.category === selectedCategory,
            );
            const years = getUniqueYears(filteredPapers);
            const types = getUniqueTypes(filteredPapers);
            console.log(types);
            const selectedYear = subjectFilters[subject.name];
            const selectedType = subjectTypeFilters[subject.name];

            let displayPapers = filteredPapers;
            if (selectedYear) {
              displayPapers = displayPapers.filter(
                (paper) => paper.year == selectedYear,
              );
            }
            if (selectedType) {
              displayPapers = displayPapers.filter(
                (paper) => paper.resourceType === selectedType,
              );
            }

            const showAll = showAllMap[subject.name];
            const papersToShow = showAll
              ? displayPapers
              : displayPapers.slice(0, 6);

            return (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * subjectIndex }}
                className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700 pb-2"
              >
                <div className="p-4 sm:p-6 border-b border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                        {subject.name}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-300">
                        {categoryDescriptions[selectedCategory]} •{" "}
                        {filteredPapers.length} Papers
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {years.length > 0 && (
                        <div className="relative">
                          <div className="relative w-full">
                            <button
                              onClick={() =>
                                setIsYearOptionsOpen((prev) => ({
                                  ...prev,
                                  [subject.name]: !prev[subject.name],
                                }))
                              }
                              className="flex w-full items-center justify-between gap-2 bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 px-4 py-2 text-white hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
                            >
                              <div className="flex items-center gap-2 truncate">
                                {selectedYear ? (
                                  <X
                                    size={20}
                                    className="text-gray-400 cursor-pointer hover:text-gray-100 hover:scale-110 transition-all duration-200"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSubjectYearFilter(subject.name, "all");
                                    }}
                                  />
                                ) : (
                                  <Filter size={20} className="text-gray-400" />
                                )}
                                <span className="capitalize truncate">
                                  {selectedYear || "all years"}
                                </span>
                              </div>
                              <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform duration-300 ${isYearOptionsOpen[subject.name] ? "rotate-180" : ""}`}
                              />
                            </button>

                            <AnimatePresence>
                              {isYearOptionsOpen[subject.name] && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute z-10 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/80 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                >
                                  <ul className="p-1">
                                    <li>
                                      <a
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setSubjectYearFilter(
                                            subject.name,
                                            "all",
                                          );
                                          setIsYearOptionsOpen((prev) => ({
                                            ...prev,
                                            [subject.name]: false,
                                          }));
                                        }}
                                        className="block rounded-lg px-4 py-2 text-white hover:bg-green-500/10 transition-colors"
                                      >
                                        All Years
                                      </a>
                                    </li>
                                    {years.map((year) => (
                                      <li key={year}>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setSubjectYearFilter(
                                              subject.name,
                                              year,
                                            );
                                            setIsYearOptionsOpen((prev) => ({
                                              ...prev,
                                              [subject.name]: false,
                                            }));
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

                      {filteredPapers.length > 0 &&
                        types.length > 0 &&
                        selectedCategory === "paper" && (
                          <div className="relative">
                            <div className="relative w-full">
                              <button
                                onClick={() =>
                                  setIsTypeOptionsOpen((prev) => ({
                                    ...prev,
                                    [subject.name]: !prev[subject.name],
                                  }))
                                }
                                className="flex w-full items-center justify-between gap-2 bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 px-4 py-2 text-white hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {selectedType ? (
                                    <X
                                      size={20}
                                      className="text-gray-400 cursor-pointer hover:text-gray-100 hover:scale-110 transition-all duration-200"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSubjectTypeFilter(
                                          subject.name,
                                          "all",
                                        );
                                      }}
                                    />
                                  ) : (
                                    <Filter
                                      size={20}
                                      className="text-gray-400"
                                    />
                                  )}
                                  <span className="capitalize truncate">
                                    {selectedType || "all types"}
                                  </span>
                                </div>
                                <ChevronDown
                                  size={16}
                                  className={`text-gray-400 transition-transform duration-300 ${isTypeOptionsOpen[subject.name] ? "rotate-180" : ""}`}
                                />
                              </button>

                              <AnimatePresence>
                                {isTypeOptionsOpen[subject.name] && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute z-10 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/80 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                  >
                                    <ul className="p-1">
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setSubjectTypeFilter(
                                              subject.name,
                                              "all",
                                            );
                                            setIsTypeOptionsOpen((prev) => ({
                                              ...prev,
                                              [subject.name]: false,
                                            }));
                                          }}
                                          className="block rounded-lg px-4 py-2 text-white hover:bg-green-500/10 transition-colors"
                                        >
                                          All Types
                                        </a>
                                      </li>
                                      {types.map((type) => (
                                        <li key={type}>
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setSubjectTypeFilter(
                                                subject.name,
                                                type,
                                              );
                                              setIsTypeOptionsOpen((prev) => ({
                                                ...prev,
                                                [subject.name]: false,
                                              }));
                                            }}
                                            className="block rounded-lg px-4 py-2 text-white capitalize hover:bg-green-500/10 transition-colors truncate"
                                          >
                                            {type}
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
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {displayPapers.length > 0 ? (
                    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {papersToShow.map((paper, paperIndex) => (
                        <motion.div
                          key={`${paper._id || paperIndex}`}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleFileClick(paper)}
                          className="bg-gray-700 bg-opacity-50 rounded-xl p-3 sm:p-4 cursor-pointer border border-gray-600 hover:border-green-500 transition-all duration-300"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                {paper?.type === "document" ? (
                                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                ) : (
                                  <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base mb-1">
                                {paper.name}
                              </h3>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span>{paper.year || "Unknown"}</span>
                                <span className="text-gray-500">•</span>
                                {paper?.resourceType ? (
                                  <span className="uppercase">{paper.resourceType}</span>
                                ) : (
                                  <span className="uppercase">{paper.type || "Unknown"}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center col-span-full text-sm sm:text-base py-4">
                      No{" "}
                      {categories
                        .find((cat) => cat.value === selectedCategory)
                        ?.label.toLowerCase()}{" "}
                      available for this subject{" "}
                      {selectedYear ? `in ${selectedYear}` : ""}.
                    </div>
                  )}

                  {displayPapers.length > 6 && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => toggleShowAll(subject.name)}
                        className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1"
                      >
                        {showAll ? "Show Less" : "Show All"}
                        <span className="bg-gray-700 rounded-full px-2 py-0.5 text-xs">
                          {showAll ? 6 : displayPapers.length}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center text-gray-300 text-sm sm:text-base py-10">
            No subjects are defined for this semester.
          </div>
        )}
      </div>
      {selectedFile && (
        <FileViewer file={selectedFile} onClose={handleCloseViewer} />
      )}
    </div>
  );
};

export default DocumentsPage;
