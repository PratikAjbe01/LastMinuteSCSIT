"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronsDown,
  FileText,
  Filter,
  Image,
  Share2,
  Text,
  X,
} from "lucide-react";
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import loadingGif from "../../public/loadinggif.gif";
import { ValuesContext } from "../context/ValuesContext";
import FileViewer from "../fileComponents/FileViewer";
import {
  NotesResourceTypes,
  courses,
  subjectsByCourseAndSemester,
} from "../utils/Data";
import { API_URL, CLIENT_URL } from "../utils/urls";
import { RWebShare } from "react-web-share";
import Tooltip from '@mui/material/Tooltip';
import { useAuthStore } from "../store/authStore";
import { handle } from './../../node_modules/remark-deflist/node_modules/mdast-util-to-markdown/lib/handle/index';
import SubjectFilesModal from "../components/SubjectFilesModal";

const INITIAL_ITEMS_TO_SHOW = 3;

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

const getUniqueYears = (papers) => {
  const years = [...new Set(papers.map((p) => p.year).filter(Boolean))];
  return years.sort((a, b) => b - a);
};

const FileItem = memo(({ file, onClick, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.2,
      delay: index * 0.02,
      ease: "easeOut"
    }}
    whileHover={{
      scale: 1.01,
      transition: { duration: 0.15, ease: "easeOut" }
    }}
    whileTap={{
      scale: 0.99,
      transition: { duration: 0.1 }
    }}
    onClick={() => onClick(file)}
    className="cursor-pointer rounded-xl border border-gray-600 bg-gray-700 bg-opacity-50 p-3 transition-colors duration-200 hover:border-green-500 sm:p-4"
  >
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 transition-transform duration-200 hover:scale-105 sm:h-10 sm:w-10">
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
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-xs font-semibold text-white transition-colors duration-150 sm:text-sm md:text-base">
          {file.name}
        </h3>
        <div className="flex items-center space-x-2 text-xs text-gray-400 transition-colors duration-150">
          <Calendar className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
          <span>{file.year || "Unknown"}</span>
          {file.resourceType && (
            <>
              {file.resourceType !== "none" && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="uppercase">
                    {file.resourceType || "Unknown"}
                  </span>
                </>
              )}
            </>
          )}
          <span className="text-gray-500">•</span>
          <span className="uppercase">
            {file.type === "document" ? "PDF" : file.type || "File"}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
));

const Dropdown = memo(({
  isOpen,
  onToggle,
  onSelect,
  selectedValue,
  options,
  placeholder,
  showClearIcon = true
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  const handleOptionClick = useCallback((option, e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(option);
    onToggle(false);
  }, [onSelect, onToggle]);

  const handleClearClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(null);
  }, [onSelect]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2 text-white backdrop-blur-xl backdrop-filter transition-all duration-200 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedValue && showClearIcon ? (
            <X
              size={20}
              className="cursor-pointer text-gray-400 transition-all duration-200 hover:scale-110 hover:text-gray-100"
              onClick={handleClearClick}
            />
          ) : (
            <Filter size={20} className="text-gray-400" />
          )}
          <span className="truncate capitalize">
            {selectedValue || placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/95 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <ul className="p-1 max-h-36 overflow-y-auto" role="listbox">
              <li role="option">
                <button
                  onClick={(e) => handleOptionClick(null, e)}
                  className="w-full text-left block rounded-lg px-4 py-2 text-white transition-colors hover:bg-green-500/10"
                >
                  {placeholder.includes('type') ? 'All Types' : 'All Years'}
                </button>
              </li>
              {options.map((option) => (
                <li key={option.value || option} role="option">
                  <button
                    onClick={(e) => handleOptionClick(option.value || option, e)}
                    className="w-full text-left block rounded-lg px-4 py-2 capitalize text-white transition-colors hover:bg-green-500/10"
                  >
                    {option.label || option}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const SubjectCard = memo(({ subject, selectedCategory, categoryDescriptions, onFileClick, initialDelay, semester, course, onTotalFilesTextClick, subjectFiles }) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [isYearOptionsOpen, setIsYearOptionsOpen] = useState(false);
  const [isTypeOptionsOpen, setIsTypeOptionsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const filteredPapers = useMemo(() =>
    subject.papers.filter((paper) => paper.category === selectedCategory),
    [subject.papers, selectedCategory]
  );

  const years = useMemo(() => getUniqueYears(filteredPapers), [filteredPapers]);
  const types = useMemo(() => {
    const uniqueTypes = [...new Set(filteredPapers.map((p) => p.resourceType).filter(Boolean))];

    if (selectedCategory === "paper") {
      return uniqueTypes.sort();
    } else if (selectedCategory === "notes") {
      return Object.values(NotesResourceTypes).filter(noteType =>
        uniqueTypes.includes(noteType.value)
      );
    } else if (selectedCategory === "syllabus") {
      return uniqueTypes.sort();
    }
    return [];
  }, [filteredPapers, selectedCategory]);

  const displayPapers = useMemo(() => {
    let papers = filteredPapers;
    if (selectedYear) papers = papers.filter((paper) => paper.year == selectedYear);
    if (selectedType) papers = papers.filter((paper) => paper.resourceType === selectedType);
    return papers;
  }, [filteredPapers, selectedYear, selectedType]);

  const papersToShow = useMemo(() =>
    showAll ? displayPapers : displayPapers.slice(0, INITIAL_ITEMS_TO_SHOW),
    [showAll, displayPapers]
  );

  const handleYearFilter = useCallback((year) => {
    setSelectedYear(year);
    if (year && !selectedType) setShowAll(true);
    else if (!year && !selectedType) setShowAll(false);
  }, [selectedType]);

  const handleTypeFilter = useCallback((type) => {
    setSelectedType(type);
    if (type) setShowAll(true);
    else if (!selectedYear && !type) setShowAll(false);
  }, [selectedYear]);

  const toggleShowAll = useCallback(() => setShowAll(prev => !prev), []);

  useEffect(() => {
    setSelectedYear(null);
    setSelectedType(null);
    setShowAll(false);
  }, [selectedCategory])

  const shareParams = new URLSearchParams({
    action: "redirect",
    category: selectedCategory,
    subject: subject.name,
  }).toString();

  const shareUrl = `${CLIENT_URL}/scsit/${course}/semesters/${semester}?${shareParams}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * initialDelay }}
      className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 bg-opacity-50 pb-2 backdrop-blur-xl backdrop-filter"
    >
      <div className="border-b border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="mb-1 text-lg font-bold text-white sm:text-xl md:text-2xl">
              {subject.name}
            </h2>
            <p className="text-sm text-gray-300 sm:text-base cursor-pointer hover:text-gray-600" onClick={()=>onTotalFilesTextClick(subjectFiles, subject.name)}>
              {categoryDescriptions[selectedCategory]} • {filteredPapers.length} Files
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            {years.length > 0 && (
              <Dropdown
                isOpen={isYearOptionsOpen}
                onToggle={setIsYearOptionsOpen}
                onSelect={handleYearFilter}
                selectedValue={selectedYear}
                options={years}
                placeholder="years"
              />
            )}
            {displayPapers.length > 0 && types.length > 1 && (
              <Dropdown
                isOpen={isTypeOptionsOpen}
                onToggle={setIsTypeOptionsOpen}
                onSelect={handleTypeFilter}
                selectedValue={selectedType}
                options={types}
                placeholder="types"
              />
            )}
            <RWebShare
              data={{
                text: `Check out files for ${subject.name} in ${course.toUpperCase()} Semester ${semester}`,
                url: shareUrl,
                title: `LastMinute SCSIT Shared you a subject - ${subject?.name}`,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(52, 211, 153, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="group flex h-10 items-center rounded-xl border border-gray-700 bg-gray-800/50 px-3 text-white backdrop-blur-xl backdrop-filter transition-colors duration-200 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                aria-label={`Share subject ${subject.name}`}
              >
                <Share2 size={16} className="text-gray-400 transition-colors group-hover:text-green-400" />
              </motion.button>
            </RWebShare>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {displayPapers.length > 0 ? (
            <motion.div
              key={`${selectedCategory}-${selectedYear}-${selectedType}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {papersToShow.map((paper, paperIndex) => (
                <FileItem
                  key={`${paper._id || paperIndex}`}
                  file={paper}
                  onClick={onFileClick}
                  index={paperIndex}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="col-span-full py-4 text-center text-sm text-gray-400 sm:text-base"
            >
              No {categoryDescriptions[selectedCategory]?.toLowerCase().replace(" previous year examination papers", "s")} available for this subject {selectedYear ? `in ${selectedYear}` : ""}.
            </motion.div>
          )}
        </AnimatePresence>

        {displayPapers.length > INITIAL_ITEMS_TO_SHOW && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="mt-4 flex justify-center"
          >
            <motion.button
              onClick={toggleShowAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300 transition-colors duration-200"
            >
              <motion.span
                key={showAll ? 'less' : 'more'}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
              >
                {showAll ? "Show Less" : "Show All"}
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="rounded-full bg-gray-700 px-2 py-0.5 text-xs transition-colors duration-150 hover:bg-gray-600"
              >
                {showAll ? 3 : displayPapers.length}
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

const DocumentsPage = () => {
  const { course, semesterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { setIsSidebarOpen } = useContext(ValuesContext);
  const commonFilesSectionRef = useRef(null);

  const [state, setState] = useState({
    semesterData: null,
    wholeSemesterFiles: [],
    loading: true,
    error: null,
    selectedFile: null,
    selectedCategory: "paper",
    showScrollButton: true,
    selectedCommonYear: null,
    isCommonYearOptionsOpen: false
  });

  const [subjectModalFiles, setSubjectModalFiles] = useState([]);
  const [subjectModalName, setSubjectModalName] = useState("");

  const semester = useMemo(() => parseInt(semesterId, 10), [semesterId]);
  const selectedCourseInfo = useMemo(() =>
    courses.find((c) => c.value === course?.toUpperCase()), [course]
  );
  const courseLabel = selectedCourseInfo ? selectedCourseInfo.label : "Unknown Course";

  const categories = useMemo(() => [
    { value: "paper", label: "Question Papers" },
    { value: "notes", label: "Notes" },
    { value: "syllabus", label: "Syllabus" }
  ], []);

  const categoryDescriptions = useMemo(() => ({
    paper: "Previous year examination papers",
    notes: "Lecture notes and study materials",
    syllabus: "Course syllabus and outlines"
  }), []);

  useEffect(() => {
    const fetchAndProcessFiles = async () => {
      if (!selectedCourseInfo || isNaN(semester)) {
        setState(prev => ({
          ...prev,
          error: "Invalid course or semester specified.",
          loading: false
        }));
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const response = await fetch(`${API_URL}/api/files/fetchCourseAndSemester`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ course: selectedCourseInfo.value, semester }),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        if (!result.success) throw new Error(result.message || "Failed to fetch files");
        if (!Array.isArray(result.data)) throw new Error("Invalid data format from server");

        const courseKey = selectedCourseInfo.value.toUpperCase();
        const semesterKey = semester.toString();
        const baseSemesterStructure = ALL_SEMESTER_DATA[courseKey]?.[semesterKey];

        if (!baseSemesterStructure) {
          throw new Error("No subject data found for this course and semester.");
        }

        const filesBySubject = result.data.reduce((acc, file) => {
          const subject = file.subject;
          if (!acc[subject]) acc[subject] = [];
          acc[subject].push(file);
          return acc;
        }, {});

        const wholeSemesterFiles = filesBySubject["Whole Semester"] || [];
        const updatedSemester = {
          ...baseSemesterStructure,
          subjects: baseSemesterStructure.subjects
            .filter(s => s.name !== "Whole Semester")
            .map((subject) => ({
              ...subject,
              papers: filesBySubject[subject.name] || []
            })),
        };

        setState(prev => ({
          ...prev,
          semesterData: updatedSemester,
          wholeSemesterFiles,
          loading: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err.message,
          loading: false
        }));
      }
    };

    fetchAndProcessFiles();
  }, [course, semesterId, selectedCourseInfo]);

  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        setState(prev => ({ ...prev, showScrollButton: window.scrollY < 150 })); 
        timeoutId = null;
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "p":
          case "a":
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

  useEffect(() => {
    if (!state.semesterData?.subjects || state.semesterData.subjects.length === 0) return;

    let sameLetterIndex = {};
    let lastKeyPress = 0;
    const DEBOUNCE_DELAY = 150;

    const subjectMap = {};
    state.semesterData.subjects.forEach((subject, index) => {
      if (subject && subject.name) {
        const firstLetter = subject.name.charAt(0).toLowerCase();
        if (!subjectMap[firstLetter]) subjectMap[firstLetter] = [];
        subjectMap[firstLetter].push({ subject, index });
      }
    });

    const handleKeyDown = (e) => {
      if (!e || !e.key) return;

      const now = Date.now();
      if (now - lastKeyPress < DEBOUNCE_DELAY) return;
      lastKeyPress = now;

      if ((e.shiftKey || e.metaKey) && e.code.startsWith('Digit')) {
        e.preventDefault();
        e.stopPropagation();
        const number = parseInt(e.code.slice(-1));
        const subjectIndex = number === 0 ? 9 : number - 1;

        if (subjectIndex >= 0 && subjectIndex < state.semesterData.subjects.length) {
          const subjectCards = document.querySelectorAll('[data-subject-card]');
          const targetCard = subjectCards[subjectIndex];

          if (targetCard) {
            const headerHeight = 220;
            const elementPosition = targetCard.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
        return;
      }

      if (e.key.length === 1 && e.key.match(/[a-z]/i) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const letter = e.key.toLowerCase();
        const matchingSubjects = subjectMap[letter];

        if (matchingSubjects && matchingSubjects.length > 0) {
          if (sameLetterIndex[letter] === undefined) {
            sameLetterIndex[letter] = 0;
          } else {
            sameLetterIndex[letter] = (sameLetterIndex[letter] + 1) % matchingSubjects.length;
          }

          const targetSubject = matchingSubjects[sameLetterIndex[letter]];
          const subjectCards = document.querySelectorAll('[data-subject-card]');
          const targetCard = subjectCards[targetSubject.index];

          if (targetCard) {
            const headerHeight = 220;
            const elementPosition = targetCard.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      }

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

    const resetIndices = () => {
      sameLetterIndex = {};
    };

    document.addEventListener('keydown', handleKeyDown);
    resetIndices();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.semesterData?.subjects]);

  const handleFileClick = useCallback((file) => {
    setState(prev => ({ ...prev, selectedFile: file }));
  }, []);

  const handleCloseViewer = useCallback(() => {
    setState(prev => ({ ...prev, selectedFile: null }));
  }, []);

  const onBack = useCallback(() => {
    navigate(`/scsit/${course}/semesters/`);
  }, [navigate, course]);

  const handleCategoryChange = useCallback((category) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const handleCommonYearChange = useCallback((year) => {
    setState(prev => ({ ...prev, selectedCommonYear: year }));
  }, []);

  const commonUniqueYears = useMemo(() =>
    getUniqueYears(state.wholeSemesterFiles), [state.wholeSemesterFiles]
  );

  const filteredCommonFiles = useMemo(() =>
    state.selectedCommonYear
      ? state.wholeSemesterFiles.filter((file) => file.year == state.selectedCommonYear)
      : state.wholeSemesterFiles,
    [state.wholeSemesterFiles, state.selectedCommonYear]
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(true);
      }
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 50,
    trackTouch: true,
  });

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

  const onTotalFilesTextClick = (subject, name) => {
    setSubjectModalFiles(subject);
    setSubjectModalName(name);
    console.log(subjectModalFiles, name)
  }

  const handleCloseSubjectModal = useCallback(() => {
    setSubjectModalFiles(null);
  }, []);

  const handleSubjectModalFileClick = useCallback((file) => {
    setState(prev => ({ ...prev, selectedFile: file }));
  }, []);

  useEffect(() => {
    if (state.loading || !state.semesterData) {
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const action = queryParams.get('action');
    const category = queryParams.get('category');
    const subjectName = queryParams.get('subject');

    if (action === 'redirect' && category) {
      setState(prev => ({ ...prev, selectedCategory: category }));

      const scrollTimeout = setTimeout(() => {
        const headerHeight = 220;
        let targetElement = null;
        const isCommonRequest = subjectName?.toLowerCase() === 'common';

        if (subjectName && !isCommonRequest) {
          const subjectIndex = state.semesterData.subjects.findIndex(s => s.name === subjectName);
          if (subjectIndex !== -1) {
            targetElement = document.querySelector(`[data-subject-card='${subjectIndex}']`);
          }
        } else if (category === 'common' || isCommonRequest) {
          targetElement = commonFilesSectionRef.current;
        }

        if (targetElement) {
          const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - (category === 'common' ? 260 : headerHeight);

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          navigate(location.pathname, { replace: true });
        }
      }, 200);

      return () => clearTimeout(scrollTimeout);
    }
  }, [state.loading, state.semesterData, location.search, location.pathname, navigate]);

  if (state.loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
        <img
          src={loadingGif}
          alt="Loading..."
          className="h-32 w-32 sm:h-48 sm:w-48 md:h-60 md:w-60"
          loading="eager"
        />
      </div>
    );
  }

  if (state.error || !state.semesterData) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black p-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-500">An Error Occurred</h1>
          <p className="mb-6 text-gray-300">
            {state.error || "No data available for this semester."}
          </p>
          <button
            onClick={onBack}
            className="mx-auto flex items-center space-x-2 text-green-400 transition-colors hover:text-green-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div {...swipeHandlers} className={`flex min-h-screen w-full flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-black p-0 ${state.selectedFile ? "overflow-hidden" : ""}`}>
      <Helmet>
        <title>{`${course?.toUpperCase()} - ${state.semesterData.title} | SCSIT`}</title>
        <meta name="description" content={`Documents for ${courseLabel} ${state.semesterData.title}.`} />
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-20 rounded-b-2xl border-b border-gray-700 bg-gray-800 bg-opacity-50 px-4 pt-16 backdrop-blur-xl backdrop-filter sm:px-6 sm:pt-20 md:px-8"
      >
        <div className="flex flex-col items-center justify-between pt-2 sm:flex-row">
          <h1 className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
            {courseLabel}
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-white sm:mt-0 sm:text-2xl md:text-3xl">
            {state.semesterData.title}
          </h2>
        </div>

        <div className="mt-4 flex items-center justify-between pb-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.15 }
            }}
            whileTap={{
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
            onClick={onBack}
            className="flex items-center space-x-2 text-green-400 transition-colors duration-200 hover:text-green-300"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back</span>
          </motion.button>

          <div className="flex flex-wrap justify-end gap-2 sm:gap-4">
            {categories.map((cat, index) => (
              <motion.button
                key={cat.value}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.15 }
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
                className={`rounded-lg px-3 py-1 text-sm font-semibold transition-all duration-200 sm:px-4 sm:py-2 ${state.selectedCategory === cat.value
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                onClick={() => handleCategoryChange(cat.value)}
              >
                <motion.span
                  key={`${cat.value}-${state.selectedCategory === cat.value}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {cat.label}
                </motion.span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Subject Cards */}
      <div className="my-8 w-full flex-1 space-y-6 px-4 sm:space-y-8 sm:px-6 md:px-8">
        {state.semesterData.subjects.length > 0 ? (
          state.semesterData.subjects.map((subject, subjectIndex) => (
            <div
              key={subject.name}
              data-subject-card={subjectIndex}
            >
              <SubjectCard
                subject={subject}
                selectedCategory={state.selectedCategory}
                categoryDescriptions={categoryDescriptions}
                onFileClick={handleFileClick}
                initialDelay={subjectIndex}
                course={course}
                semester={semester} 
                onTotalFilesTextClick={onTotalFilesTextClick}
                subjectFiles={state.semesterData.subjects}
              />
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-sm text-gray-300 sm:text-base">
            No subject-specific files found for this semester.
          </div>
        )}
      </div>

      {/* Common Files Section */}
      {state.wholeSemesterFiles.length > 0 && (
        <div
          ref={commonFilesSectionRef}
          className="mb-8 mt-4 w-full px-4 sm:px-6 md:px-8 scroll-mt-16 sm:scroll-mt-20"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
          >
            Common Files for Semester
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-xl backdrop-filter"
          >
            <div className="border-b border-gray-700 p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="mb-1 text-2xl font-bold text-white">
                    Files for the Whole Semester
                  </h2>
                  <p className="text-gray-300">
                    Shared resources applicable to all subjects in this semester.
                  </p>
                </div>

                {commonUniqueYears.length > 0 && (
                  <div className="relative w-full sm:w-48 flex flex-row gap-2 sm:gap-3">
                    <Tooltip title="Share Common files" arrow className="!z-50">
                      <Dropdown
                        isOpen={state.isCommonYearOptionsOpen}
                        onToggle={(isOpen) => setState(prev => ({
                          ...prev,
                          isCommonYearOptionsOpen: isOpen
                        }))}
                        onSelect={handleCommonYearChange}
                        selectedValue={state.selectedCommonYear}
                        options={commonUniqueYears}
                        placeholder="all years"
                      />
                    </Tooltip>
                    <Tooltip title="Share Common files" arrow className="!z-50">
                      <RWebShare
                        data={{
                          text: `Check out common files for ${course.toUpperCase()} Semester ${semester}`,
                          url: `${CLIENT_URL}/scsit/${course}/semesters/${semesterId}?action=redirect&category=common`,
                          title: `LastMinute SCSIT Shared you common files for - ${course.toUpperCase()} Semester ${semester}`,
                        }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: 'rgba(52, 211, 153, 0.1)' }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="group flex h-10 items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-3 text-white backdrop-blur-xl backdrop-filter transition-colors duration-200 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                          aria-label={`Share common files`}
                        >
                          <Share2 size={16} className="text-gray-400 transition-colors group-hover:text-green-400" />
                        </motion.button>
                      </RWebShare>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, staggerChildren: 0.02 }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredCommonFiles.map((file, index) => (
                  <FileItem
                    key={file._id || index}
                    file={file}
                    onClick={handleFileClick}
                    index={index}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Scroll to Common Files Button */}
      <AnimatePresence>
        {state.showScrollButton && state.wholeSemesterFiles.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.15, ease: "easeOut" }
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleScrollToCommonFiles}
            className="flex gap-1 fixed bottom-8 right-8 z-40 rounded-full bg-green-500 p-3 text-white shadow-lg transition-colors duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Scroll to common files"
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

      {/* File Viewer Modal */}
      {state.selectedFile && (
        <FileViewer file={state.selectedFile} onClose={handleCloseViewer} />
      )}
      {subjectModalFiles && subjectModalFiles.length > 0 && (
        <SubjectFilesModal
          subject={subjectModalFiles}
          subjectName={subjectModalName}
          onClose={handleCloseSubjectModal}
          onFileClick={handleSubjectModalFileClick} 
          category={state.selectedCategory}
        />
      )}
    </div>
  );
};

export default DocumentsPage;