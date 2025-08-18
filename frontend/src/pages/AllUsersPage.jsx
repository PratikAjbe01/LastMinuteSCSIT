"use client"

import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"
import { User, Mail, ShieldCheck, X, Loader, AlertCircle, FileX, View, Crown, Ban, CheckCircle, Trash2, Filter, ChevronDown, Search } from "lucide-react"
import { API_URL } from "../utils/urls"
import { useSwipeable } from "react-swipeable"
import { ValuesContext } from "../context/ValuesContext"
import { toast } from "react-hot-toast"

const UsersPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isMakeAdminModalOpen, setIsMakeAdminModalOpen] = useState(false);
    const [isRemoveAdminModalOpen, setIsRemoveAdminModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isUnverifyModalOpen, setIsUnverifyModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

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

        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/auth/fetchallusers`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user._id}`,
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to fetch users.');
                }

                setUsers(result.users);

            } catch (err) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [user, navigate]);

    useEffect(() => {
        let tempUsers = [...users];

        if (filter === 'admin') {
            tempUsers = tempUsers.filter(u => u.isAdmin === 'admin');
        } else if (filter === 'user') {
            tempUsers = tempUsers.filter(u => u.isAdmin !== 'admin');
        } else if (filter === 'verified') {
            tempUsers = tempUsers.filter(u => u.isVerified);
        } else if (filter === 'unverified') {
            tempUsers = tempUsers.filter(u => !u.isVerified);
        }

        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            tempUsers = tempUsers.filter(u =>
                u.name.toLowerCase().includes(lowercasedQuery) ||
                u.email.toLowerCase().includes(lowercasedQuery)
            );
        }

        setFilteredUsers(tempUsers);
    }, [filter, users, searchQuery]);

    const openViewModal = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedUser(null);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    };

    const openMakeAdminModal = (user) => {
        setSelectedUser(user);
        setIsMakeAdminModalOpen(true);
    };

    const closeMakeAdminModal = () => {
        setIsMakeAdminModalOpen(false);
        setSelectedUser(null);
    };

    const openRemoveAdminModal = (user) => {
        setSelectedUser(user);
        setIsRemoveAdminModalOpen(true);
    };

    const closeRemoveAdminModal = () => {
        setIsRemoveAdminModalOpen(false);
        setSelectedUser(null);
    };

    const openVerifyModal = (user) => {
        setSelectedUser(user);
        setIsVerified(user.isVerified);
        setIsVerifyModalOpen(true);
    };

    const closeVerifyModal = () => {
        setIsVerifyModalOpen(false);
        setSelectedUser(null);
    };

    const openUnverifyModal = (user) => {
        setSelectedUser(user);
        setIsUnverifyModalOpen(true);
    };

    const closeUnverifyModal = () => {
        setIsUnverifyModalOpen(false);
        setSelectedUser(null);
    };

    const checkAdminPro = () => {
        if (user?.email !== "pratikajbe40@gmail.com" && user?.email !== "bdhakad886@gmail.com") {
            toast.error('You must be Creator to perform this action.', {
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

    const handleDeleteUser = async (e) => {
        e.preventDefault();
        if (!checkAdminPro()) return;

        setIsSubmitting(true);
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/delete-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user._id}`,
                },
                body: JSON.stringify({
                    userId: selectedUser._id,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to delete user.');
            }

            setUsers(users.filter(u => u._id !== selectedUser._id));
            closeDeleteModal();

        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!checkAdminPro()) return;

        setIsSubmitting(true);
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/update-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user._id}`,
                },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    isAdmin: 'admin',
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to make user admin.');
            }

            setUsers(users.map(u =>
                u._id === selectedUser._id
                    ? { ...u, isAdmin: 'admin' }
                    : u
            ));
            closeMakeAdminModal();

        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveAdmin = async (e) => {
        e.preventDefault();
        if (!checkAdminPro()) return;

        setIsSubmitting(true);
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/update-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user._id}`,
                },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    isAdmin: 'user',
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to remove admin privileges.');
            }

            setUsers(users.map(u =>
                u._id === selectedUser._id
                    ? { ...u, isAdmin: 'user' }
                    : u
            ));
            closeRemoveAdminModal();

        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyUser = async (e) => {
        e.preventDefault();
        if (!checkAdminPro()) return;

        setIsSubmitting(true);
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/update-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user._id}`,
                },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    isVerified: true,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to verify user.');
            }

            setUsers(users.map(u =>
                u._id === selectedUser._id
                    ? { ...u, isVerified: true }
                    : u
            ));
            closeVerifyModal();

        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnverifyUser = async (e) => {
        e.preventDefault();
        if (!checkAdminPro()) return;

        setIsSubmitting(true);
        setModalError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/update-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user._id}`,
                },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    isVerified: false,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to unverify user.');
            }

            setUsers(users.map(u =>
                u._id === selectedUser._id
                    ? { ...u, isVerified: false }
                    : u
            ));
            closeUnverifyModal();

        } catch (err) {
            setModalError(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [])

    const { setIsSidebarOpen } = useContext(ValuesContext);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const isExcludedRoute = typeof window !== 'undefined' &&
        (window.location.pathname.startsWith("/login") || window.location.pathname === "/signup");
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
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

    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.isVerified).length;
    const adminUsers = users.filter(u => u.isAdmin === 'admin').length;
    const regularUsers = users.filter(u => u.isAdmin !== 'admin').length;
    const unverifiedUsers = users.filter(u => !u.isVerified).length;

    const filterStats = [
        { key: 'all', label: 'Total Users', value: totalUsers, gradient: 'from-blue-600 to-blue-800' },
        { key: 'admin', label: 'Admin Users', value: adminUsers, gradient: 'from-amber-600 to-amber-800' },
        { key: 'user', label: 'Regular Users', value: regularUsers, gradient: 'from-purple-600 to-purple-800' },
        { key: 'verified', label: 'Verified', value: verifiedUsers, gradient: 'from-green-600 to-green-800' },
        { key: 'unverified', label: 'Unverified', value: unverifiedUsers, gradient: 'from-red-600 to-red-800' },
    ];

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

            <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center py-28">
                <Helmet>
                    <title>Users Management - SCSIT</title>
                    <meta name="description" content="Manage users and their permissions." />
                </Helmet>

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-8 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 shadow-lg shadow-black/20">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || <User size={32} />}
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                                <p className="text-green-400 flex items-center justify-center md:justify-start gap-2"><Mail size={16} /> {user?.email}</p>
                                {user?.isAdmin === 'admin' && <p className="text-amber-400 flex items-center justify-center md:justify-start gap-2 mt-1 font-semibold"><ShieldCheck size={16} /> Admin Account</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            {filterStats.map(stat => (
                                <div
                                    key={stat.key}
                                    onClick={() => setFilter(stat.key)}
                                    className={`bg-gradient-to-r ${stat.gradient} rounded-2xl p-4 text-white shadow-lg cursor-pointer transition-all duration-300 ${filter === stat.key ? 'ring-2 ring-white scale-105' : 'opacity-90 hover:opacity-100 hover:scale-[1.02]'}`}
                                >
                                    <h3 className="text-sm font-semibold mb-1 truncate">{stat.label}</h3>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center">
                                Users Management
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <div className="relative w-full sm:w-auto">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 pl-11 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
                                    />
                                </div>
                                <div className="relative w-full sm:w-auto">
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="flex w-full items-center justify-between gap-2 bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-xl border border-gray-700 px-4 py-2.5 text-white hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Filter size={18} className="text-gray-400" />
                                            <span className="capitalize truncate">
                                                {filter === 'all' ? 'All Users' : filter.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isFilterOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute z-10 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/80 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                            >
                                                <ul className="p-1">
                                                    {['all', 'admin', 'user', 'verified', 'unverified'].map((item) => (
                                                        <li key={item}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); setFilter(item); setIsFilterOpen(false); }}
                                                                className="block rounded-lg px-4 py-2 text-white hover:bg-green-500/10 transition-colors capitalize"
                                                            >
                                                                {item.replace('_', ' ')}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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
                    ) : filteredUsers?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers?.map((usr, index) => (
                                <motion.div
                                    key={usr._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group bg-gray-800/60 backdrop-filter backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10"
                                >
                                    <div className="p-5 flex-grow">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {usr?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || <User size={24} />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-white truncate">{usr.name}</h3>
                                                <p className="text-gray-400 text-sm truncate">{usr.email}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-gray-300 text-sm">
                                            <p className="flex items-center gap-2">
                                                {usr.isAdmin === 'admin' ? (<Crown size={14} className="text-amber-400 flex-shrink-0" />) : (<User size={14} className="text-blue-400 flex-shrink-0" />)}
                                                Role: <span className="font-semibold capitalize">{usr.isAdmin === 'admin' ? 'Admin' : 'User'}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                {usr.isVerified ? (<CheckCircle size={14} className="text-green-400 flex-shrink-0" />) : (<Ban size={14} className="text-red-400 flex-shrink-0" />)}
                                                Status: <span className="font-semibold">{usr.isVerified ? 'Verified' : 'Not Verified'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900/50 p-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <motion.button onClick={() => openViewModal(usr)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                                                <View size={14} /> View
                                            </motion.button>
                                            {usr.isAdmin !== 'admin' ? (
                                                <motion.button onClick={() => openMakeAdminModal(usr)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
                                                    <Crown size={14} /> Admin
                                                </motion.button>
                                            ) : (
                                                <motion.button onClick={() => openRemoveAdminModal(usr)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                                                    <User size={14} /> Remove
                                                </motion.button>
                                            )}
                                            {usr.isVerified ? (
                                                <motion.button onClick={() => openUnverifyModal(usr)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors">
                                                    <Ban size={14} /> Unverify
                                                </motion.button>
                                            ) : (
                                                <motion.button onClick={() => openVerifyModal(usr)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                                    <CheckCircle size={14} /> Verify
                                                </motion.button>
                                            )}
                                            <motion.button onClick={() => openDeleteModal(usr)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                                                <Trash2 size={14} /> Delete
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700">
                            <div className="mx-auto bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center border border-gray-700">
                                <FileX className="w-12 h-12 text-gray-500" />
                            </div>
                            <h3 className="mt-6 text-2xl font-bold text-white">No Users Found</h3>
                            <p className="mt-2 text-gray-400 max-w-md mx-auto">
                                No users match your current filter and search criteria. Try adjusting your search.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isViewModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
                            <div className="flex justify-between items-center p-6 border-b border-slate-700">
                                <h3 className="text-xl font-bold text-white">User Details</h3>
                                <button onClick={closeViewModal} className="text-gray-400 hover:text-white"><X /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {selectedUser?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || <User size={32} />}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{selectedUser?.name}</h4>
                                        <p className="text-gray-400">{selectedUser?.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                                        <span className="text-gray-300">User ID</span>
                                        <span className="text-white font-mono text-sm truncate max-w-[150px]">{selectedUser?._id}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                                        <span className="text-gray-300">Role</span>
                                        <span className={`font-semibold ${selectedUser?.isAdmin === 'admin' ? 'text-amber-400' : 'text-blue-400'}`}>
                                            {selectedUser?.isAdmin === 'admin' ? 'Administrator' : 'Regular User'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                                        <span className="text-gray-300">Verification Status</span>
                                        <span className={`font-semibold ${selectedUser?.isVerified ? 'text-green-400' : 'text-red-400'}`}>
                                            {selectedUser?.isVerified ? 'Verified' : 'Not Verified'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                                        <span className="text-gray-300">Account Created</span>
                                        <span className="text-white">{new Date(selectedUser?.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <motion.button onClick={closeViewModal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg">
                                        Close
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-8 text-center">
                            <div className="mx-auto bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center"><Trash2 className="w-8 h-8 text-red-500" /></div>
                            <h3 className="text-2xl font-bold text-white mt-4">Delete User?</h3>
                            <p className="text-gray-300 mt-2">Are you sure you want to delete <strong className="text-white">"{selectedUser?.name}"</strong>? This action cannot be undone.</p>
                            {modalError && <p className="text-red-400 text-sm mt-4">{modalError}</p>}
                            <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <motion.button onClick={closeDeleteModal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancel</motion.button>
                                <motion.button onClick={handleDeleteUser} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Delete'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isMakeAdminModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-8 text-center">
                            <form onSubmit={handleUpdateUser}>
                                <div className="mx-auto bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center"><Crown className="w-8 h-8 text-amber-500" /></div>
                                <h3 className="text-2xl font-bold text-white mt-4">Make Admin?</h3>
                                <p className="text-gray-300 mt-2">Are you sure you want to make <strong className="text-white">"{selectedUser?.name}"</strong> an administrator? This will grant them full access to the system.</p>
                                {modalError && <p className="text-red-400 text-sm mt-4">{modalError}</p>}
                                <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <motion.button type="button" onClick={closeMakeAdminModal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancel</motion.button>
                                    <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Make Admin'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isRemoveAdminModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-8 text-center">
                            <form onSubmit={handleRemoveAdmin}>
                                <div className="mx-auto bg-purple-500/10 w-16 h-16 rounded-full flex items-center justify-center"><User className="w-8 h-8 text-purple-500" /></div>
                                <h3 className="text-2xl font-bold text-white mt-4">Remove Admin?</h3>
                                <p className="text-gray-300 mt-2">Are you sure you want to remove admin privileges from <strong className="text-white">"{selectedUser?.name}"</strong>? This will revoke their administrative access.</p>
                                {modalError && <p className="text-red-400 text-sm mt-4">{modalError}</p>}
                                <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <motion.button type="button" onClick={closeRemoveAdminModal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancel</motion.button>
                                    <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Remove Admin'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isVerifyModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-8 text-center">
                            <form onSubmit={handleVerifyUser}>
                                <div className="mx-auto bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center"><CheckCircle className="w-8 h-8 text-blue-500" /></div>
                                <h3 className="text-2xl font-bold text-white mt-4">Verify User?</h3>
                                <p className="text-gray-300 mt-2">Are you sure you want to verify <strong className="text-white">"{selectedUser?.name}"</strong>? This will confirm their account.</p>
                                {modalError && <p className="text-red-400 text-sm mt-4">{modalError}</p>}
                                <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <motion.button type="button" onClick={closeVerifyModal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancel</motion.button>
                                    <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Verify'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isUnverifyModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-8 text-center">
                            <form onSubmit={handleUnverifyUser}>
                                <div className="mx-auto bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center"><Ban className="w-8 h-8 text-orange-500" /></div>
                                <h3 className="text-2xl font-bold text-white mt-4">Unverify User?</h3>
                                <p className="text-gray-300 mt-2">Are you sure you want to unverify <strong className="text-white">"{selectedUser?.name}"</strong>? This will remove their verification status.</p>
                                {modalError && <p className="text-red-400 text-sm mt-4">{modalError}</p>}
                                <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <motion.button type="button" onClick={closeUnverifyModal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancel</motion.button>
                                    <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Unverify'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default UsersPage;