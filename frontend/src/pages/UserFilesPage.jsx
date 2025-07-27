"use client"

import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"
import { User, Mail, FileText, Calendar, Book, Tag, Edit, Trash2, X, Loader, AlertCircle, ShieldCheck, GraduationCap, FileX, Upload, View, BookDashed } from "lucide-react"
import FileViewer from "../fileComponents/FileViewer"
import { API_URL } from "../utils/urls"
import { useSwipeable } from "react-swipeable"
import { ValuesContext } from "../context/ValuesContext"

const MyFilesPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [selectedViewFile, setSelectedViewFile] = useState(null);

    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate("/");
            return;
        }

        const fetchFiles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/files/adminfiles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ userId: user._id }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to fetch files.');
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
        setEditFormData({ name: file.name, year: file.year });
        setModalError('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        if (isSubmitting) return;
        setIsEditModalOpen(false);
        setSelectedFile(null);
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

    const handleUpdateFile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/files/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
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

    const handleDeleteFile = async () => {
        setIsSubmitting(true);
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/files/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
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

     const handleFileClick = (file, subject) => {
        setSelectedViewFile(file);
    };

     useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

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
        <>
            <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center p-0 pb-8 pt-24">
                <Helmet>
                    <title>My Uploaded Files - SCSIT</title>
                    <meta name="description" content="Manage your uploaded files." />
                </Helmet>

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-8 flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || <User size={32} />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                                <p className="text-green-400 flex items-center gap-2"><Mail size={16} /> {user?.email}</p>
                                {user?.isAdmin && <p className="text-amber-400 flex items-center gap-2 mt-1 font-semibold"><ShieldCheck size={16} /> Admin Account</p>}
                            </div>
                        </div>
                        <h2 className="text-4xl font-extrabold text-white text-center mb-10">Your Uploaded Files</h2>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-12 h-12 text-green-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg flex items-center justify-center gap-2">
                             <AlertCircle /> {error}
                        </div>
                    ) : files.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {files.map((file, index) => (
                                <motion.div
                                    key={file._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden flex flex-col"
                                >
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
                                    <div className="bg-gray-900/50 p-4 flex justify-end space-x-3">
                                      <motion.button onClick={() => handleFileClick(file)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                                            <View size={14} /> View
                                        </motion.button>
                                        <motion.button onClick={() => openEditModal(file)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                                            <Edit size={14} /> Edit
                                        </motion.button>
                                        <motion.button onClick={() => openDeleteModal(file)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
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
                            <h3 className="mt-6 text-2xl font-bold text-white">No Files Found</h3>
                            <p className="mt-2 text-gray-400 max-w-md mx-auto">It looks like you haven't uploaded any files yet. Click the button below to start contributing.</p>
                            <motion.button
                                onClick={() => navigate('/upload')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                            >
                                <Upload size={18} />
                                Upload Your First File
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
                            <div className="flex justify-between items-center p-6 border-b border-slate-700">
                                <h3 className="text-xl font-bold text-white">Edit File Details</h3>
                                <button onClick={closeEditModal} className="text-gray-400 hover:text-white disabled:opacity-50" disabled={isSubmitting}><X /></button>
                            </div>
                            <form onSubmit={handleUpdateFile} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Paper Name</label>
                                    <input type="text" name="name" value={editFormData.name || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600 text-white focus:border-green-500 focus:ring-green-500 transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                                    <input type="text" name="year" value={editFormData.year || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600 text-white focus:border-green-500 focus:ring-green-500 transition" />
                                </div>
                                {modalError && <p className="text-red-400 text-sm">{modalError}</p>}
                                <div className="pt-4 flex justify-end space-x-3">
                                    <motion.button type="button" onClick={closeEditModal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isSubmitting} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Cancel</motion.button>
                                    <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isSubmitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center w-32 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Update File'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-8 text-center">
                            <div className="mx-auto bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-4">Delete File?</h3>
                            <p className="text-gray-300 mt-2">Are you sure you want to delete <strong className="text-white">"{selectedFile?.name}"</strong>? This action cannot be undone.</p>
                            {modalError && <p className="text-red-400 text-sm mt-4">{modalError}</p>}
                            <div className="mt-6 flex justify-center space-x-4">
                                <motion.button onClick={closeDeleteModal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isSubmitting} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Cancel</motion.button>
                                <motion.button onClick={handleDeleteFile} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isSubmitting} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center w-32 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Delete'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {selectedViewFile && <FileViewer file={selectedViewFile} onClose={handleCloseViewer} isAllFiles={true}/>}
        </>
    );
};

export default MyFilesPage;