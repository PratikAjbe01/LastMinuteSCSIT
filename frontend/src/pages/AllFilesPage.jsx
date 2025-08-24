"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Select from "react-select";
import {
    Loader,
    AlertCircle,
    Calendar,
    Book,
    Tag,
    GraduationCap,
    X,
    Search,
    File as FileIcon,
    Filter,
    BookDashed,
    FileText,
    FolderOpen,
    Eye,
    TrendingUp,
    TrendingDown,
    Clock,
    Share2Icon,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown,
    FileChartColumn,
    MoreHorizontal,
} from "lucide-react";
import FileViewer from "../fileComponents/FileViewer";
import { API_URL } from "../utils/urls";
import { useSwipeable } from "react-swipeable";
import { ValuesContext } from "../context/ValuesContext";
import { useNavigate } from "react-router-dom";
import {
    courses,
    semestersByCourse,
    subjectsByCourseAndSemester,
    ResourceTypes,
    NotesResourceTypes,
} from "../utils/Data";

const getOrdinalSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "views_desc", label: "Most Viewed" },
    { value: "views_asc", label: "Least Viewed" },
    { value: "shares_desc", label: "Most Shared" },
    { value: "shares_asc", label: "Least Shared" },
    { value: "name_asc", label: "Name (A-Z)" },
    { value: "name_desc", label: "Name (Z-A)" },
];

const ITEMS_PER_PAGE = 18;

const AnimatedStat = ({ value }) => {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString(),
    );

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return (
        <motion.p className="text-2xl font-bold text-white">{display}</motion.p>
    );
};

const customSelectStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: "rgba(55, 65, 81, 0.7)",
        borderColor: "#4b5563",
        borderRadius: "0.5rem",
        color: "#ffffff",
        boxShadow: "none",
        "&:hover": { borderColor: "#10b981" },
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "rgba(31, 41, 55, 0.95)",
        borderRadius: "0.5rem",
        border: "1px solid #4b5563",
    }),
    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "#10b981" : "transparent",
        color: state.isSelected ? "#ffffff" : "#d1d5db",
        "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#ffffff" },
    }),
    singleValue: (provided) => ({ ...provided, color: "#ffffff" }),
    placeholder: (provided) => ({ ...provided, color: "#9ca3af" }),
    input: (provided) => ({ ...provided, color: "#ffffff" }),
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            if (totalPages > 1) {
                rangeWithDots.push(totalPages);
            }
        }

        return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    const ITEMS_PER_PAGE = 18;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-8 mx-2 sm:mt-12 sm:mb-8 sm:mx-0"
            id="pagination-section"
        >
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 text-xs sm:text-sm text-gray-400 text-center">
                        <span className="whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                        <span className="hidden sm:inline w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span className="whitespace-nowrap">{((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE)} items</span>
                    </div>

                    <div className="block sm:hidden w-full">
                        <div className="flex items-center justify-between">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-gray-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                title="First Page"
                            >
                                <ChevronsLeft size={16} className="hover:text-green-400 transition-colors" />
                                First
                            </motion.button>

                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500">Current Page</span>
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-lg min-w-[60px] text-center shadow-lg">
                                    {currentPage}
                                </div>
                                <span className="text-xs text-gray-500">of {totalPages}</span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-gray-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                title="Last Page"
                            >
                                Last
                                <ChevronsRight size={16} className="hover:text-green-400 transition-colors" />
                            </motion.button>
                        </div>

                        <div className="flex items-center justify-center gap-3 mt-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(Math.max(1, currentPage - 5))}
                                disabled={currentPage <= 5}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700/60 border border-gray-600 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-gray-600/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <ChevronsLeft size={14} />
                                -5
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:text-blue-200 hover:border-blue-400/50 hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                <ChevronLeft size={14} />
                                Prev
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:text-blue-200 hover:border-blue-400/50 hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                Next
                                <ChevronRight size={14} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 5))}
                                disabled={currentPage >= totalPages - 4}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700/60 border border-gray-600 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-gray-600/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                +5
                                <ChevronsRight size={14} />
                            </motion.button>
                        </div>

                        {totalPages > 20 && (
                            <div className="mt-4 text-center">
                                <div className="text-xs text-gray-500 mb-2">Jump to page:</div>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    placeholder="Page number"
                                    className="w-32 px-3 py-2 bg-gray-700/80 border border-gray-600 rounded-lg text-white text-center text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500/20 focus:outline-none placeholder-gray-400"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            const page = parseInt(e.target.value);
                                            if (page >= 1 && page <= totalPages) {
                                                onPageChange(page);
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className="group p-3 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-gray-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-700 disabled:hover:text-gray-300 disabled:hover:bg-gray-800/60"
                            title="First Page"
                        >
                            <ChevronsLeft size={16} className="group-hover:text-green-400 transition-colors" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="group p-3 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-gray-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-700 disabled:hover:text-gray-300 disabled:hover:bg-gray-800/60"
                            title="Previous Page"
                        >
                            <ChevronLeft size={16} className="group-hover:text-green-400 transition-colors" />
                        </motion.button>

                        <div className="flex items-center gap-1 px-2">
                            {getVisiblePages().map((page, index) => (
                                page === '...' ? (
                                    <span key={`dots-${index}`} className="px-3 py-2 text-gray-400 text-sm">
                                        ...
                                    </span>
                                ) : (
                                    <motion.button
                                        key={page}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onPageChange(page)}
                                        className={`min-w-[44px] h-11 px-3 rounded-xl font-medium transition-all duration-300 ${currentPage === page
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent shadow-lg shadow-green-500/25 ring-2 ring-green-500/20'
                                                : 'bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-gray-700/60 hover:shadow-md'
                                            }`}
                                    >
                                        {page}
                                    </motion.button>
                                )
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="group p-3 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-gray-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-700 disabled:hover:text-gray-300 disabled:hover:bg-gray-800/60"
                            title="Next Page"
                        >
                            <ChevronRight size={16} className="group-hover:text-green-400 transition-colors" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="group p-3 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-gray-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-700 disabled:hover:text-gray-300 disabled:hover:bg-gray-800/60"
                            title="Last Page"
                        >
                            <ChevronsRight size={16} className="group-hover:text-green-400 transition-colors" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AllFilesPage = () => {
    const [allFiles, setAllFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showScrollButton, setShowScrollButton] = useState(false);

    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        course: null,
        semester: null,
        subject: null,
        year: null,
        category: null,
        type: null,
        resourceType: null,
        sortBy: null,
    });

    const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
    const paginatedFiles = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredFiles, currentPage]);

    const semesterOptions = useMemo(() => {
        if (!filters.course) return [];
        const semesters = semestersByCourse[filters.course.value] || [];
        return semesters.map((sem) => ({
            value: sem,
            label:
                sem === "0"
                    ? "Whole Course"
                    : `${sem}${getOrdinalSuffix(parseInt(sem))} Semester`,
        }));
    }, [filters.course]);

    const subjectOptions = useMemo(() => {
        if (!filters.course || !filters.semester) return [];
        const subjects =
            subjectsByCourseAndSemester[filters.course.value]?.[
            filters.semester.value
            ] || [];
        return subjects.map((subject) => ({
            value: subject,
            label: subject,
        }));
    }, [filters.course, filters.semester]);

    const dropdownOptions = useMemo(() => {
        if (!allFiles.length) {
            return { years: [], categories: [], types: [], resourceTypes: [] };
        }

        const uniqueYears = [...new Set(allFiles.map((f) => f.year))].sort(
            (a, b) => b - a,
        );

        const selectedResourceTypeObject =
            filters.category?.value === "notes"
                ? NotesResourceTypes
                : ResourceTypes;

        const resourceTypeOptions = selectedResourceTypeObject
            ? Object.values(selectedResourceTypeObject)
            : [];

        return {
            years: uniqueYears.map((y) => ({ value: y, label: y })),
            categories: [
                { value: "paper", label: "Paper" },
                { value: "notes", label: "Notes" },
                { value: "syllabus", label: "Syllabus" },
            ],
            types: [
                { value: "image", label: "Image" },
                { value: "document", label: "Document" },
                { value: "text", label: "Text" },
            ],
            resourceTypes: resourceTypeOptions,
        };
    }, [allFiles, filters.category]);

    useEffect(() => {
        const fetchAllFiles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/files/allfiles`);
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to fetch files.");
                }
                setAllFiles(result.data);
                setFilteredFiles(result.data);
            } catch (err) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllFiles();
    }, []);

    const handleFilterChange = (name, selectedOption) => {
        setFilters((prevFilters) => {
            const newFilters = { ...prevFilters, [name]: selectedOption };

            if (name === "course") {
                newFilters.semester = null;
                newFilters.subject = null;
            } else if (name === "semester") {
                newFilters.subject = null;
            }

            return newFilters;
        });
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        const handleScroll = () => {
            const scrolled = window.scrollY;
            const threshold = 300;
            setShowScrollButton(scrolled > threshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToPagination = () => {
        const paginationElement = document.getElementById('pagination-section');
        if (paginationElement) {
            paginationElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredFiles]);

    const handleApplyFilters = useMemo(() => {
        return async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/api/files/allfiles`);
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to fetch files.");
                }

                let filesToFilter = result.data;

                if (searchTerm.trim() !== "") {
                    filesToFilter = filesToFilter.filter((file) =>
                        file.name.toLowerCase().includes(searchTerm.toLowerCase()),
                    );
                }

                if (filters.course)
                    filesToFilter = filesToFilter.filter(
                        (f) => f.course === filters.course.value,
                    );
                if (filters.semester)
                    filesToFilter = filesToFilter.filter(
                        (f) => f.semester === filters.semester.value,
                    );
                if (filters.subject)
                    filesToFilter = filesToFilter.filter(
                        (f) => f.subject === filters.subject.value,
                    );
                if (filters.year)
                    filesToFilter = filesToFilter.filter(
                        (f) => f.year === filters.year.value,
                    );
                if (filters.category)
                    filesToFilter = filesToFilter.filter(
                        (f) => f.category === filters.category.value,
                    );
                if (filters.type)
                    filesToFilter = filesToFilter.filter(
                        (f) => f.type === filters.type.value,
                    );
                if (filters.resourceType)
                    filesToFilter = filesToFilter.filter(
                        (f) => f.resourceType === filters.resourceType.value,
                    );

                if (filters.sortBy) {
                    switch (filters.sortBy.value) {
                        case "newest":
                            filesToFilter.sort(
                                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                            );
                            break;
                        case "oldest":
                            filesToFilter.sort(
                                (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                            );
                            break;
                        case "views_desc":
                            filesToFilter.sort((a, b) => (b.views || 0) - (a.views || 0));
                            break;
                        case "views_asc":
                            filesToFilter.sort((a, b) => (a.views || 0) - (b.views || 0));
                            break;
                        case "shares_desc":
                            filesToFilter.sort((a, b) => (b.shares || 0) - (a.shares || 0));
                            break;
                        case "shares_asc":
                            filesToFilter.sort((a, b) => (a.shares || 0) - (b.shares || 0));
                            break;
                        case "name_asc":
                            filesToFilter.sort((a, b) => {
                                const nameComparison = a.name.localeCompare(b.name);
                                if (nameComparison !== 0) return nameComparison;
                                return new Date(b.createdAt) - new Date(a.createdAt);
                            });
                            break;
                        case "name_desc":
                            filesToFilter.sort((a, b) => {
                                const nameComparison = b.name.localeCompare(a.name);
                                if (nameComparison !== 0) return nameComparison;
                                return new Date(b.createdAt) - new Date(a.createdAt);
                            });
                            break;
                        default:
                            break;
                    }
                }

                setFilteredFiles(filesToFilter);
            } catch (err) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
    }, [filters, searchTerm]);

    const resetFilters = () => {
        setFilters({
            course: null,
            semester: null,
            subject: null,
            year: null,
            category: null,
            type: null,
            resourceType: null,
            sortBy: null,
        });
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handleCloseViewer = () => {
        setSelectedFile(null);
    };

    const handleFileClick = (file, subject) => {
        setSelectedFile(file);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);

    const isExcludedRoute =
        typeof window !== "undefined" &&
        (window.location.pathname.startsWith("/login") ||
            window.location.pathname === "/signup");
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
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

    const stats = useMemo(() => {
        if (!allFiles.length)
            return {
                totalFiles: 0,
                totalCourses: 0,
                totalSubjects: 0,
                totalViews: 0,
            };

        const uniqueCourses = new Set(allFiles.map((f) => f.course));
        const uniqueSubjects = new Set(allFiles.map((f) => f.subject));
        const totalViews = allFiles.reduce((sum, file) => sum + (file.views || 0), 0);

        return {
            totalFiles: allFiles.length,
            totalCourses: uniqueCourses.size,
            totalSubjects: uniqueSubjects.size,
            totalViews: totalViews,
        };
    }, [allFiles, filteredFiles]);

    const courseStats = useMemo(() => {
        if (!allFiles.length) return [];
        const courseCount = {};
        allFiles.forEach((file) => {
            courseCount[file.course] = (courseCount[file.course] || 0) + 1;
        });
        return Object.entries(courseCount)
            .map(([course, count]) => ({ course, count }))
            .sort((a, b) => b.count - a.count);
    }, [allFiles]);

    const subjectStats = useMemo(() => {
        if (!allFiles.length) return [];
        const subjectCount = {};
        allFiles.forEach((file) => {
            subjectCount[file.subject] = (subjectCount[file.subject] || 0) + 1;
        });
        return Object.entries(subjectCount)
            .map(([subject, count]) => ({ subject, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [allFiles]);

    const handleStatClick = (type, value) => {
        if (type === "course") {
            const courseOption = courses.find((c) => c.value === value);
            if (courseOption) {
                setFilters((prev) => ({ ...prev, course: courseOption }));
            }
        }
    };

    return (
        <>
            <div className="fixed top-1/2 -translate-y-1/2 right-2 md:right-4 z-10 pointer-events-none hidden sm:block">
                <div className="flex flex-col items-center rounded-full border border-blue-400/30 bg-black/30 backdrop-blur-lg px-1.5 py-4 md:px-2 md:py-5">
                    <FileChartColumn className="h-5 w-5 text-blue-400 md:h-6 md:w-6 mb-2" />
                    {"FILES".split("").map((char, index) => (
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
                className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 p-0 pb-8 pt-24"
            >
                <Helmet>
                    <title>All Files - SCSIT</title>
                    <meta
                        name="description"
                        content="Browse and filter all available files and study materials."
                    />
                </Helmet>

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-10"
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                            Browse All Files
                        </h1>
                        <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
                            Find the study materials you need. Use the filters below to narrow
                            down your search.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 mb-10 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 p-4 rounded-xl border border-blue-700/30">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500/20 p-2 rounded-lg">
                                            <FileText className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Total Files</p>
                                            <AnimatedStat value={stats.totalFiles} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 p-4 rounded-xl border border-green-700/30">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-500/20 p-2 rounded-lg">
                                            <GraduationCap className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Courses</p>
                                            <AnimatedStat value={stats.totalCourses} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 p-4 rounded-xl border border-purple-700/30">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-500/20 p-2 rounded-lg">
                                            <Book className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Subjects</p>
                                            <AnimatedStat value={stats.totalSubjects} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-amber-600/20 to-amber-800/20 p-4 rounded-xl border border-amber-700/30">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-amber-500/20 p-2 rounded-lg">
                                            <Eye className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Total Views</p>
                                            <AnimatedStat value={stats.totalViews} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    Popular Courses
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {courseStats.slice(0, 8).map(({ course, count }) => (
                                        <button
                                            key={course}
                                            onClick={() => handleStatClick("course", course)}
                                            className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full text-sm transition-colors border border-gray-600"
                                        >
                                            {courses.find((c) => c.value === course)?.value || course}{" "}
                                            <span className="text-gray-400">({count})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by file name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-700/70 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Select
                                    menuPortalTarget={document.body}
                                    isClearable
                                    noOptionsMessage={() => "No options"}
                                    placeholder="Filter by Course..."
                                    options={courses}
                                    value={filters.course}
                                    onChange={(opt) => handleFilterChange("course", opt)}
                                    styles={customSelectStyles}
                                />
                                <Select
                                    menuPortalTarget={document.body}
                                    isClearable
                                    noOptionsMessage={() => "No options"}
                                    placeholder="Filter by Semester..."
                                    options={semesterOptions}
                                    value={filters.semester}
                                    onChange={(opt) => handleFilterChange("semester", opt)}
                                    styles={customSelectStyles}
                                    isDisabled={!filters.course}
                                />
                                <Select
                                    menuPortalTarget={document.body}
                                    isClearable
                                    noOptionsMessage={() => "No subjects found"}
                                    placeholder="Filter by Subject..."
                                    options={subjectOptions}
                                    value={filters.subject}
                                    onChange={(opt) => handleFilterChange("subject", opt)}
                                    styles={customSelectStyles}
                                    isDisabled={!filters.course || !filters.semester}
                                />
                                <Select
                                    menuPortalTarget={document.body}
                                    isClearable
                                    noOptionsMessage={() => "No years found"}
                                    placeholder="Filter by Year..."
                                    options={dropdownOptions.years}
                                    value={filters.year}
                                    onChange={(opt) => handleFilterChange("year", opt)}
                                    styles={customSelectStyles}
                                />
                                <Select
                                    menuPortalTarget={document.body}
                                    isClearable
                                    noOptionsMessage={() => "No options"}
                                    placeholder="Filter by Category..."
                                    options={dropdownOptions.categories}
                                    value={filters.category}
                                    onChange={(opt) => handleFilterChange("category", opt)}
                                    styles={customSelectStyles}
                                />
                                <Select
                                    menuPortalTarget={document.body}
                                    isClearable
                                    noOptionsMessage={() => "No options"}
                                    placeholder="Filter by Type..."
                                    options={dropdownOptions.types}
                                    value={filters.type}
                                    onChange={(opt) => handleFilterChange("type", opt)}
                                    styles={customSelectStyles}
                                />
                                <Select
                                    menuPortalTarget={document.body}
                                    isClearable
                                    noOptionsMessage={() => "No options"}
                                    placeholder="Resource Type..."
                                    options={dropdownOptions.resourceTypes}
                                    value={filters.resourceType}
                                    onChange={(opt) => handleFilterChange("resourceType", opt)}
                                    styles={customSelectStyles}
                                />
                                <Select
                                    menuPortalTarget={document.body}
                                    isClearable
                                    noOptionsMessage={() => "No options"}
                                    placeholder="Sort By..."
                                    options={sortOptions}
                                    value={filters.sortBy}
                                    onChange={(opt) => handleFilterChange("sortBy", opt)}
                                    styles={customSelectStyles}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleApplyFilters}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all py-3 px-4 shadow-lg hover:shadow-xl"
                                >
                                    <Filter size={18} /> Apply Filters
                                </button>
                                <button
                                    onClick={resetFilters}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-lg transition-all py-3 px-4 shadow-lg hover:shadow-xl"
                                >
                                    <X size={18} /> Reset Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-12 h-12 text-green-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg flex items-center justify-center gap-2">
                            <AlertCircle /> {error}
                        </div>
                    ) : (
                        <AnimatePresence>
                            <div className="text-gray-400 block mb-4 text-center">
                                {filteredFiles.length} Files Found
                                {filteredFiles.length > 0 && (
                                    <span className="ml-2 text-sm">
                                        (Page {currentPage} of {totalPages})
                                    </span>
                                )}
                            </div>
                            {filteredFiles.length > 0 ? (
                                <>
                                    <motion.div
                                        layout
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                    >
                                        {paginatedFiles.map((file) => (
                                            <motion.div
                                                layout
                                                key={file._id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden flex flex-col group hover:border-green-500/50 transition-all duration-300"
                                            >
                                                <div className="p-6 flex-grow">
                                                    <h3 className="text-xl font-bold text-white mb-3">
                                                        {file.name}
                                                    </h3>
                                                    <div className="space-y-2.5 text-gray-300 text-sm">
                                                        <p className="flex items-center gap-2.5">
                                                            <BookDashed
                                                                size={15}
                                                                className="text-green-400 flex-shrink-0"
                                                            />{" "}
                                                            <span className="truncate">{file.course}</span>
                                                        </p>
                                                        <p className="flex items-center gap-2.5">
                                                            <Book
                                                                size={15}
                                                                className="text-green-400 flex-shrink-0"
                                                            />{" "}
                                                            <span className="truncate">{file.subject}</span>
                                                        </p>
                                                        <p className="flex items-center gap-2.5">
                                                            <GraduationCap
                                                                size={15}
                                                                className="text-green-400 flex-shrink-0"
                                                            />{" "}
                                                            {file.course} - Sem {file.semester}
                                                        </p>
                                                        <p className="flex items-center gap-2.5">
                                                            <Calendar
                                                                size={15}
                                                                className="text-green-400 flex-shrink-0"
                                                            />{" "}
                                                            Year: {file.year}
                                                        </p>
                                                        <p className="flex items-center gap-2.5">
                                                            <Tag
                                                                size={15}
                                                                className="text-green-400 flex-shrink-0"
                                                            />{" "}
                                                            Category:{" "}
                                                            <span className="font-semibold capitalize">
                                                                {file.category}
                                                            </span>
                                                        </p>
                                                        {file?.category !== "syllabus" && (
                                                            <p className="flex items-center gap-2.5">
                                                                <Clock
                                                                    size={15}
                                                                    className="text-green-400 flex-shrink-0"
                                                                />
                                                                Resource:{" "}
                                                                <span className="font-semibold capitalize">
                                                                    {ResourceTypes[file.resourceType]?.label
                                                                        || NotesResourceTypes[file.resourceType]?.label
                                                                        || file.resourceType || "Unknown"}
                                                                </span>
                                                            </p>
                                                        )}
                                                        <p className="flex items-center gap-2.5">
                                                            {file.views > 50 ? (
                                                                <TrendingUp
                                                                    size={15}
                                                                    className="text-green-400 flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <TrendingDown
                                                                    size={15}
                                                                    className="text-amber-400 flex-shrink-0"
                                                                />
                                                            )}
                                                            <Eye
                                                                size={15}
                                                                className="text-blue-400 flex-shrink-0"
                                                            />
                                                            {file.views || 0} views
                                                        </p>
                                                        <p className="flex items-center gap-2.5">
                                                            {file.views > 20 ? (
                                                                <TrendingUp
                                                                    size={15}
                                                                    className="text-green-400 flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <TrendingDown
                                                                    size={15}
                                                                    className="text-amber-400 flex-shrink-0"
                                                                />
                                                            )}
                                                            <Share2Icon
                                                                size={15}
                                                                className="text-blue-400 flex-shrink-0"
                                                            />
                                                            {file.shares || 0} shares
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="bg-gray-900/50 p-4 mt-auto"
                                                    onClick={() => handleFileClick(file, file.subject)}
                                                >
                                                    <span className="flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all cursor-pointer shadow-md hover:shadow-lg">
                                                        <FileIcon
                                                            size={16}
                                                            className="transition-transform group-hover:translate-x-1 cursor-pointer"
                                                        />{" "}
                                                        View File
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700"
                                >
                                    <div className="mx-auto bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center border border-gray-700">
                                        <FolderOpen className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="mt-6 text-2xl font-bold text-white">
                                        No Files Found
                                    </h3>
                                    <p className="mt-2 text-gray-400 max-w-md mx-auto">
                                        {allFiles.length > 0
                                            ? "No files match your current filter criteria."
                                            : "No files have been uploaded to the site yet."}
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all"
                                    >
                                        Reset Filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
                {selectedFile && (
                    <FileViewer
                        file={selectedFile}
                        onClose={handleCloseViewer}
                        isAllFiles={true}
                    />
                )}

                <AnimatePresence>
                    {showScrollButton && filteredFiles.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={scrollToPagination}
                            className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-2xl border-2 border-green-500/20 backdrop-blur-sm z-40 group"
                            title="Go to pagination"
                        >
                            <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 opacity-20 animate-pulse"></div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default AllFilesPage;