"use client"

import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"
import { User, Mail, FileText, Calendar, Book, Tag, Edit, Trash2, X, Loader, AlertCircle, ShieldCheck, GraduationCap, FileX, View, BookDashed, Filter } from "lucide-react"
import FileViewer from "../fileComponents/FileViewer"
import { API_URL } from "../utils/urls"
import { useSwipeable } from "react-swipeable"
import { ValuesContext } from "../context/ValuesContext"
import { toast } from "react-hot-toast"

const AdminFilesPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [files, setFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [selectedViewFile, setSelectedViewFile] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (!user || user.isAdmin !== 'admin') {
              toast.error('You must be Admin to Access this page.', {
                style: {
                    border: '1px solid #713200',
                    padding: '16px',
                    color: '#713200',
                },
                iconTheme: {
                    primary: '#4ade80',
                    secondary: '#ffffff',
                },
            });
            navigate("/");
            return;
        }

        const fetchFiles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/files/getadminsfiles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user._id}`,
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to fetch files.');
                }

                setFiles(result.data);
                setFilteredFiles(result.data);

            } catch (err) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFiles();
    }, [user, navigate]);

    useEffect(() => {
        let filtered = [...files];
        
        if (filter !== 'all') {
            filtered = files.filter(file => file.uploadedBy === filter);
        }
        
        setFilteredFiles(filtered);
    }, [filter, files]);

    const openEditModal = (file) => {
        setSelectedFile(file);
        setEditFormData({
            name: file.name || '',
            year: file.year || ''
        });
        setModalError('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        if (isSubmitting) return;
        setIsEditModalOpen(false);
        setSelectedFile(null);
        setEditFormData({});
    };

    const openDeleteModal = (file) => {
        setSelectedFile(file);
        setModalError('');
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (isSubmitting) return;
        setIsDeleteModalOpen(false);
        setSelectedFile(null);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const checkAdminPro = () => {
        if (user?.email !== "pratikajbe40@gmail.com" && user?.email !== "bdhakad886@gmail.com") {
            toast.error('You must be AdminPro to perform this action.', {
                style: {
                    border: '1px solid #713200',
                    padding: '16px',
                    color: '#713200',
                },
                iconTheme: {
                    primary: '#4ade80',
                    secondary: '#ffffff',
                },
            });
            return false;
        }
        return true;
    };

    const handleUpdateFile = async (e) => {
        e.preventDefault();
        if (!checkAdminPro()) return;
        
        setIsSubmitting(true);
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/files/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user._id}`,
                },
                body: JSON.stringify({
                    id: selectedFile._id,
                    name: editFormData.name,
                    year: editFormData.year,
                    userId: user._id,
                }),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to update file.');
            }

            setFiles(files.map(f => f._id === selectedFile._id ? result.data : f));
            closeEditModal();

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
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/files/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user._id}`,
                },
                body: JSON.stringify({
                    id: selectedFile._id,
                    userId: user._id,
                }),
            });

            if (response.status === 204) {
                setFiles(files.filter(f => f._id !== selectedFile._id));
                closeDeleteModal();
                return;
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to delete file.');
            }

            setFiles(files.filter(f => f._id !== selectedFile._id));
            closeDeleteModal();

        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseViewer = () => {
        setSelectedViewFile(null);
    };

    const handleFileClick = (file) => {
        setSelectedViewFile(file);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [])

    const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);

    const isExcludedRoute = typeof window !== 'undefined' &&
        (window.location.pathname.startsWith("/login") || window.location.pathname === "/signup");
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (isMobile && !isExcludedRoute) {
                setIsSidebarOpen(true);
            }
        },
        onSwipedRight: () => {
            if (isMobile && !isExcludedRoute && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        },
        preventDefaultTouchmoveEvent: false,
        trackMouse: false,
        delta: 30,
    });

    const totalFiles = files.length;
    const courses = [...new Set(files.map(file => file.course))].filter(Boolean);
    const subjects = [...new Set(files.map(file => file.subject))].filter(Boolean);
    const uploaders = [...new Set(files.map(file => file.uploadedBy))].filter(Boolean);

    return (
        <>
            <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center p-0 pb-8 pt-24">
                <Helmet>
                    <title>All Files - SCSIT</title>
                    <meta name="description" content="Browse all available files." />
                </Helmet>

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-8 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || <User size={32} />}
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                                <p className="text-green-400 flex items-center justify-center md:justify-start gap-2">
                                    <Mail size={16} /> {user?.email}
                                </p>
                                {user?.isAdmin === 'admin' && (
                                    <p className="text-amber-400 flex items-center justify-center md:justify-start gap-2 mt-1 font-semibold">
                                        <ShieldCheck size={16} /> Admin Account
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="text-lg font-semibold mb-2">Total Files</h3>
                                <p className="text-3xl font-bold">{totalFiles}</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="text-lg font-semibold mb-2">Courses</h3>
                                <p className="text-3xl font-bold">{courses.length}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="text-lg font-semibold mb-2">Subjects</h3>
                                <p className="text-3xl font-bold">{subjects.length}</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center">
                                All Available Files
                            </h2>
                            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 px-4 py-2">
                                <Filter size={20} className="text-gray-400" />
                                <select 
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="bg-transparent text-white focus:outline-none cursor-pointer"
                                >
                                    <option value="all" className="bg-gray-800 text-white">All Uploaders</option>
                                    {uploaders.map(uploader => (
                                        <option key={uploader} value={uploader} className="bg-gray-800 text-white">
                                            {uploader}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden flex flex-col h-full"
                                >
                                    <div className="p-5 flex-grow">
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-3 line-clamp-2">
                                            {file.name || 'Untitled File'}
                                        </h3>
                                        <div className="space-y-2 text-gray-300 text-sm">
                                            <p className="flex items-start gap-2">
                                                <BookDashed size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                <span className="truncate">{file.course || 'N/A'}</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <Book size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                <span className="truncate">{file.subject || 'N/A'}</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <GraduationCap size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>{file.course ? `${file.course} - Sem ${file.semester || 'N/A'}` : 'N/A'}</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <Calendar size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>Year: {file.year || 'N/A'}</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <Tag size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                <span className="font-semibold capitalize">
                                                    Category: {file.category || 'N/A'}
                                                </span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <User size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                <span className="font-semibold">
                                                    Uploaded by: {file.uploadedBy || 'N/A'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900/50 p-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <motion.button
                                                onClick={() => handleFileClick(file)}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                            >
                                                <View size={14} /> View
                                            </motion.button>

                                            {user?.isAdmin === 'admin' && (
                                                <>
                                                    <motion.button
                                                        onClick={() => openEditModal(file)}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={14} /> Edit
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => openDeleteModal(file)}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors col-span-2"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </motion.button>
                                                </>
                                            )}
                                        </div>
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
                            <h3 className="mt-6 text-2xl font-bold text-white">No Files Found</h3>
                            <p className="mt-2 text-gray-400 max-w-md mx-auto">
                                {filter === 'all' 
                                    ? 'There are currently no files available. Check back later or upload some files if you\'re an admin.'
                                    : `No files found for uploader "${filter}".`}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
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
                            className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-slate-700">
                                <h3 className="text-xl font-bold text-white">Edit File Details</h3>
                                <button
                                    onClick={closeEditModal}
                                    className="text-gray-400 hover:text-white disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    <X />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateFile} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Paper Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name || ''}
                                        onChange={handleEditFormChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600 text-white focus:border-green-500 focus:ring-green-500 focus:outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                                    <input
                                        type="text"
                                        name="year"
                                        value={editFormData.year || ''}
                                        onChange={handleEditFormChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600 text-white focus:border-green-500 focus:ring-green-500 focus:outline-none transition"
                                    />
                                </div>
                                {modalError && <p className="text-red-400 text-sm">{modalError}</p>}
                                <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                                    <motion.button
                                        type="button"
                                        onClick={closeEditModal}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <Loader className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Update File'
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
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
                                <h3 className="text-2xl font-bold text-white mt-4">Delete File?</h3>
                                <p className="text-gray-300 mt-2">
                                    Are you sure you want to delete <strong className="text-white">"{selectedFile?.name || 'this file'}"</strong>?
                                    This action cannot be undone.
                                </p>
                                {modalError && <p className="text-red-400 text-sm mt-4">{modalError}</p>}
                                <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <motion.button
                                        type="button"
                                        onClick={closeDeleteModal}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <Loader className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Delete'
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
                    onClose={handleCloseViewer}
                    isAllFiles={true}
                />
            )}
        </>
    );
};

export default AdminFilesPage;