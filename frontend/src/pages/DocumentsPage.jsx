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
  X,
} from "lucide-react";
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import loadingGif from "../../public/loadinggif.gif";
import { ValuesContext } from "../context/ValuesContext";
import FileViewer from "../fileComponents/FileViewer";
import {
  NotesResourceTypes,
  courses,
  subjectsByCourseAndSemester,
} from "../utils/Data";
import { API_URL } from "../utils/urls";

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

const FileItem = memo(({ file, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(file)}
    className="cursor-pointer rounded-xl border border-gray-600 bg-gray-700 bg-opacity-50 p-3 transition-all duration-300 hover:border-green-500 sm:p-4"
  >
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 sm:h-10 sm:w-10">
          {file?.type === "document" ? (
            <FileText className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          ) : (
            <Image className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 truncate text-xs font-semibold text-white sm:text-sm md:text-base">
          {file.name}
        </h3>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Calendar className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
          <span>{file.year || "Unknown"}</span>
          <span className="text-gray-500">•</span>
          <span className="uppercase">
            {file.resourceType || file.type || "Unknown"}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
));

const SubjectCard = memo(({ subject, selectedCategory, categoryDescriptions, onFileClick, initialDelay }) => {
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
  const types = useMemo(() => [...new Set(filteredPapers.map((p) => p.resourceType).filter(Boolean))].sort(), [filteredPapers]);

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

  const handleYearFilter = (year) => {
    const newYear = year === "all" ? null : year;
    setSelectedYear(newYear);
    if (newYear && !selectedType) setShowAll(true);
    else if (!newYear && !selectedType) setShowAll(false);
  };

  const handleTypeFilter = (type) => {
    const newType = type === "all" ? null : type;
    setSelectedType(newType);
    if (newType) setShowAll(true);
    else if (!selectedYear && !newType) setShowAll(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * initialDelay }}
      className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 bg-opacity-50 pb-2 backdrop-blur-xl backdrop-filter"
    >
      <div className="border-b border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="mb-1 text-lg font-bold text-white sm:text-xl md:text-2xl">{subject.name}</h2>
            <p className="text-sm text-gray-300 sm:text-base">{categoryDescriptions[selectedCategory]} • {filteredPapers.length} Files</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {years.length > 0 && (
              <div className="relative">
                <button onClick={() => setIsYearOptionsOpen(p => !p)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2 text-white backdrop-blur-xl backdrop-filter transition-all duration-200 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50">
                  <div className="flex items-center gap-2 truncate">
                    {selectedYear ? (<X size={20} className="cursor-pointer text-gray-400 transition-all duration-200 hover:scale-110 hover:text-gray-100" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleYearFilter("all"); }} />) : (<Filter size={20} className="text-gray-400" />)}
                    <span className="truncate capitalize">{selectedYear || "all years"}</span>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isYearOptionsOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isYearOptionsOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute z-10 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/80 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <ul className="p-1 max-h-36 overflow-y-auto">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); handleYearFilter("all"); setIsYearOptionsOpen(false); }} className="block rounded-lg px-4 py-2 text-white transition-colors hover:bg-green-500/10">All Years</a></li>
                        {years.map((year) => (<li key={year}><a href="#" onClick={(e) => { e.preventDefault(); handleYearFilter(year); setIsYearOptionsOpen(false); }} className="block truncate rounded-lg px-4 py-2 capitalize text-white transition-colors hover:bg-green-500/10">{year}</a></li>))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {displayPapers.length > 0 && types.length > 1 && selectedCategory === "paper" && (
              <div className="relative">
                <button onClick={() => setIsTypeOptionsOpen(p => !p)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2 text-white backdrop-blur-xl backdrop-filter transition-all duration-200 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50">
                  <div className="flex items-center gap-2 truncate">
                    {selectedType ? (<X size={20} className="cursor-pointer text-gray-400 transition-all duration-200 hover:scale-110 hover:text-gray-100" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTypeFilter("all"); }} />) : (<Filter size={20} className="text-gray-400" />)}
                    <span className="truncate capitalize">{selectedType || "all types"}</span>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isTypeOptionsOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isTypeOptionsOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute z-10 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/80 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <ul className="p-1 max-h-36 overflow-y-auto">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); handleTypeFilter("all"); setIsTypeOptionsOpen(false); }} className="block rounded-lg px-4 py-2 text-white transition-colors hover:bg-green-500/10">All Types</a></li>
                        {types.map((type) => (<li key={type}><a href="#" onClick={(e) => { e.preventDefault(); handleTypeFilter(type); setIsTypeOptionsOpen(false); }} className="block truncate rounded-lg px-4 py-2 capitalize text-white transition-colors hover:bg-green-500/10">{type}</a></li>))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {displayPapers.length > 0 && selectedCategory === "notes" && Object.keys(NotesResourceTypes).length > 0 && (
              <div className="relative">
                <button onClick={() => setIsTypeOptionsOpen(p => !p)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2 text-white backdrop-blur-xl backdrop-filter transition-all duration-200 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50">
                  <div className="flex min-w-0 items-center gap-2">
                    {selectedType ? (<X size={20} className="cursor-pointer text-gray-400 transition-all duration-200 hover:scale-110 hover:text-gray-100" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTypeFilter("all"); }} />) : (<Filter size={20} className="text-gray-400" />)}
                    <span className="truncate capitalize sm:whitespace-normal">{Object.values(NotesResourceTypes).find((t) => t.value === selectedType)?.label || "all types"}</span>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isTypeOptionsOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isTypeOptionsOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute !z-50 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/80 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <ul className="p-1 max-h-36 overflow-y-auto">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); handleTypeFilter("all"); setIsTypeOptionsOpen(false); }} className="block rounded-lg px-4 py-2 text-white transition-colors hover:bg-green-500/10">All Types</a></li>
                        {Object.values(NotesResourceTypes).map((type) => (<li key={type.value}><a href="#" onClick={(e) => { e.preventDefault(); handleTypeFilter(type.value); setIsTypeOptionsOpen(false); }} className="block truncate rounded-lg px-4 py-2 capitalize text-white transition-colors hover:bg-green-500/10 sm:whitespace-normal">{type.label}</a></li>))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {displayPapers.length > 0 ? (
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papersToShow.map((paper, paperIndex) => (
              <FileItem key={`${paper._id || paperIndex}`} file={paper} onClick={onFileClick} />
            ))}
          </div>
        ) : (
          <div className="col-span-full py-4 text-center text-sm text-gray-400 sm:text-base">
            No {categoryDescriptions[selectedCategory]?.toLowerCase().replace(" previous year examination papers", "s")} available for this subject {selectedYear ? `in ${selectedYear}` : ""}.
          </div>
        )}
        {displayPapers.length > INITIAL_ITEMS_TO_SHOW && (
          <div className="mt-4 flex justify-center">
            <button onClick={() => setShowAll(p => !p)} className="flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300">
              {showAll ? "Show Less" : "Show All"}
              <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs">{displayPapers.length}</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

const DocumentsPage = () => {
  const { course, semesterId } = useParams();
  const navigate = useNavigate();
  const { setIsSidebarOpen } = useContext(ValuesContext);
  const commonFilesSectionRef = useRef(null);

  const [semesterData, setSemesterData] = useState(null);
  const [wholeSemesterFiles, setWholeSemesterFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("paper");
  const [showScrollButton, setShowScrollButton] = useState(true);
  const [selectedCommonYear, setSelectedCommonYear] = useState(null);
  const [isCommonYearOptionsOpen, setIsCommonYearOptionsOpen] = useState(false);

  const semester = useMemo(() => parseInt(semesterId, 10), [semesterId]);
  const selectedCourseInfo = useMemo(() => courses.find((c) => c.value === course?.toUpperCase()), [course]);
  const courseLabel = selectedCourseInfo ? selectedCourseInfo.label : "Unknown Course";

  const categories = [{ value: "paper", label: "Question Papers" }, { value: "notes", label: "Notes" }, { value: "syllabus", label: "Syllabus" }];
  const categoryDescriptions = { paper: "Previous year examination papers", notes: "Lecture notes and study materials", syllabus: "Course syllabus and outlines" };

  useEffect(() => {
    const fetchAndProcessFiles = async () => {
      if (!selectedCourseInfo || isNaN(semester)) {
        setError("Invalid course or semester specified.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/files/fetchCourseAndSemester`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ course: selectedCourseInfo.value, semester }) });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message || "Failed to fetch files");
        if (!Array.isArray(result.data)) throw new Error("Invalid data format from server");

        const courseKey = selectedCourseInfo.value.toUpperCase();
        const semesterKey = semester.toString();
        const baseSemesterStructure = ALL_SEMESTER_DATA[courseKey]?.[semesterKey];
        if (!baseSemesterStructure) throw new Error("No subject data found for this course and semester.");

        const filesBySubject = result.data.reduce((acc, file) => {
          const subject = file.subject;
          if (!acc[subject]) acc[subject] = [];
          acc[subject].push(file);
          return acc;
        }, {});

        setWholeSemesterFiles(filesBySubject["Whole Semester"] || []);

        const updatedSemester = {
          ...baseSemesterStructure,
          subjects: baseSemesterStructure.subjects.filter(s => s.name !== "Whole Semester").map((subject) => ({ ...subject, papers: filesBySubject[subject.name] || [] })),
        };
        setSemesterData(updatedSemester);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessFiles();
  }, [course, semesterId, selectedCourseInfo]);

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY < 200);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => { if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) e.preventDefault(); };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleFileClick = useCallback((file) => setSelectedFile(file), []);
  const handleCloseViewer = () => setSelectedFile(null);
  const onBack = () => navigate(`/scsit/${course}/semesters/`);

  const commonUniqueYears = useMemo(() => getUniqueYears(wholeSemesterFiles), [wholeSemesterFiles]);
  const filteredCommonFiles = useMemo(() => selectedCommonYear ? wholeSemesterFiles.filter((file) => file.year == selectedCommonYear) : wholeSemesterFiles, [wholeSemesterFiles, selectedCommonYear]);

  const isExcludedRoute = typeof window !== "undefined" && (window.location.pathname.startsWith("/login") || window.location.pathname === "/signup");
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => { if (isMobile && !isExcludedRoute) setIsSidebarOpen(true); },
    onSwipedRight: onBack,
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    delta: 50,
  });

  const handleScrollToCommonFiles = () => {
    const offset = 220;

    if (commonFilesSectionRef.current) {
      const elementPosition = commonFilesSectionRef.current.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
        <img src={loadingGif} alt="Loading..." className="h-32 w-32 sm:h-48 sm:w-48 md:h-60 md:w-60" />
      </div>
    );
  }

  if (error || !semesterData) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black p-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-500">An Error Occurred</h1>
          <p className="mb-6 text-gray-300">{error || "No data available for this semester."}</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="mx-auto flex items-center space-x-2 text-green-400 transition-colors hover:text-green-300">
            <ArrowLeft className="h-5 w-5" /><span>Go Back</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div {...swipeHandlers} className="flex min-h-screen w-full flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-black p-0">
      <Helmet>
        <title>{`${course?.toUpperCase()} - ${semesterData.title} | SCSIT`}</title>
        <meta name="description" content={`Documents for ${courseLabel} ${semesterData.title}.`} />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="sticky top-0 z-20 rounded-b-2xl border-b border-gray-700 bg-gray-800 bg-opacity-50 px-4 pt-16 backdrop-blur-xl backdrop-filter sm:px-6 sm:pt-20 md:px-8">
        <div className="flex flex-col items-center justify-between pt-2 sm:flex-row">
          <h1 className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">{courseLabel}</h1>
          <h2 className="mt-2 text-xl font-semibold text-white sm:mt-0 sm:text-2xl md:text-3xl">{semesterData.title}</h2>
        </div>
        <div className="mt-4 flex items-center justify-between pb-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="flex items-center space-x-2 text-green-400 transition-colors hover:text-green-300">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" /><span>Back</span>
          </motion.button>
          <div className="flex flex-wrap justify-end gap-2 sm:gap-4">
            {categories.map((cat) => (
              <button key={cat.value} className={`rounded-lg px-3 py-1 text-sm font-semibold transition-all duration-200 sm:px-4 sm:py-2 ${selectedCategory === cat.value ? "bg-green-500 text-white shadow-lg" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`} onClick={() => setSelectedCategory(cat.value)}>{cat.label}</button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="my-8 w-full flex-1 space-y-6 px-4 sm:space-y-8 sm:px-6 md:px-8">
        {semesterData.subjects.length > 0 ? (
          semesterData.subjects.map((subject, subjectIndex) => (
            <SubjectCard
              key={subject.name}
              subject={subject}
              selectedCategory={selectedCategory}
              categoryDescriptions={categoryDescriptions}
              onFileClick={handleFileClick}
              initialDelay={subjectIndex}
            />
          ))
        ) : (
          <div className="py-10 text-center text-sm text-gray-300 sm:text-base">No subject-specific files found for this semester.</div>
        )}
      </div>

      {wholeSemesterFiles.length > 0 && (
        <div
          ref={commonFilesSectionRef}
          className="mb-8 mt-4 w-full px-4 sm:px-6 md:px-8 scroll-mt-16 sm:scroll-mt-20"
        >
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-8 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
            Common Files for Semester
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-xl backdrop-filter">
            <div className="border-b border-gray-700 p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="mb-1 text-2xl font-bold text-white">Files for the Whole Semester</h2>
                  <p className="text-gray-300">Shared resources applicable to all subjects in this semester.</p>
                </div>
                {commonUniqueYears.length > 0 && (
                  <div className="relative">
                    <div className="relative w-full sm:w-48">
                      <button onClick={() => setIsCommonYearOptionsOpen((p) => !p)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2 text-white backdrop-blur-xl backdrop-filter transition-all duration-200 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50">
                        <div className="flex items-center gap-2 truncate">
                          {selectedCommonYear ? (<X size={20} className="cursor-pointer text-gray-400" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedCommonYear(null); }} />) : (<Filter size={20} className="text-gray-400" />)}
                          <span className="truncate capitalize">{selectedCommonYear || "all years"}</span>
                        </div>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isCommonYearOptionsOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {isCommonYearOptionsOpen && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute z-10 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/80 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <ul className="p-1 max-h-36 overflow-y-auto">
                              <li><a href="#" onClick={(e) => { e.preventDefault(); setSelectedCommonYear(null); setIsCommonYearOptionsOpen(false); }} className="block rounded-lg px-4 py-2 text-white transition-colors hover:bg-green-500/10">All Years</a></li>
                              {commonUniqueYears.map((year) => (<li key={year}><a href="#" onClick={(e) => { e.preventDefault(); setSelectedCommonYear(year); setIsCommonYearOptionsOpen(false); }} className="block truncate rounded-lg px-4 py-2 capitalize text-white transition-colors hover:bg-green-500/10">{year}</a></li>))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCommonFiles.map((file, index) => (<FileItem key={file._id || index} file={file} onClick={handleFileClick} />))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showScrollButton && wholeSemesterFiles.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => handleScrollToCommonFiles()}
            className="flex gap-1 fixed bottom-8 right-8 z-50 rounded-full bg-green-500 p-3 text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Scroll to common files"
          >
             <span className="hidden sm:block">Go to Common Files</span>
            <ChevronsDown className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {selectedFile && (<FileViewer file={selectedFile} onClose={handleCloseViewer} />)}
    </div>
  );
};

export default DocumentsPage;