import { useState, useMemo, useEffect } from "react";
import { User, Mail, ShieldCheck, BookOpen, GraduationCap, Save, X, RotateCw } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../utils/urls";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-600/50 shadow-2xl shadow-teal-500/10 overflow-hidden w-full max-w-2xl transform transition-all duration-200 scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3"><User /> {title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-gray-700/50" aria-label={`Close ${title} modal`}>
                    <X size={24} />
                </button>
            </div>
            <div className="p-8">{children}</div>
        </div>
    </div>
);

const CustomSelect = ({ options, value, onChange, placeholder, disabled, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(value);

    useEffect(() => {
        setSelectedOption(value);
    }, [value]);

    const handleSelect = (option) => {
        setSelectedOption(option);
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full pl-12 pr-10 py-4 bg-gray-700/90 rounded-xl border ${isOpen ? 'border-teal-500' : 'border-gray-600/50'} text-left text-white placeholder-gray-400 transition-all min-h-[56px] flex items-center ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-teal-500 cursor-pointer'}`}
            >
                <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800/98 border border-gray-600/50 rounded-xl backdrop-blur-lg z-50 max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700/80 hover:text-white transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                            {option.label}
                        </button>
                    ))}
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-gray-400 text-center">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
};

export const EditProfileModal = ({ onClose }) => {
    const { checkAuth, setUser, user } = useAuthStore();
    const [userSemester, setUserSemester] = useState(null);
    const navigate = useNavigate();

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

    useEffect(() => {
        const formatSemester = (semester) => {
            if (!semester) return null;
            const s = String(semester);
            let label = `${s}${s === '1' ? 'st' : s === '2' ? 'nd' : s === '3' ? 'rd' : 'th'} Semester`;

            if (user?.course === 'MCA' && staticSemesterData[semester]?.title) {
                label = staticSemesterData[semester].title;
            }

            return { value: s, label };
        };
        setUserSemester(formatSemester(user?.semester));
    }, [user]);

    const [profileData, setProfileData] = useState({
        username: user?.username || user?.name || '',
        course: user?.course || null,
        semester: user?.semester || null,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user._id, ...profileData }),
            });

            const data = await response.json();
            console.log("Response:", data.user);

            if (data.message === "Profile updated successfully.") {
                checkAuth();
                onClose();
                setUser(data.user);
                toast.success("Profile updated successfully!");
            } else {
                console.error("Error updating profile:", data.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const courseOptions = useMemo(() =>
        Object.keys(subjectsByCourseAndSemester).map(course => ({
            value: course,
            label: course.replace(/_/g, ' ')
        })),
        []
    );

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

    const handleSemesterChange = (selectedOption) => {
        setProfileData({
            ...profileData,
            semester: selectedOption ? selectedOption.value : null
        });
    };

    const currentCourse = courseOptions.find(c => c.value === profileData.course) || courseOptions.find(c => c.value === user?.course?.toUpperCase());
    const currentSemester = semesterOptions.find(s => s.value === profileData.semester) || userSemester;

    const [loadLoading, setLoadLoading] = useState(false);

    const handleProfileLoad = async () => {
        setLoadLoading(true);
          try {
            const response = await axios.get(`${API_URL}/api/auth/fetchuser/${user._id}`);
            console.log("Fetched user:", response.data.user);
            if (response?.data?.user) {
                localStorage.setItem("user", JSON.stringify(response.data.user));
                setUser(response.data.user);
            }
            setLoadLoading(false);
        } catch (error) {
           console.log(error);
        }finally{
            setLoadLoading(false);
        }
    }

    return (
        <Modal title="Edit Profile" onClose={onClose}>
            <div className="space-y-8">
                <div className="space-y-6 opacity-100">
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full justify-between">
                        <div className="w-full opacity-100">
                            <label htmlFor="course" className="text-sm font-semibold text-gray-300 mb-2 block">Course</label>
                            <CustomSelect
                                options={courseOptions}
                                value={currentCourse}
                                onChange={handleCourseChange}
                                placeholder="Select your course..."
                                icon={BookOpen}
                            />
                        </div>
                        <div className="w-full opacity-100">
                            <label htmlFor="semester" className="text-sm font-semibold text-gray-300 mb-2 block">Semester</label>
                            <CustomSelect
                                options={semesterOptions}
                                value={currentSemester}
                                onChange={handleSemesterChange}
                                placeholder={!profileData.course ? "Select a course first" : "Select your semester..."}
                                disabled={!profileData.course}
                                icon={GraduationCap}
                            />
                        </div>
                    </div>
                    <div className="opacity-100">
                        <label htmlFor="username" className="text-sm font-semibold text-gray-300 mb-2 block">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                id="username"
                                type="text"
                                value={profileData.username}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-4">
                        <Mail size={20} className="text-teal-400" />
                        <span className="font-medium text-gray-200">{user?.email}</span>
                    </div>
                    {user?.isAdmin && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-semibold border border-green-500/20">
                            <ShieldCheck size={16} />
                            <span>{user?.isAdmin || "User"}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-700/50">
                  <button
                            onClick={() => {
                                handleProfileLoad();
                            }}
                            className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loadLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Loading new profile...
                            </>
                        ) : (
                            <>
                                New Changes <RotateCw size={18} />
                            </>
                        )}
                        </button>
                    {!user?.isVerified && (
                        <button
                            onClick={() => {
                                navigate('/verify-user-email');
                                onClose();
                            }}
                            className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Verify Email
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-3 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 text-center"
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
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default function App() {
    const [showModal, setShowModal] = useState(true);

    const mockUser = {
        username: "John Doe",
        name: "John Doe",
        email: "john.doe@example.com",
        course: "BCA",
        semester: "3",
        isAdmin: true
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            {showModal && (
                <EditProfileModal
                    user={mockUser}
                    onClose={() => setShowModal(false)}
                />
            )}
            {!showModal && (
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition-all"
                >
                    Show Edit Profile Modal
                </button>
            )}
        </div>
    );
}
