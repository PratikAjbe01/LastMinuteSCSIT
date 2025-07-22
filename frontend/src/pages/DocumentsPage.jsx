import { motion } from "framer-motion";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileViewer from "../fileComponents/FileViewer";
import { Helmet } from "react-helmet-async";
import loadingGif from "../../public/loadinggif.gif";

const DocumentsPage = ({ onFileSelect }) => {
    const { course, semesterId } = useParams();
    const semester = parseInt(semesterId, 10);
    const navigate = useNavigate();
    const [semesterData, setSemesterData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('paper');

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

    const courses = [
        { value: "BCA", label: "Bachelor of Computer Applications (BCA)" },
        { value: "MCA", label: "Master of Computer Applications (MCA)" },
        { value: "BCA_INT", label: "BCA Integrated" },
        { value: "MTECH", label: "Master of Technology (MTech)" },
        { value: "PHD", label: "Doctor of Philosophy (PhD)" },
    ];

    const staticSemesterData = {
        1: {
            title: "1st Semester",
            subjects: [
                { name: "Computer Organisation and Architecture", papers: [] },
                { name: "Mathematical Foundation for Computer Application", papers: [] },
                { name: "Data Structures Using C++", papers: [] },
                { name: "Operating System", papers: [] },
                { name: "Communication Skills and Report Writing", papers: [] },
            ],
        },
        2: {
            title: "2nd Semester",
            subjects: [
                { name: "Software Engineering", papers: [] },
                { name: "Database Management System", papers: [] },
                { name: "Design and Analysis of Algorithms", papers: [] },
                { name: "Computer Networks", papers: [] },
                { name: "Internet and Web Technology", papers: [] },
            ],
        },
        3: {
            title: "3rd Semester",
            subjects: [
                { name: "Information Security", papers: [] },
                { name: "Automata Theory and Compiler Constructions", papers: [] },
                { name: "Artificial Intelligence and Machine Learning", papers: [] },
                { name: "Cloud Computing", papers: [] },
                { name: "Information Technology Project Management", papers: [] },
            ],
        },
        4: {
            title: "4th Semester",
            subjects: [{ name: "Project Work", papers: [] }],
        },
    };

    const selectedCourse = courses.find(c => c.value === course.toUpperCase());
    const courseLabel = selectedCourse ? selectedCourse.label : "Unknown Course";

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        const fetchFiles = async () => {
            if (!selectedCourse || isNaN(semester)) {
                setError("Invalid course or semester");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/files/fetchCourseAndSemester`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ course: selectedCourse?.value, semester }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Fetch Response Error:", {
                        status: response.status,
                        statusText: response.statusText,
                        body: errorText,
                    });
                    throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const errorText = await response.text();
                    console.error("Non-JSON Response:", errorText);
                    throw new Error("Response is not JSON");
                }

                const responseClone = response.clone();
                const responseText = await responseClone.text();
                console.log("Raw Response Body:", responseText);

                if (!responseText) {
                    console.warn("Empty response received from server");
                    setSemesterData({
                        ...staticSemesterData[semester],
                        title: `${course} ${staticSemesterData[semester]?.title || `Semester ${semester}`}`,
                        subjects: staticSemesterData[semester]?.subjects.map(subject => ({
                            ...subject,
                            papers: [],
                        })) || [],
                    });
                    setLoading(false);
                    return;
                }

                const result = await response.json();
                console.log("API Response:", result);

                if (!result.success) {
                    throw new Error(result.message || "Failed to fetch files");
                }

                if (result.data.length === 0) {
                    console.warn("No files found for the selected course and semester.");
                }

                const filesBySubject = result.data.reduce((acc, file) => {
                    const subject = file?.subject;
                    if (!acc[subject]) {
                        acc[subject] = [];
                    }
                    const pdfUrl = file?.fileUrl?.replace('/upload/', '/upload/fl_inline/');
                    const documentUrl = file?.type === "image" ? file?.fileUrl : pdfUrl;
                    acc[subject].push({
                        title: file?.name,
                        year: file?.year || "Unknown",
                        type: file?.type,
                        url: file?.fileUrl,
                        subject: file?.subject,
                        semester: file?.semester,
                        category: file?.category,
                    });
                    return acc;
                }, {});

                console.log("Files by Subject:", filesBySubject);

                const updatedSemester = {
                    ...staticSemesterData[semester],
                    title: `${course} ${staticSemesterData[semester]?.title || `Semester ${semester}`}`,
                    subjects: staticSemesterData[semester]?.subjects.map(subject => ({
                        ...subject,
                        papers: filesBySubject[subject.name] || [],
                    })) || [],
                };

                console.log("Updated Semester Data:", updatedSemester);

                const allCategories = new Set();
                updatedSemester.subjects.forEach(subject => {
                    subject.papers.forEach(paper => {
                        if (paper.category) {
                            allCategories.add(paper.category);
                        }
                    });
                });
                console.log("Available categories:", Array.from(allCategories));

                updatedSemester.subjects.forEach(subject => {
                    console.log(`Subject: ${subject.name}, Papers: ${subject.papers.length}`);
                    const categoriesInSubject = subject.papers.map(paper => paper.category);
                    console.log(`Categories in ${subject.name}:`, categoriesInSubject);
                });

                setSemesterData(updatedSemester);
                setLoading(false);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchFiles();
    }, [course, semester]);

    const handleFileClick = (file, subject) => {
        setSelectedFile(file);
    };

    const onBack = () => {
        navigate(`/scsit/${course}/semesters/`);
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black-900 flex items-center justify-center text-white">
                <img src={loadingGif} alt="Loading..." className="h-32 w-32 sm:h-48 sm:w-48 md:h-60 md:w-60" />
            </div>
        );
    }

    if (error || !semesterData) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black-900 flex flex-col p-0">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-b-2xl border-b border-gray-700 pt-16 sm:pt-20"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text pb-4 sm:pb-6">
                        {courseLabel}
                    </h1>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mt-2">
                        Semester {semester}
                    </h2>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex items-center mb-4 sm:mb-6 mt-4 px-4 sm:px-6 md:px-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors mr-6"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Back</span>
                    </motion.button>
                </motion.div>
                <div className="text-center text-gray-300 px-4 sm:px-6 md:px-8 text-sm sm:text-base">
                    {error || "No data available for this semester."}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black-900 flex flex-col p-0">
            <Helmet>
                <title>{`${course?.toUpperCase()} - Semester ${semester} Documents | LastMinute SCSIT`}</title>
                <meta name="description" content={`Explore documents for ${courseLabel} Semester ${semester} at LastMinute SCSIT.`} />
            </Helmet>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-b-2xl border-b border-gray-700 pt-24 sm:pt-20"
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text pb-4 sm:pb-6">
                    {courseLabel}
                </h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mt-2 pb-4">
                    {semesterData.title}
                </h2>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center mb-4 sm:mb-6 mt-4 px-4 sm:px-6 md:px-8"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors mr-6"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Back</span>
                </motion.button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-4 mb-4 sm:mb-6 px-4 sm:px-6 md:px-8"
            >
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base ${selectedCategory === cat.value ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setSelectedCategory(cat.value)}
                    >
                        {cat.label}
                    </button>
                ))}
            </motion.div>

            <div className="space-y-6 sm:space-y-8 w-full px-4 sm:px-6 md:px-8 flex-1 mb-5">
                {semesterData.subjects.length > 0 ? (
                    semesterData.subjects.map((subject, subjectIndex) => {
                        const filteredPapers = subject.papers.filter(paper => paper.category === selectedCategory);
                        return (
                            <motion.div
                                key={subject.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * subjectIndex }}
                                className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700"
                            >
                                <div className="p-4 sm:p-6 border-b border-gray-700">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
                                        {subject.name}
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-300">
                                        {categoryDescriptions[selectedCategory]}
                                    </p>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredPapers.length > 0 ? (
                                            filteredPapers.map((paper, paperIndex) => (
                                                <motion.div
                                                    key={paperIndex}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleFileClick(paper, subject.name)}
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
                                                                {paper.title}
                                                            </h3>

                                                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                <span>{paper.year}</span>
                                                                <span className="text-gray-500">•</span>
                                                                <span className="uppercase">{paper.type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-gray-300 text-center col-span-full text-sm sm:text-base">
                                                No {categories.find(cat => cat.value === selectedCategory)?.label} available for this subject.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-300 text-sm sm:text-base">
                        No subjects available for this semester.
                    </div>
                )}
            </div>
            {selectedFile && <FileViewer file={selectedFile} onClose={handleCloseViewer} />}
        </div>
    );
};

export default DocumentsPage;