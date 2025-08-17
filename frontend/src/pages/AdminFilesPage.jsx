"use client";

import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import {
    User,
    FileText,
    Calendar,
    Book,
    Tag,
    Edit,
    Trash2,
    X,
    Loader,
    AlertCircle,
    ShieldCheck,
    GraduationCap,
    FileX,
    View,
    Filter,
    Check,
    ChevronDown,
    BookDashed,
    Crown,
} from "lucide-react";
import FileViewer from "../fileComponents/FileViewer";
import { API_URL } from "../utils/urls";
import { useSwipeable } from "react-swipeable";
import { ValuesContext } from "../context/ValuesContext";
import { toast } from "react-hot-toast";
import Select from "react-select";
import {
    courses as courseOptions,
    ResourceTypes,
    semestersByCourse,
    subjectsByCourseAndSemester,
} from "../utils/Data";

const useOnClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) return;
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
};

const ToggleSwitch = ({ enabled, setEnabled, label }) => (
    <div className="flex items-center gap-3 self-center text-center">
        <span className="text-sm text-white font-medium whitespace-nowrap text-center">
            {label}
        </span>
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${enabled ? "bg-green-500" : "bg-gray-600"}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`}
            />
        </button>
    </div>
);

const FilterDropdown = ({ options, value, onChange, allLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef();
    useOnClickOutside(ref, () => setIsOpen(false));
    const selectedOption = options.find((opt) => opt.value === value);
    const displayLabel =
        value === "all" ? allLabel : selectedOption?.label || allLabel;

    return (
        <div ref={ref} className="relative w-full sm:w-auto">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between gap-2 bg-gray-700/50 rounded-xl border border-gray-600 px-4 py-2 text-white hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
            >
                <div className="flex items-center gap-2 truncate">
                    <Filter size={16} />
                    <span className="capitalize truncate text-sm">{displayLabel}</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-30 mt-2 w-56 origin-top-left rounded-xl border border-gray-700 bg-gray-900/90 shadow-lg backdrop-blur-lg"
                    >
                        <ul className="p-1 max-h-60 overflow-y-auto">
                            <li>
                                <button
                                    onClick={() => {
                                        onChange("all");
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left block rounded-lg px-4 py-2 text-white hover:bg-green-500/10"
                                >
                                    {allLabel}
                                </button>
                            </li>
                            {options.map((opt) => (
                                <li key={opt.value}>
                                    <button
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left block rounded-lg px-4 py-2 text-white capitalize hover:bg-green-500/10 truncate"
                                    >
                                        {opt.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AdminFilesPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploaderFilter, setUploaderFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedViewFile, setSelectedViewFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState("");
    const [fileName, setFileName] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTypes, setSelectedTypes] = useState(null);
    const [selectedResourceType, setSelectedResourceType] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedYear, setSelectedYear] = useState("");
    const [includeCreators, setIncludeCreators] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState("all");

    const creatorEmails = useMemo(
        () => new Set(["bdhakad886@gmail.com", "pratikajbe40@gmail.com"]),
        [],
    );

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (!user || user.isAdmin !== "admin") {
            toast.error("You must be an Admin to access this page.");
            navigate("/");
            return;
        }
        const fetchFiles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/files/getadminsfiles`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to fetch files.");
                }
                setFiles(result.data);
            } catch (err) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiles();
    }, [user, navigate]);

    const openEditModal = (file) => {
        setSelectedFile(file);
        setFileName(file.name ?? "");
        setSelectedCourse(file.course ?? "");
        setSelectedSemester(file.semester ?? "");
        setSelectedSubject(
            file.subject ?? (file.semester === "0" ? "Whole Semester" : ""),
        );
        setSelectedTypes(file.type ?? null);
        setSelectedCategory(file.category ?? null);
        setSelectedYear(file.year ?? "");
        setSelectedResourceType(file.resourceType ?? "none");
        setModalError("");
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        if (isSubmitting) return;
        setIsEditModalOpen(false);
        setSelectedFile(null);
    };

    const openDeleteModal = (file) => {
        setSelectedFile(file);
        setModalError("");
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (isSubmitting) return;
        setIsDeleteModalOpen(false);
        setSelectedFile(null);
    };

    const checkAdminPro = () => {
        if (!creatorEmails.has(user?.email)) {
            toast.error("You must be an Creator to perform this action.");
            return false;
        }
        return true;
    };

    const handleUpdateFile = async (e) => {
        e.preventDefault();
        if (!checkAdminPro()) return;
        setIsSubmitting(true);
        setModalError("");
        if (
            !fileName ||
            !selectedCourse ||
            !selectedSemester ||
            !selectedSubject ||
            !selectedCategory ||
            !/^\d{4}$/.test(selectedYear) ||
            (selectedCategory !== "paper" && !selectedTypes)
        ) {
            setModalError(
                "Please fill in all required fields and enter a valid year.",
            );
            setIsSubmitting(false);
            return;
        }
        try {
            const payload = {
                id: selectedFile?._id,
                name: fileName.trim(),
                course: selectedCourse,
                semester: selectedSemester,
                subject: selectedSubject,
                type: selectedTypes,
                year: selectedYear,
                category: selectedCategory,
                resourceType: selectedResourceType,
            };
            const response = await fetch(`${API_URL}/api/files/updateAdminFile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });
            const result = await response.json();
            if (!response.ok || !result.success)
                throw new Error(result.message || "Failed to update file.");
            setFiles(
                files.map((f) => (f._id === selectedFile?._id ? result.data : f)),
            );
            closeEditModal();
            toast.success("File updated successfully!");
        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFile = async (e) => {
        e.preventDefault();
        if (!checkAdminPro()) return;
        setIsSubmitting(true);
        setModalError("");
        try {
            const response = await fetch(`${API_URL}/api/files/deleteadminsfile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedFile?._id }),
                credentials: "include",
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete file.");
            }
            setFiles(files.filter((f) => f._id !== selectedFile?._id));
            closeDeleteModal();
            toast.success("File deleted successfully!");
        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const { setIsSidebarOpen } = useContext(ValuesContext);
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => setIsSidebarOpen(true),
        preventDefaultTouchmoveEvent: true,
    });

    const baseData = useMemo(() => {
        if (includeCreators) {
            return files;
        }
        return files.filter((file) => !creatorEmails.has(file.uploadedBy?.email));
    }, [files, includeCreators, creatorEmails]);

    useEffect(() => {
        let tempFiles = [...baseData];
        if (uploaderFilter !== "all") {
            tempFiles = tempFiles.filter(
                (file) => file.uploadedBy?._id === uploaderFilter,
            );
        }
        if (categoryFilter !== "all") {
            tempFiles = tempFiles.filter((file) => file.category === categoryFilter);
        }
        if (courseFilter !== "all") {
            tempFiles = tempFiles.filter((file) => file.course === courseFilter);
        }
        if (subjectFilter !== "all") {
            tempFiles = tempFiles.filter((file) => file.subject === subjectFilter);
        }
        setFilteredFiles(tempFiles);
    }, [uploaderFilter, categoryFilter, courseFilter, subjectFilter, baseData]);

    const subjectsList = useMemo(() => {
        const uniqueSubjects = [...new Set(baseData.map((file) => file.subject))].filter(Boolean);
        return uniqueSubjects.map((subject) => ({ value: subject, label: subject }));
    }, [baseData]);

    const { stats, uniqueUploaders, coursesList, categories } = useMemo(() => {
        const uploaderMap = new Map();
        baseData.forEach((file) => {
            if (file.uploadedBy?._id) {
                uploaderMap.set(file.uploadedBy._id, file.uploadedBy);
            }
        });

        const uniqueUploaderList = Array.from(uploaderMap.values());
        const courseList = [...new Set(baseData.map((file) => file.course))].filter(
            Boolean,
        );
        const categoryList = [
            ...new Set(baseData.map((file) => file.category)),
        ].filter(Boolean);

        return {
            stats: {
                totalFiles: baseData.length,
                courses: courseList.length,
                categories: categoryList.length,
                uploaders: uniqueUploaderList.length,
            },
            uniqueUploaders: uniqueUploaderList.map((u) => ({
                value: u._id,
                label: u.name,
            })),
            coursesList: courseList.map((c) => ({ value: c, label: c })),
            categories: categoryList.map((c) => ({ value: c, label: c })),
        };
    }, [baseData]);

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
                    ? "All Semesters"
                    : `${sem}${getOrdinalSuffix(parseInt(sem, 10))} Semester`,
        })) ?? [])
        : [];
    const getSubjectsForCourseAndSemester = (course, semester) => {
        const semesterData = subjectsByCourseAndSemester?.[course]?.[semester];
        if (Array.isArray(semesterData)) return semesterData;
        if (semesterData?.subjects)
            return semesterData.subjects.map((sub) => sub.name || sub);
        return [];
    };
    const availableSubjects =
        selectedCourse && selectedSemester
            ? getSubjectsForCourseAndSemester(selectedCourse, selectedSemester).map(
                (sub) => ({ value: sub, label: sub }),
            )
            : [];

    useEffect(() => {
        if (selectedSemester === "0") setSelectedSubject("Whole Semester");
    }, [selectedSemester]);

    const handleTypeChange = (type) =>
        setSelectedTypes(selectedTypes === type ? null : type);
    const handleCategoryChange = (category) => {
        if (selectedCategory === category) {
            setSelectedCategory(null);
            setSelectedTypes(null);
        } else {
            setSelectedCategory(category);
            setSelectedTypes(category === "paper" ? "image" : null);
        }
    };
    const handleYearChange = (e) => {
        const value = e.target?.value;
        if (/^\d{0,4}$/.test(value ?? "")) setSelectedYear(value ?? "");
    };

    const customSelectStyles = {
        control: (p) => ({
            ...p,
            backgroundColor: "rgba(55, 65, 81, 0.5)",
            borderColor: "#4b5563",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            color: "#ffffff",
            boxShadow: "none",
            "&:hover": { borderColor: "#10b981" },
        }),
        menu: (p) => ({
            ...p,
            backgroundColor: "rgba(31, 41, 55, 0.95)",
            borderRadius: "0.5rem",
            marginTop: "0.25rem",
            border: "1px solid #4b5563",
            zIndex: 50,
        }),
        option: (p, s) => ({
            ...p,
            backgroundColor: s.isSelected ? "#10b981" : "transparent",
            color: s.isSelected ? "#ffffff" : "#d1d5db",
            padding: "0.5rem 1rem",
            "&:hover": {
                backgroundColor: s.isSelected ? "#10b981" : "rgba(16, 185, 129, 0.1)",
                color: "#ffffff",
            },
        }),
        singleValue: (p) => ({ ...p, color: "#ffffff" }),
        placeholder: (p) => ({ ...p, color: "#9ca3af" }),
        input: (p) => ({ ...p, color: "#ffffff" }),
    };

    return (
        <>
            <div className="fixed top-1/2 -translate-y-1/2 right-2 md:right-4 z-10 pointer-events-none">
                <div
                    className="flex flex-col items-center rounded-full border border-amber-400/30 bg-black/30 backdrop-blur-lg px-1.5 py-4 md:px-2 md:py-5"
                >
                    <Crown className="h-5 w-5 text-amber-400 md:h-6 md:w-6 mb-2" />
                    {"CREATORS".split("").map((char, index) => (
                        <span
                            key={index}
                            className="font-mono text-xs font-bold uppercase text-amber-300/80 md:text-xl"
                        >
                            {char}
                        </span>
                    ))}
                </div>
            </div>

            <div
                {...swipeHandlers}
                className="min-h-screen  w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center p-0 pb-8 pt-24" >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Helmet>
                        <title>Admin Files - Creator Panel</title>
                        <meta name="description" content="Manage all available files." />
                    </Helmet>

                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-8"
                        >
                            <div className="bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-8">
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    File Management Dashboard
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-blue-600/10 p-5 rounded-xl border border-blue-700/30">
                                        <h3 className="text-lg font-semibold text-blue-300">
                                            Total Files
                                        </h3>
                                        <p className="text-3xl font-bold text-white">
                                            {stats.totalFiles}
                                        </p>
                                    </div>
                                    <div className="bg-green-600/10 p-5 rounded-xl border border-green-700/30">
                                        <h3 className="text-lg font-semibold text-green-300">
                                            Courses
                                        </h3>
                                        <p className="text-3xl font-bold text-white">
                                            {stats.courses}
                                        </p>
                                    </div>
                                    <div className="bg-purple-600/10 p-5 rounded-xl border border-purple-700/30">
                                        <h3 className="text-lg font-semibold text-purple-300">
                                            Categories
                                        </h3>
                                        <p className="text-3xl font-bold text-white">
                                            {stats.categories}
                                        </p>
                                    </div>
                                    <div className="bg-amber-600/10 p-5 rounded-xl border border-amber-700/30">
                                        <h3 className="text-lg font-semibold text-amber-300">
                                            Uploaders
                                        </h3>
                                        <p className="text-3xl font-bold text-white">
                                            {stats.uploaders}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 mb-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <FilterDropdown
                                        options={uniqueUploaders}
                                        value={uploaderFilter}
                                        onChange={setUploaderFilter}
                                        allLabel="All Uploaders"
                                    />
                                    <FilterDropdown
                                        options={categories}
                                        value={categoryFilter}
                                        onChange={setCategoryFilter}
                                        allLabel="All Categories"
                                    />
                                    <FilterDropdown
                                        options={coursesList}
                                        value={courseFilter}
                                        onChange={setCourseFilter}
                                        allLabel="All Courses"
                                    />
                                    <FilterDropdown
                                        options={subjectsList}
                                        value={subjectFilter}
                                        onChange={setSubjectFilter}
                                        allLabel="All Subjects"
                                    />
                                </div>
                                <ToggleSwitch
                                    enabled={includeCreators}
                                    setEnabled={setIncludeCreators}
                                    label="Include Creators"
                                />
                            </div>
                        </motion.div>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader className="w-12 h-12 text-green-400 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-500/10 p-6 rounded-2xl flex items-center justify-center gap-3">
                                <AlertCircle size={24} />
                                <span className="text-lg">{error}</span>
                            </div>
                        ) : filteredFiles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredFiles.map((file, index) => (
                                    <motion.div
                                        key={file._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="p-5 flex-grow">
                                            <h3 className="text-lg md:text-xl font-bold text-white mb-3 line-clamp-2">
                                                {file.name || "Untitled File"}
                                            </h3>
                                            <div className="space-y-2 text-gray-300 text-sm">
                                                <p className="flex items-start gap-2">
                                                    <BookDashed
                                                        size={16}
                                                        className="text-green-400 mt-0.5 flex-shrink-0"
                                                    />
                                                    <span className="truncate">{file.course || "N/A"}</span>
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <Book
                                                        size={16}
                                                        className="text-green-400 mt-0.5 flex-shrink-0"
                                                    />
                                                    <span className="truncate">
                                                        {file.subject || "N/A"}
                                                    </span>
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <GraduationCap
                                                        size={16}
                                                        className="text-green-400 mt-0.5 flex-shrink-0"
                                                    />
                                                    <span>
                                                        {file.course
                                                            ? `${file.course} - Sem ${file.semester || "N/A"}`
                                                            : "N/A"}
                                                    </span>
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <Calendar
                                                        size={16}
                                                        className="text-green-400 mt-0.5 flex-shrink-0"
                                                    />
                                                    <span>Year: {file.year || "N/A"}</span>
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <Tag
                                                        size={16}
                                                        className="text-green-400 mt-0.5 flex-shrink-0"
                                                    />
                                                    <span className="font-semibold capitalize">
                                                        Category: {file.category || "N/A"}
                                                    </span>
                                                </p>
                                                <p className="flex items-center gap-2 flex-wrap">
                                                    <User size={16} className="text-green-400 shrink-0" />
                                                    <span className="font-semibold truncate">
                                                        {file.uploadedBy?.name}
                                                    </span>
                                                    {(file?.uploadedBy?.email === "bdhakad886@gmail.com" ||
                                                        file?.uploadedBy?.email === "pratikajbe40@gmail.com") && (
                                                            <span className="text-green-500 bg-gray-900 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap">
                                                                Creator
                                                            </span>
                                                        )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/50 p-3 grid grid-cols-3 gap-2">
                                            <motion.button
                                                onClick={() => setSelectedViewFile(file)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                            >
                                                <View size={14} /> View
                                            </motion.button>
                                            <motion.button
                                                onClick={() => openEditModal(file)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                            >
                                                <Edit size={14} /> Edit
                                            </motion.button>
                                            <motion.button
                                                onClick={() => openDeleteModal(file)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700"
                            >
                                <div className="mx-auto bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center border border-gray-700">
                                    <FileX className="w-12 h-12 text-gray-500" />
                                </div>
                                <h3 className="mt-6 text-2xl font-bold text-white">
                                    No Files Found
                                </h3>
                                <p className="mt-2 text-gray-400 max-w-md mx-auto">
                                    No files match the selected filters.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700 w-full max-w-4xl my-8"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-700">
                                <h3 className="text-xl font-bold text-white">
                                    Edit File Details
                                </h3>
                                <button
                                    onClick={closeEditModal}
                                    className="text-gray-400 hover:text-white disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    <X />
                                </button>
                            </div>
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Paper Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target?.value ?? "")}
                                        placeholder="Enter paper name"
                                        className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-green-500 text-white placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Course
                                    </label>
                                    <Select
                                        options={courseOptions}
                                        value={courseOptions?.find(
                                            (c) => c.value === selectedCourse,
                                        )}
                                        onChange={(o) => {
                                            setSelectedCourse(o.value);
                                            setSelectedSemester("");
                                            setSelectedSubject("");
                                        }}
                                        placeholder="Select Course"
                                        styles={customSelectStyles}
                                        isSearchable
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Semester
                                    </label>
                                    <Select
                                        options={availableSemesters}
                                        value={availableSemesters?.find(
                                            (s) => s.value === selectedSemester,
                                        )}
                                        onChange={(o) => {
                                            setSelectedSemester(o.value);
                                            setSelectedSubject("");
                                        }}
                                        placeholder="Select Semester"
                                        isDisabled={!selectedCourse}
                                        styles={customSelectStyles}
                                        isSearchable
                                    />
                                </div>
                                {selectedSemester !== "0" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Subject
                                        </label>
                                        <Select
                                            options={availableSubjects}
                                            value={availableSubjects?.find(
                                                (s) => s.value === selectedSubject,
                                            )}
                                            onChange={(o) => setSelectedSubject(o.value)}
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
                                    <div className="flex-1 mb-4 sm:mb-0">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Category
                                        </label>
                                        <div className="flex flex-wrap gap-3 pt-3">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategory === "paper"}
                                                    onChange={() => handleCategoryChange("paper")}
                                                    className="hidden peer"
                                                />
                                                <span className="w-6 h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500">
                                                    <AnimatePresence>
                                                        {selectedCategory === "paper" && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                            >
                                                                <Check className="w-4 h-4 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </span>
                                                <span className="text-gray-300">Paper</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategory === "notes"}
                                                    onChange={() => handleCategoryChange("notes")}
                                                    className="hidden peer"
                                                />
                                                <span className="w-6 h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500">
                                                    <AnimatePresence>
                                                        {selectedCategory === "notes" && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                            >
                                                                <Check className="w-4 h-4 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </span>
                                                <span className="text-gray-300">Notes</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategory === "syllabus"}
                                                    onChange={() => handleCategoryChange("syllabus")}
                                                    className="hidden peer"
                                                />
                                                <span className="w-6 h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500">
                                                    <AnimatePresence>
                                                        {selectedCategory === "syllabus" && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                            >
                                                                <Check className="w-4 h-4 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </span>
                                                <span className="text-gray-300">Syllabus</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Year
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedYear}
                                            onChange={handleYearChange}
                                            placeholder="e.g., 2023"
                                            className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-green-500 text-white placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                                {selectedCategory === "paper" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Resource Type
                                        </label>
                                        <Select
                                            options={Object.values(ResourceTypes)}
                                            value={Object.values(ResourceTypes)?.find(
                                                (type) => type.value === selectedResourceType,
                                            )}
                                            onChange={(o) => setSelectedResourceType(o.value)}
                                            placeholder="Select Resource Type"
                                            styles={customSelectStyles}
                                            isSearchable
                                        />
                                    </div>
                                )}
                                {selectedCategory !== "paper" && (
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            File Type
                                        </label>
                                        <div className="flex flex-wrap gap-3 pt-3">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTypes === "image"}
                                                    onChange={() => handleTypeChange("image")}
                                                    className="hidden peer"
                                                />
                                                <span className="w-6 h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500">
                                                    <AnimatePresence>
                                                        {selectedTypes === "image" && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                            >
                                                                <Check className="w-4 h-4 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </span>
                                                <span className="text-gray-300">Image</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTypes === "document"}
                                                    onChange={() => handleTypeChange("document")}
                                                    className="hidden peer"
                                                />
                                                <span className="w-6 h-6 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500">
                                                    <AnimatePresence>
                                                        {selectedTypes === "document" && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                            >
                                                                <Check className="w-4 h-4 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </span>
                                                <span className="text-gray-300">Document</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                                {modalError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center space-x-2 p-4 rounded-lg bg-red-600/20 border border-red-500"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                        <span className="text-red-300 text-sm">{modalError}</span>
                                    </motion.div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
                                <motion.button
                                    type="button"
                                    onClick={closeEditModal}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    onClick={handleUpdateFile}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={
                                        isSubmitting ||
                                        !fileName ||
                                        !selectedCourse ||
                                        !selectedSemester ||
                                        !selectedSubject ||
                                        !selectedCategory ||
                                        !/^\d{4}$/.test(selectedYear) ||
                                        (selectedCategory !== "paper" && !selectedTypes)
                                    }
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Update File"
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                )
            </AnimatePresence>
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-8 text-center"
                        >
                            <form onSubmit={handleDeleteFile}>
                                <div className="mx-auto bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mt-4">
                                    Delete File?
                                </h3>
                                <p className="text-gray-300 mt-2">
                                    Are you sure you want to delete{" "}
                                    <strong className="text-white">
                                        "{selectedFile?.name || "this file"}"
                                    </strong>
                                    ? This action cannot be undone.
                                </p>
                                {modalError && (
                                    <p className="text-red-400 text-sm mt-4">{modalError}</p>
                                )}
                                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                                    <motion.button
                                        type="button"
                                        onClick={closeDeleteModal}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Delete"
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {selectedViewFile && (
                <FileViewer
                    file={selectedViewFile}
                    onClose={() => setSelectedViewFile(null)}
                    isAllFiles={true}
                />
            )}
        </>
    );
};

export default AdminFilesPage;
