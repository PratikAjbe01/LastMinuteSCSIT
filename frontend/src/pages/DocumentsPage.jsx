"use client"

import { motion } from "framer-motion";
import { ArrowLeft, FileText, Calendar, Filter } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileViewer from "../fileComponents/FileViewer";
import { Helmet } from "react-helmet-async";
import loadingGif from "../../public/loadinggif.gif";
import { API_URL } from "../utils/urls";
import { useSwipeable } from "react-swipeable";
import { ValuesContext } from "../context/ValuesContext";

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
];

const createSemesterData = (subjects) => subjects.map(name => ({ name, papers: [] }));

const ALL_SEMESTER_DATA = {
    "BCA": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Programming in C", "Mathematics for Computing", "Digital Electronics", "Communication Skills", "Computer Organization"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Data Structures", "Discrete Mathematics", "Web Development", "Object Oriented Programming", "Database Management Systems"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Operating Systems", "Computer Networks", "Java Programming", "Software Engineering", "Computer Graphics"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Advanced Database Systems", "Web Technologies", "Project Work"]) },
        "5": { title: "5th Semester", subjects: createSemesterData(["Artificial Intelligence", "Cyber Security", "Mobile Application Development"]) },
        "6": { title: "6th Semester", subjects: createSemesterData(["Cloud Computing", "Big Data Analytics", "Project Work"]) },
    },
    "MCA": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Computer Organisation and Architecture", "Mathematical Foundation for Computer Application", "Data Structures Using C++", "Operating System", "Communication Skills and Report Writing"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Software Engineering", "Database Management System", "Design and Analysis of Algorithms", "Computer Networks", "Internet and Web Technology"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Information Security", "Automata Theory and Compiler Constructions", "Artificial Intelligence and Machine Learning", "Cloud Computing", "Information Technology Project Management"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Project Work"]) },
    },
    "BCA_INT": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Programming in C", "Mathematics for Computing", "Digital Electronics", "Communication Skills"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Data Structures", "Discrete Mathematics", "Web Development", "Computer Organization"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Operating Systems", "Object Oriented Programming", "Database Management Systems"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Computer Networks", "Java Programming", "Software Engineering"]) },
        "5": { title: "5th Semester", subjects: createSemesterData(["Computer Graphics", "Web Technologies", "Advanced Database Systems"]) },
        "6": { title: "6th Semester", subjects: createSemesterData(["Artificial Intelligence", "Cloud Computing", "Project Work"]) },
        "7": { title: "7th Semester", subjects: createSemesterData(["Big Data Analytics", "Cyber Security", "Mobile Application Development"]) },
        "8": { title: "8th Semester", subjects: createSemesterData(["Advanced Web Technologies", "Project Work"]) },
    },
    "MSC_INT_CS": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Fundamentals of IT & Programming", "Digital Logic", "Mathematics-I", "Communication Skills"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Data Structures", "Computer Organization", "Mathematics-II", "Intro to Cyber Security"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Object-Oriented Programming", "Operating Systems", "Database Management Systems", "Network Fundamentals"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Web Technologies", "Software Engineering", "Principles of Information Security", "Python for Security"]) },
        "5": { title: "5th Semester", subjects: createSemesterData(["Computer Networks & Security", "Cryptography Basics", "Ethical Hacking Fundamentals", "Cyber Law & Ethics"]) },
        "6": { title: "6th Semester", subjects: createSemesterData(["Secure Coding Practices", "Web Application Security", "Digital Forensics-I", "Minor Project-I"]) },
        "7": { title: "7th Semester", subjects: createSemesterData(["Network Security & Firewalls", "Malware Analysis", "Intrusion Detection Systems", "Elective-I"]) },
        "8": { title: "8th Semester", subjects: createSemesterData(["Cloud Security", "Mobile & Wireless Security", "Digital Forensics-II", "Elective-II"]) },
        "9": { title: "9th Semester", subjects: createSemesterData(["Advanced Cryptography", "IoT Security", "Cyber Threat Intelligence", "Minor Project-II"]) },
        "10": { title: "10th Semester", subjects: createSemesterData(["Major Project / Internship"]) },
    },
    "MTECH_CS": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Advanced Data Structures", "Theory of Computation", "Modern Computer Architecture", "Advanced Algorithms"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Machine Learning", "Advanced Database Systems", "Compiler Design", "Research Methodology"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Deep Learning", "Cloud Computing", "Minor Project"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Dissertation / Major Project"]) },
    },
    "MTECH_CS_EXEC": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Software Project Management", "Advanced Operating Systems", "Data Warehousing & Mining", "IT Strategy"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Agile Methodologies", "Information Systems Security", "Business Intelligence", "Cloud Services"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Big Data Analytics", "DevOps", "Case Studies Project"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Dissertation / Major Project"]) },
    },
    "MTECH_NM_IS": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Advanced Computer Networks", "Cryptography & Network Security", "Network Programming", "Wireless & Mobile Networks"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Information & System Security", "Network Management & Operations", "Ethical Hacking", "Research Methodology"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Cloud & Data Center Networking", "Intrusion Detection & Prevention Systems", "Digital Forensics", "Minor Project"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Dissertation / Major Project"]) },
    },
    "MTECH_IA_SE": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Advanced Software Engineering", "Information Architecture & Design", "Software Metrics & Quality Assurance", "Object-Oriented Analysis & Design"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Software Architecture & Patterns", "Component-Based Software Engineering", "User Experience (UX) Design", "Research Methodology"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Software Project & Risk Management", "Agile Software Development", "Service-Oriented Architecture", "Minor Project"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Dissertation / Major Project"]) },
    },
    "PHD": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Research Methodology", "Advanced Computing", "Statistical Methods"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Machine Learning", "Data Science", "Literature Review"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Artificial Intelligence", "Advanced Algorithms", "Big Data Analytics"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Cyber Security", "Cloud Computing", "Thesis Work"]) },
        "5": { title: "5th Semester", subjects: createSemesterData(["Advanced Topics in Computing", "Research Seminar"]) },
        "6": { title: "6th Semester", subjects: createSemesterData(["Thesis Work"]) },
    },
    "MSC_CS": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Advanced Data Structures", "Theory of Computation", "Advanced Algorithms", "Computer Systems and Networks"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Artificial Intelligence", "Compiler Design", "Advanced Database Systems", "Software Project Management"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Machine Learning", "Cryptography and Network Security", "Cloud Computing", "Elective I"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Major Project"]) },
    },
    "MSC_IT": {
        "1": { title: "1st Semester", subjects: createSemesterData(["IT Fundamentals", "Web Technologies", "Object-Oriented Programming", "Network Essentials"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Data Warehousing and Mining", "Mobile Computing", "Information Security", "E-Commerce"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Big Data Technologies", "Internet of Things (IoT)", "Digital Image Processing", "Elective II"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Major Project"]) },
    },
    "MBA_CM": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Principles of Management", "Managerial Economics", "IT for Managers", "Accounting for Managers"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["Marketing Management", "Human Resource Management", "Database Management Systems", "Business Communication"]) },
        "3": { title: "3rd Semester", subjects: createSemesterData(["Software Project Management", "E-Business Strategies", "Information Systems Security", "Strategic Management"]) },
        "4": { title: "4th Semester", subjects: createSemesterData(["Internship and Project Report"]) },
    },
    "PGDCA": {
        "1": { title: "1st Semester", subjects: createSemesterData(["Computer Fundamentals & PC Software", "Programming in 'C'", "Database Management using FoxPro", "System Analysis and Design"]) },
        "2": { title: "2nd Semester", subjects: createSemesterData(["GUI Programming with Visual Basic", "Web Design and Internet", "Object-Oriented Programming with C++", "Project Work"]) },
    },
};

const DocumentsPage = () => {
    const { course, semesterId } = useParams();
    const semester = parseInt(semesterId, 10);
    const navigate = useNavigate();
    const [semesterData, setSemesterData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('paper');
    const [subjectFilters, setSubjectFilters] = useState({});

    const categories = [
        { value: 'paper', label: 'Question Papers' },
        { value: 'notes', label: 'Notes' },
        { value: 'syllabus', label: 'Syllabus' },
    ];

    const categoryDescriptions = {
        paper: "Previous year examination papers",
        notes: "Lecture notes and study materials",
        syllabus: "Course syllabus and outlines",
    };

    const handleCloseViewer = () => {
        setSelectedFile(null);
    };

    const selectedCourseInfo = courses.find(c => c.value === course?.toUpperCase());
    const courseLabel = selectedCourseInfo ? selectedCourseInfo.label : "Unknown Course";

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        const fetchAndProcessFiles = async () => {
            if (!selectedCourseInfo || isNaN(semester)) {
                setError("Invalid course or semester specified.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/files/fetchCourseAndSemester`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ course: selectedCourseInfo.value, semester }),
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const result = await response.json();
                if (!result.success) throw new Error(result.message || "Failed to fetch files");

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

                const updatedSemester = {
                    ...baseSemesterStructure,
                    subjects: baseSemesterStructure.subjects.map(subject => ({
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
    }, [course, semesterId]);

    const handleFileClick = (file) => {
        setSelectedFile(file);
    };

    const onBack = () => {
        navigate(`/scsit/${course}/semesters/`);
    };

    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault()
        }
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
                e.preventDefault()
            }
        }
        document.addEventListener("contextmenu", handleContextMenu)
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
    const [showAllMap, setShowAllMap] = useState({});

    const toggleShowAll = (subjectName) => {
        setShowAllMap(prev => ({
            ...prev,
            [subjectName]: prev[subjectName] === 6 ? null : 6
        }));
    };

    const setSubjectYearFilter = (subjectName, year) => {
        setSubjectFilters(prev => ({
            ...prev,
            [subjectName]: year === 'all' ? null : year
        }));
    };

    const getUniqueYears = (papers) => {
        const years = [...new Set(papers.map(paper => paper.year).filter(Boolean))];
        return years.sort((a, b) => b - a);
    };

    const isExcludedRoute = typeof window !== 'undefined' && 
        (window.location.pathname.startsWith("/login") || window.location.pathname === "/signup");
    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
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

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center text-white">
                <img src={loadingGif} alt="Loading..." className="h-32 w-32 sm:h-48 sm:w-48 md:h-60 md:w-60" />
            </div>
        );
    }

    if (error || !semesterData) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h1>
                    <p className="text-gray-300 mb-6">{error || "No data available for this semester."}</p>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors mx-auto">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Go Back</span>
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black flex flex-col p-0">
            <Helmet>
                <title>{`${course?.toUpperCase()} - ${semesterData.title} | SCSIT`}</title>
                <meta name="description" content={`Documents for ${courseLabel} ${semesterData.title}.`} />
            </Helmet>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="sticky top-0 z-20 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-b-2xl border-b border-gray-700 pt-16 sm:pt-20 px-4 sm:px-6 md:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between pt-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                        {courseLabel}
                    </h1>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mt-2 sm:mt-0">
                        {semesterData.title}
                    </h2>
                </div>
                <div className="flex items-center justify-between mt-4 pb-4">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Back</span>
                    </motion.button>
                    <div className="flex flex-wrap justify-end gap-2 sm:gap-4">
                        {categories.map((cat) => (
                            <button key={cat.value} className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 ${selectedCategory === cat.value ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} onClick={() => setSelectedCategory(cat.value)}>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            <div className="space-y-6 sm:space-y-8 w-full px-4 sm:px-6 md:px-8 flex-1 my-8">
                {semesterData.subjects.length > 0 ? (
                    semesterData.subjects.map((subject, subjectIndex) => {
                        const filteredPapers = subject.papers.filter(paper => paper.category === selectedCategory);
                        const years = getUniqueYears(filteredPapers);
                        const selectedYear = subjectFilters[subject.name];
                        const displayPapers = selectedYear 
                            ? filteredPapers.filter(paper => paper.year == selectedYear)
                            : filteredPapers;
                        
                        const showAll = showAllMap[subject.name];
                        const papersToShow = showAll === null 
                            ? displayPapers 
                            : displayPapers.slice(0, showAll || 6);

                        return (
                            <motion.div key={subject.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * subjectIndex }} className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700 pb-2">
                                <div className="p-4 sm:p-6 border-b border-gray-700">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">{subject.name}</h2>
                                            <p className="text-sm sm:text-base text-gray-300">
                                                {categoryDescriptions[selectedCategory]} • {displayPapers.length} Papers
                                            </p>
                                        </div>
                                        
                                        {years.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
                                                <div className="relative">
                                                    <select 
                                                        value={selectedYear || 'all'}
                                                        onChange={(e) => setSubjectYearFilter(subject.name, e.target.value)}
                                                        className="appearance-none bg-gray-700 text-white text-sm rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer w-full sm:w-auto"
                                                    >
                                                        <option value="all">All Years</option>
                                                        {years.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base mb-1 truncate">
                                                                {paper.name}
                                                            </h3>
                                                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                                <span>{paper.year || "Unknown"}</span>
                                                                <span className="text-gray-500">•</span>
                                                                <span className="uppercase">{paper.type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-center col-span-full text-sm sm:text-base py-4">
                                            No {categories.find(cat => cat.value === selectedCategory)?.label.toLowerCase()} available for this subject {selectedYear ? `in ${selectedYear}` : ''}.
                                        </div>
                                    )}
                                    
                                    {displayPapers.length > 6 && (
                                        <div className="flex justify-center mt-4">
                                            <button 
                                                onClick={() => toggleShowAll(subject.name)}
                                                className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1"
                                            >
                                                {showAll === null ? "Show Less" : "Show All"} 
                                                <span className="bg-gray-700 rounded-full px-2 py-0.5 text-xs">
                                                    {displayPapers.length}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-300 text-sm sm:text-base py-10">No subjects are defined for this semester.</div>
                )}
            </div>
            {selectedFile && <FileViewer file={selectedFile} onClose={handleCloseViewer} />}
        </div>
    );
};

export default DocumentsPage;