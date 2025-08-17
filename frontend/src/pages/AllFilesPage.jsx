"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const AllFilesPage = () => {
    const [allFiles, setAllFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

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
        if (!allFiles.length)
            return { years: [], categories: [], types: [], resourceTypes: [] };
        const uniqueYears = [...new Set(allFiles.map((f) => f.year))].sort(
            (a, b) => b - a,
        );
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
            ],
            resourceTypes: Object.values(ResourceTypes),
        };
    }, [allFiles]);

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
    }, []);

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
    };

    const handleCloseViewer = () => {
        setSelectedFile(null);
    };

    const handleFileClick = (file, subject) => {
        setSelectedFile(file);
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
                                        <p className="text-2xl font-bold text-white">
                                            {stats.totalFiles}
                                        </p>
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
                                        <p className="text-2xl font-bold text-white">
                                            {stats.totalCourses}
                                        </p>
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
                                        <p className="text-2xl font-bold text-white">
                                            {stats.totalSubjects}
                                        </p>
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
                                        <p className="text-2xl font-bold text-white">
                                            {stats.totalViews}
                                        </p>
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
                        </div>
                        {filteredFiles.length > 0 ? (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {filteredFiles.map((file) => (
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
                                            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
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
                                                {file.resourceType && (
                                                    <p className="flex items-center gap-2.5">
                                                        <Clock
                                                            size={15}
                                                            className="text-green-400 flex-shrink-0"
                                                        />
                                                        Resource:{" "}
                                                        <span className="font-semibold capitalize">
                                                            {ResourceTypes[file.resourceType]?.label ||
                                                                file.resourceType}
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
        </div>
    );
};

export default AllFilesPage;