"use client"

import { useState, useEffect, useMemo, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Helmet } from "react-helmet-async"
import Select from "react-select"
import { Loader, AlertCircle, Calendar, Book, Tag, GraduationCap, X, Search, File as FileIcon, Filter, BookDashed } from "lucide-react"
import FileViewer from "../fileComponents/FileViewer"
import { API_URL } from "../utils/urls"
import { useSwipeable } from "react-swipeable"
import { ValuesContext } from "../context/ValuesContext"

const courses = [
    { value: "BCA", label: "BCA" },
    { value: "MCA", label: "MCA" },
    { value: "BCA_INT", label: "BCA Integrated" },
    { value: "MSC_INT_CS", label: "M.Sc. Integrated (CS)" },
    { value: "MTECH_CS", label: "M.Tech(CS)" },
    { value: "MTECH_CS_EXEC", label: "M.Tech(CS) Executive" },
    { value: "MTECH_NM_IS", label: "M.Tech(NM & IS)" },
    { value: "MTECH_IA_SE", label: "M.Tech(IA & SE)" },
    { value: "PHD", label: "PhD" },
    { value: "MSC_CS", label: "M.Sc. (CS)" },
    { value: "MSC_IT", label: "M.Sc. (IT)" },
    { value: "MBA_CM", label: "MBA (CM)" },
    { value: "PGDCA", label: "PGDCA" },
];

const allSubjectOptions = [
    'Accounting for Managers', 'Advanced Algorithms', 'Advanced Computing', 'Advanced Computer Networks',
    'Advanced Database Systems', 'Advanced Operating Systems', 'Advanced Software Engineering',
    'Advanced Topics in Computing', 'Advanced Web Technologies', 'Agile Methodologies',
    'Agile Software Development', 'Artificial Intelligence', 'Artificial Intelligence and Machine Learning',
    'Automata Theory and Compiler Constructions', 'Big Data Analytics', 'Big Data Technologies',
    'Business Communication', 'Business Intelligence', 'Case Studies Project', 'Cloud & Data Center Networking',
    'Cloud Computing', 'Cloud Security', 'Cloud Services', 'Communication Skills',
    'Communication Skills and Report Writing', 'Compiler Design', 'Component-Based Software Engineering',
    'Computer Fundamentals & PC Software', 'Computer Graphics', 'Computer Networks',
    'Computer Networks & Security', 'Computer Organisation and Architecture', 'Computer Organization',
    'Computer Systems and Networks', 'Cryptography and Network Security', 'Cryptography Basics',
    'Cyber Law & Ethics', 'Cyber Security', 'Cyber Threat Intelligence', 'Data Science',
    'Data Science & Analytics', 'Data Structures', 'Data Structures Using C++',
    'Data Warehousing and Mining', 'Database Management System', 'Database Management Systems',
    'Database Management using FoxPro', 'Deep Learning', 'Design and Analysis of Algorithms', 'DevOps',
    'Digital Electronics', 'Digital Forensics-I', 'Digital Forensics-II', 'Digital Image Processing',
    'Discrete Mathematics', 'Dissertation / Major Project', 'E-Business Strategies', 'E-Commerce',
    'Elective I', 'Elective II', 'Ethical Hacking', 'Ethical Hacking Fundamentals', 'Fundamentals of IT & Programming',
    'GUI Programming with Visual Basic', 'Human Resource Management', 'IT for Managers', 'IT Fundamentals',
    'Information & System Security', 'Information Architecture & Design', 'Information Security',
    'Information Systems Security', 'Information Technology Project Management', 'Internet and Web Technology',
    'Internet of Things (IoT)', 'Internship and Project Report', 'Intrusion Detection Systems', 'Intro to Cyber Security',
    'IoT Security', 'Java Programming', 'Literature Review', 'Machine Learning', 'Major Project',
    'Major Project / Internship', 'Malware Analysis', 'Managerial Economics', 'Marketing Management',
    'Mathematical Foundation for Computer Application', 'Mathematics for Computing', 'Mathematics-I',
    'Mathematics-II', 'Minor Project', 'Minor Project-I', 'Minor Project-II', 'Mobile & Wireless Security',
    'Mobile Application Development', 'Modern Computer Architecture', 'Network Essentials', 'Network Fundamentals',
    'Network Management & Operations', 'Network Programming', 'Network Security & Firewalls',
    'Object Oriented Programming', 'Object-Oriented Analysis & Design', 'Object-Oriented Programming',
    'Object-Oriented Programming with C++', 'Operating System', 'Operating Systems', 'Principles of Information Security',
    'Principles of Management', 'Programming in C', "Programming in 'C'", 'Project Work', 'Python for Security',
    'Research Methodology', 'Research Seminar', 'Secure Coding Practices', 'Service-Oriented Architecture',
    'Software Architecture & Patterns', 'Software Engineering', 'Software Metrics & Quality Assurance',
    'Software Project & Risk Management', 'Software Project Management', 'Statistical Methods', 'Strategic Management',
    'System Analysis and Design', 'Theory of Computation', 'Thesis Work', 'User Experience (UX) Design',
    'Web Design and Internet', 'Web Development', 'Web Application Security', 'Web Technologies', 'Wireless & Mobile Networks'
].map(s => ({ value: s, label: s }));


const getOrdinalSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

const semesterOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}${getOrdinalSuffix(i + 1)} Semester`
}));

const customSelectStyles = {
    control: (provided) => ({ ...provided, backgroundColor: 'rgba(55, 65, 81, 0.7)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#ffffff', boxShadow: 'none', '&:hover': { borderColor: '#10b981' } }),
    menu: (provided) => ({ ...provided, backgroundColor: 'rgba(31, 41, 55, 0.95)', borderRadius: '0.5rem', border: '1px solid #4b5563' }),
    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#10b981' : 'transparent', color: state.isSelected ? '#ffffff' : '#d1d5db', '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#ffffff' } }),
    singleValue: (provided) => ({ ...provided, color: '#ffffff' }),
    placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
    input: (provided) => ({ ...provided, color: '#ffffff' }),
};

const AllFilesPage = () => {
    const [allFiles, setAllFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [filters, setFilters] = useState({
        course: null, semester: null, subject: null, year: null, category: null, type: null
    });

    const dropdownOptions = useMemo(() => {
        if (!allFiles.length) return { years: [], categories: [], types: [] };
        const uniqueYears = [...new Set(allFiles.map(f => f.year))].sort((a, b) => b - a);
        return {
            years: uniqueYears.map(y => ({ value: y, label: y })),
            categories: [{ value: 'paper', label: 'Paper' }, { value: 'notes', label: 'Notes' }, { value: 'syllabus', label: 'Syllabus' }],
            types: [{ value: 'image', label: 'Image' }, { value: 'document', label: 'Document' }],
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
                    throw new Error(result.message || 'Failed to fetch files.');
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
        setFilters(prevFilters => ({ ...prevFilters, [name]: selectedOption }));
    };

     useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

    const handleApplyFilters = () => {
        let filesToFilter = [...allFiles];

        if (searchTerm.trim() !== '') {
            filesToFilter = filesToFilter.filter(file =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.course) filesToFilter = filesToFilter.filter(f => f.course === filters.course.value);
        if (filters.semester) filesToFilter = filesToFilter.filter(f => f.semester === filters.semester.value);
        if (filters.subject) filesToFilter = filesToFilter.filter(f => f.subject === filters.subject.value);
        if (filters.year) filesToFilter = filesToFilter.filter(f => f.year === filters.year.value);
        if (filters.category) filesToFilter = filesToFilter.filter(f => f.category === filters.category.value);
        if (filters.type) filesToFilter = filesToFilter.filter(f => f.type === filters.type.value);

        setFilteredFiles(filesToFilter);
    };

    const resetFilters = () => {
        setFilters({ course: null, semester: null, subject: null, year: null, category: null, type: null });
        setSearchTerm('');
        setFilteredFiles(allFiles);
    };

    const handleCloseViewer = () => {
        setSelectedFile(null);
    };

    const handleFileClick = (file, subject) => {
        setSelectedFile(file);
        console.log("Selected file: on paper : ", file, subject);
    };

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
        <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 p-0 pb-8 pt-24">
            <Helmet>
                <title>All Files - SCSIT</title>
                <meta name="description" content="Browse and filter all available files and study materials." />
            </Helmet>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">Browse All Files</h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
                        Find the study materials you need. Use the filters below to narrow down your search.
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="relative col-span-1 md:col-span-2 lg:col-span-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by file name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700/70 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500 transition"
                            />
                        </div>
                        <Select menuPortalTarget={document.body} isClearable noOptionsMessage={() => "No options"} placeholder="Filter by Course..." options={courses} value={filters.course} onChange={opt => handleFilterChange('course', opt)} styles={customSelectStyles} />
                        <Select menuPortalTarget={document.body} isClearable noOptionsMessage={() => "No options"} placeholder="Filter by Semester..." options={semesterOptions} value={filters.semester} onChange={opt => handleFilterChange('semester', opt)} styles={customSelectStyles} />
                        <Select menuPortalTarget={document.body} isClearable noOptionsMessage={() => "No subjects found"} placeholder="Filter by Subject..." options={allSubjectOptions} value={filters.subject} onChange={opt => handleFilterChange('subject', opt)} styles={customSelectStyles} />
                        <Select menuPortalTarget={document.body} isClearable noOptionsMessage={() => "No years found"} placeholder="Filter by Year..." options={dropdownOptions.years} value={filters.year} onChange={opt => handleFilterChange('year', opt)} styles={customSelectStyles} />
                        <Select menuPortalTarget={document.body} isClearable noOptionsMessage={() => "No options"} placeholder="Filter by Category..." options={dropdownOptions.categories} value={filters.category} onChange={opt => handleFilterChange('category', opt)} styles={customSelectStyles} />
                        <Select menuPortalTarget={document.body} isClearable noOptionsMessage={() => "No options"} placeholder="Filter by Type..." options={dropdownOptions.types} value={filters.type} onChange={opt => handleFilterChange('type', opt)} styles={customSelectStyles} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <button onClick={handleApplyFilters} className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors py-2.5">
                            <Filter size={18} /> Apply Filters
                        </button>
                        <button onClick={resetFilters} className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors py-2.5">
                            <X size={18} /> Reset Filters
                        </button>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Loader className="w-12 h-12 text-green-400 animate-spin" /></div>
                ) : error ? (
                    <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg flex items-center justify-center gap-2"><AlertCircle /> {error}</div>
                ) : (
                    <AnimatePresence>
                        {filteredFiles.length > 0 ? (
                            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredFiles.map((file) => (
                                    <motion.div layout key={file._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden flex flex-col group">
                                        <div className="p-6 flex-grow">
                                            <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
                                            <div className="space-y-2 text-gray-300 text-sm">
                                                <p className="flex items-center gap-2"><BookDashed size={14} className="text-green-400" /> {file.course}</p>
                                                <p className="flex items-center gap-2"><Book size={14} className="text-green-400" /> {file.subject}</p>
                                                <p className="flex items-center gap-2"><GraduationCap size={14} className="text-green-400" /> {file.course} - Sem {file.semester}</p>
                                                <p className="flex items-center gap-2"><Calendar size={14} className="text-green-400" /> Year: {file.year}</p>
                                                <p className="flex items-center gap-2"><Tag size={14} className="text-green-400" /> Category: <span className="font-semibold capitalize">{file.category}</span></p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/50 p-4 mt-auto" onClick={() => handleFileClick(file, file.subject)}>
                                            <span className="flex items-center justify-center gap-2 w-full text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                                                <FileIcon size={16} className="transition-transform group-hover:translate-x-1" /> View File
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700">
                                <div className="mx-auto bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center border border-gray-700">
                                    <Search className="w-12 h-12 text-gray-500" />
                                </div>
                                <h3 className="mt-6 text-2xl font-bold text-white">No Files Found</h3>
                                <p className="mt-2 text-gray-400">
                                    {allFiles.length > 0 ? "No files match your current filter criteria." : "No files have been uploaded to the site yet."}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
            {selectedFile && <FileViewer file={selectedFile} onClose={handleCloseViewer} isAllFiles={true} />}
        </div>
    );
};

export default AllFilesPage;