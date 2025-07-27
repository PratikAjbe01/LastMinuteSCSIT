import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { User, Mail, ShieldCheck, BookOpen, GraduationCap, Save, X } from "lucide-react";
import { API_URL } from "../utils/urls";
import { useAuthStore } from "../store/authStore";

const Modal = ({ children, onClose, title }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-600/50 shadow-2xl shadow-teal-500/10 overflow-hidden w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3"><User /> {title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-gray-700/50" aria-label={`Close ${title} modal`}>
                    <X size={24} />
                </button>
            </div>
            <div className="p-8">{children}</div>
        </motion.div>
    </motion.div>
);

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "rgba(31, 41, 55, 0.9)",
        borderColor: state.isFocused ? "#14B8A6" : "#4B5563",
        color: "#E5E7EB",
        borderRadius: "1rem",
        padding: "0.5rem",
        paddingLeft: "2.5rem",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(20, 184, 166, 0.1)" : "none",
        "&:hover": { borderColor: "#14B8A6" },
        transition: "all 0.2s ease",
        minHeight: "56px",
        cursor: state.isDisabled ? 'not-allowed' : 'default',
        opacity: state.isDisabled ? 0.6 : 1,
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "rgba(31, 41, 55, 0.98)",
        borderRadius: "1rem",
        border: "1px solid #4B5563",
        backdropFilter: "blur(16px)",
        zIndex: 50,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "#14B8A6" : state.isFocused ? "rgba(55, 65, 81, 0.8)" : "transparent",
        color: state.isSelected ? "#FFFFFF" : "#E5E7EB",
        "&:hover": { backgroundColor: "rgba(55, 65, 81, 0.8)", color: "#FFFFFF" },
    }),
    singleValue: (provided) => ({ ...provided, color: "#E5E7EB" }),
    placeholder: (provided) => ({ ...provided, color: "#9CA3AF" }),
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export const EditProfileModal = ({ user, onClose, onSave }) => {
    const { checkAuth } = useAuthStore();
    const staticSemesterData = {
        1: { title: "1st Semester" },
        2: { title: "2nd Semester" },
        3: { title: "3rd Semester" },
        4: { title: "4th Semester" },
    };

    const subjectsByCourseAndSemester = {
        "BCA": { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
        "MCA": staticSemesterData,
        "BCA_INT": { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [] },
        "MSC_INT_CS": { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [] },
        "MTECH_CS": { "1": [], "2": [], "3": [], "4": [] },
        "MTECH_CS_EXEC": { "1": [], "2": [], "3": [], "4": [] },
        "MTECH_NM_IS": { "1": [], "2": [], "3": [], "4": [] },
        "MTECH_IA_SE": { "1": [], "2": [], "3": [], "4": [] },
        "PHD": { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
        "MSC_CS": { "1": [], "2": [], "3": [], "4": [] },
        "MSC_IT": { "1": [], "2": [], "3": [], "4": [] },
        "MBA_CM": { "1": [], "2": [], "3": [], "4": [] },
        "PGDCA": { "1": [], "2": [] },
    };

    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        course: user?.course || null,
        semester: user?.semester || null,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user._id,
                    ...profileData,
                }),
            });

            const data = await response.json();

            if (data.success) {
                checkAuth();
            } else {
                console.error("Error updating profile:", data.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

    const courseOptions = useMemo(() =>
        Object.keys(subjectsByCourseAndSemester).map(course => ({
            value: course,
            label: course.replace(/_/g, ' ')
        })),
        []);

    const semesterOptions = useMemo(() => {
        if (!profileData.course) return [];

        const courseData = subjectsByCourseAndSemester[profileData.course];
        if (!courseData) return [];

        return Object.keys(courseData).map(sem => {
            let label = `${sem}${sem === '1' ? 'st' : sem === '2' ? 'nd' : sem === '3' ? 'rd' : 'th'} Semester`;
            if (profileData.course === 'MCA' && courseData[sem]?.title) {
                label = courseData[sem].title;
            }
            return { value: sem, label };
        });
    }, [profileData.course]);

    const handleCourseChange = (selectedOption) => {
        setProfileData({
            ...profileData,
            course: selectedOption ? selectedOption.value : null,
            semester: null,
        });
    };

    return (
        <Modal title="Edit Profile" onClose={onClose}>
            <div className="space-y-8">

                <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">

                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full justify-between">
                        <motion.div variants={itemVariants}>
                            <label htmlFor="course" className="text-sm font-semibold text-gray-300 mb-2 block">Course</label>
                            <div className="relative w-full min-w-full">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                                <Select
                                    id="course"
                                    styles={customSelectStyles}
                                    options={courseOptions}
                                    value={courseOptions.find(c => c.value === profileData.course) || user?.course ? { value: user.course, label: user.course.replace(/_/g, ' ') } : null}
                                    onChange={handleCourseChange}
                                    placeholder="Select your course..."
                                    isClearable
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label htmlFor="semester" className="text-sm font-semibold text-gray-300 mb-2 block">Semester</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                                <Select
                                    id="semester"
                                    styles={customSelectStyles}
                                    options={semesterOptions}
                                    value={semesterOptions.find(s => s.value === profileData.semester) || user?.semester ? { value: user.semester, label: user.semester } : null}
                                    onChange={(option) => setProfileData({ ...profileData, semester: option ? option.value : null })}
                                    placeholder={!profileData.course ? "Select a course first" : "Select your semester..."}
                                    isDisabled={!profileData.course}
                                    isClearable
                                />
                            </div>
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants}>
                        <label htmlFor="username" className="text-sm font-semibold text-gray-300 mb-2 block">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                id="username"
                                type="text"
                                value={profileData.username || user?.name}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </motion.div>

                </motion.div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <Mail size={20} className="text-teal-400" />
                        <span className="font-medium text-gray-200">{user?.email}</span>
                    </div>
                    {user?.isAdmin && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-semibold border border-green-500/20">
                            <ShieldCheck size={16} />
                            <span>Admin</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-700/50">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-all duration-200"
                    >
                        Cancel
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </Modal>
    );
};