"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
    Loader,
    AlertCircle,
    Search,
    Crown,
    Medal,
    Trophy,
    Users,
    FileText,
    TrendingUp,
    Clock,
    Award,
    Filter,
    ChevronDown,
    BarChart,
    UserCheck,
    LineChart,
    X,
    Eye,
    Calendar,
    User,
    Image,
} from "lucide-react";
import { API_URL } from "../utils/urls";
import FileViewer from "../fileComponents/FileViewer";
import { Navigate } from "react-router-dom";

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

const Highlight = ({ text = "", highlight = "" }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(
        `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
    );
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark
                        key={i}
                        className="bg-yellow-500/50 text-white rounded-sm px-0.5"
                    >
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                ),
            )}
        </span>
    );
};

const CustomSelect = ({ options, value, onChange, icon: Icon, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef();
    useOnClickOutside(ref, () => setIsOpen(false));
    const selectedLabel =
        options.find((opt) => opt.value === value)?.label || "Select...";

    return (
        <div className="relative w-full md:w-52" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex w-full items-center justify-between gap-2 bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-xl border px-4 py-3 text-white hover:border-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200 ${name === 'viewMode' ? 'border-green-400' : 'border-gray-700'}`}
            >
                <div className="flex items-center gap-3 truncate">
                    {Icon && <Icon size={18} className="text-gray-400" />}
                    <span className="truncate">{selectedLabel}</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-30 mt-2 w-full origin-top-right rounded-xl border border-gray-700 bg-gray-900/80 shadow-lg backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                        <ul className="p-1">
                            {options.map((option) => (
                                <li key={option.value}>
                                    <button
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left block rounded-lg px-4 py-2 text-white hover:bg-yellow-500/10 transition-colors"
                                    >
                                        {option.label}
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

const ToggleSwitch = ({ enabled, setEnabled, label }) => (
    <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">{label}</span>
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${enabled ? "bg-yellow-500" : "bg-gray-600"}`}
        >
            <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`}
            />
        </button>
    </div>
);

const ContributionChart = ({ userId }) => {
    const [stats, setStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${API_URL}/api/files/leaderboard/user-stats/${userId}`,
                    { credentials: "include" },
                );
                if (!response.ok) throw new Error("Failed to fetch user stats");
                const result = await response.json();
                if (!result.success) throw new Error(result.message);
                setStats(result.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [userId]);

    const maxUploads = useMemo(
        () => (stats.length > 0 ? Math.max(...stats.map((s) => s.count)) : 0),
        [stats],
    );

    return (
        <div className="bg-gray-800/50 p-4 rounded-b-xl border-t border-gray-700">
            {isLoading && (
                <div className="h-40 flex items-center justify-center">
                    <Loader className="animate-spin text-gray-400" />
                </div>
            )}
            {error && (
                <div className="h-40 flex items-center justify-center text-red-400">
                    <AlertCircle className="mr-2" />
                    {error}
                </div>
            )}
            {!isLoading && !error && (
                <div>
                    <h4 className="text-sm font-bold text-white mb-3">
                        Contribution History (Last 12 Months)
                    </h4>
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2 h-32 items-end">
                        {stats.length > 0 ? (
                            stats.map((month) => (
                                <div
                                    key={month.month}
                                    className="group relative flex flex-col items-center justify-end"
                                >
                                    <div className="absolute -top-7 hidden group-hover:block bg-gray-900 text-white px-2 py-1 text-xs rounded-md shadow-lg">
                                        {month.count}
                                    </div>
                                    <div
                                        className="w-full bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t-sm hover:opacity-100 opacity-80 transition-all"
                                        style={{
                                            height:
                                                maxUploads > 0
                                                    ? `${(month.count / maxUploads) * 100}%`
                                                    : "0%",
                                        }}
                                    ></div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {month.month.slice(0, 3)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-12 text-center text-gray-500">
                                No recent contribution data found.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const FileLeaderboard = () => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchFiles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/files/allfilesbyviews`, {
                    credentials: "include",
                });
                if (!response.ok) throw new Error("Failed to fetch files");
                const result = await response.json();
                if (!result.success) throw new Error(result.message);
                setFiles(result.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiles();
    }, []);

    const filteredFiles = useMemo(() => {
        if (!searchTerm.trim()) return files;
        const term = searchTerm.toLowerCase().trim();
        return files.filter(file => {
            if (!file) return false;
            const fileName = (file.name || file.title || '').toLowerCase();
            return fileName.includes(term);
        });
    }, [files, searchTerm]);

    const getFileIcon = (type) => {
        switch (type) {
            case "document":
                return <FileText className="w-5 h-5 text-blue-400" />;
            case "video":
                return <FileText className="w-5 h-5 text-red-400" />;
            case "image":
                return <Image className="w-5 h-5 text-green-400" />;
            default:
                return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatViews = (views) => {
        if (!views) return 0;
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`;
        }
        if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`;
        }
        return views;
    };

    const topThree = filteredFiles.slice(0, 3);
    const restOfFiles = filteredFiles.slice(3);

    const [selectedFile, setSelectedFile] = useState(null);

    const handleViewFile = (file) => {
        setSelectedFile(file);
        window.open(`/share/file/${file._id}`, '_blank');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-12 h-12 text-yellow-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg flex items-center justify-center gap-2">
                <AlertCircle /> {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {topThree.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {topThree.map((file, index) => {
                        const rankStyles = {
                            0: {
                                icon: Crown,
                                color: "text-yellow-400",
                                ring: "ring-yellow-400",
                                bg: "bg-yellow-500/10",
                                glow: "shadow-[0_0_20px_rgba(250,204,21,0.5)]",
                                label: "1st Place",
                            },
                            1: {
                                icon: Medal,
                                color: "text-gray-300",
                                ring: "ring-gray-300",
                                bg: "bg-gray-400/10",
                                glow: "hover:shadow-[0_0_20px_rgba(209,213,219,0.2)]",
                                label: "2nd Place",
                            },
                            2: {
                                icon: Award,
                                color: "text-amber-500",
                                ring: "ring-amber-500",
                                bg: "bg-amber-600/10",
                                glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                                label: "3rd Place",
                            },
                        };
                        const style = rankStyles[index];
                        const IconComponent = style.icon;

                        return (
                            <motion.div
                                key={file._id}
                                layout
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`relative p-4 bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700 ring-2 ${style.ring} ${style.bg} ${style.glow} transition-all duration-300 cursor-pointer`}
                                onClick={() => window.open(`/share/file/${file._id}`, '_blank')}
                            >
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border-2 border-gray-600">
                                        <IconComponent className={`w-8 h-8 ${style.color}`} />
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getFileIcon(file.type)}
                                        <h3 className="font-bold text-white truncate">
                                            {file.name}
                                        </h3>
                                    </div>
                                    <p className="text-gray-400 text-sm truncate">
                                        {file.subject || "No Subject"}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex items-center gap-1 rounded-2xl p-3 px-4 ${style.bg} bg-opacity-25`} onClick={() => handleViewFile(file)}>
                                            <span className="font-bold">View</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye size={14} />
                                            <span className="font-bold">{formatViews(file.views) || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User size={14} />
                                            <span>{file.uploadedBy?.name || "Unknown"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs font-bold text-center text-yellow-400 uppercase tracking-wider">
                                    {style.label}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {restOfFiles.length > 0 && (
                <div className="space-y-4">
                    {restOfFiles.map((file, index) => (
                        <motion.div
                            key={file._id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700 transition-all duration-300 hover:border-yellow-500/50 hover:bg-gray-800 p-4 cursor-pointer"
                            onClick={() => window.open(`/share/file/${file._id}`, '_blank')}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-2xl font-bold text-gray-400 w-12 text-center">
                                    #{index + 4}
                                </div>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {getFileIcon(file.type)}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-white truncate">
                                            {file.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm truncate">
                                            {file.subject || "No Subject"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-white">
                                            <Eye size={16} />
                                            <span className="font-bold">{formatViews(file.views) || 0}</span>
                                        </div>
                                        <div className="text-xs text-gray-400">Views</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-white">
                                            <User size={16} />
                                            <span className="font-bold">{file.uploadedBy?.name || "Unknown"}</span>
                                        </div>
                                        <div className="text-xs text-gray-400">Uploader</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-white">
                                            <Calendar size={16} />
                                            <span className="font-bold">
                                                {new Date(file.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400">Uploaded</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {filteredFiles.length === 0 && searchTerm.trim() && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700"
                >
                    <div className="mx-auto bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center border border-gray-700">
                        <FileText className="w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-white">
                        No Files Found
                    </h3>
                    <p className="mt-2 text-gray-400">
                        No files match your search for "{searchTerm}".
                    </p>
                    <button
                        onClick={() => setSearchTerm("")}
                        className="mt-6 px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all"
                    >
                        Clear Search
                    </button>
                </motion.div>
            )}
        </div>
    );
};

const LeaderboardPage = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("uploads_desc");
    const [timeFilter, setTimeFilter] = useState("all");
    const [expandedUser, setExpandedUser] = useState(null);
    const [includeCreators, setIncludeCreators] = useState(false);
    const [viewMode, setViewMode] = useState("users"); // "users" or "files"

    const currentUserId = "6895f86fbe0be24cfae5f5b1";
    const creatorEmails = useMemo(
        () => new Set(["bdhakad886@gmail.com", "pratikajbe40@gmail.com"]),
        [],
    );

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (viewMode === "users") {
            const fetchLeaderboard = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await fetch(
                        `${API_URL}/api/files/leaderboard?timeFilter=${timeFilter}`,
                        { credentials: "include" },
                    );
                    if (!response.ok)
                        throw new Error(`HTTP error! status: ${response.status}`);
                    const result = await response.json();
                    if (!result.success)
                        throw new Error(
                            result.message || "Failed to fetch leaderboard data.",
                        );
                    setLeaderboardData(result.data);
                } catch (err) {
                    setError(err.message || "An unexpected error occurred.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchLeaderboard();
        }
    }, [timeFilter, viewMode]);

    const baseData = useMemo(() => {
        if (includeCreators) {
            return leaderboardData;
        }
        return leaderboardData.filter(
            (entry) => !creatorEmails.has(entry.user?.email),
        );
    }, [leaderboardData, includeCreators, creatorEmails]);

    const sortedLeaderboard = useMemo(() => {
        let dataToSort = [...baseData];
        if (sortBy !== "uploads_desc") {
            switch (sortBy) {
                case "uploads_asc":
                    dataToSort.sort((a, b) => a.uploadCount - b.uploadCount);
                    break;
                case "name_asc":
                    dataToSort.sort((a, b) =>
                        (a.user?.name ?? "").localeCompare(b.user?.name ?? ""),
                    );
                    break;
                case "name_desc":
                    dataToSort.sort((a, b) =>
                        (b.user?.name ?? "").localeCompare(a.user?.name ?? ""),
                    );
                    break;
                case "recent":
                    dataToSort.sort(
                        (a, b) => new Date(b.lastUpload) - new Date(a.lastUpload),
                    );
                    break;
                case "oldest":
                    dataToSort.sort(
                        (a, b) => new Date(a.firstUpload) - new Date(b.firstUpload),
                    );
                    break;
                default:
                    break;
            }
        }
        return dataToSort.map((user, index) => ({ ...user, rank: index + 1 }));
    }, [baseData, sortBy]);

    const filteredLeaderboard = useMemo(() => {
        if (!searchTerm.trim()) return sortedLeaderboard;
        return sortedLeaderboard.filter(
            (entry) =>
                entry.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.user?.email.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [sortedLeaderboard, searchTerm]);

    const myRank = useMemo(() => {
        return sortedLeaderboard.find((entry) => entry.userId === currentUserId);
    }, [sortedLeaderboard, currentUserId]);

    const stats = useMemo(() => {
        const data = baseData;
        const totalUploaders = data.length;
        const totalUploads = data.reduce(
            (sum, entry) => sum + entry.uploadCount,
            0,
        );
        return {
            totalUploaders,
            totalUploads,
            topUploaderCount: data[0]?.uploadCount || 0,
            avgUploads:
                totalUploaders > 0 ? (totalUploads / totalUploaders).toFixed(1) : 0,
        };
    }, [baseData]);

    const formatTimeAgo = (date) => {
        if (!date) return "N/A";
        const now = new Date();
        const diffSeconds = Math.round((now - new Date(date)) / 1000);
        const diffMinutes = Math.round(diffSeconds / 60);
        const diffHours = Math.round(diffMinutes / 60);
        const diffDays = Math.round(diffHours / 24);
        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        if (diffHours > 0)
            return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        if (diffMinutes > 0)
            return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
        return "Just now";
    };

    const timeFilterOptions = [
        { value: "all", label: "All Time" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
        { value: "year", label: "This Year" },
    ];
    const sortByOptions = [
        { value: "uploads_desc", label: "Most Uploads" },
        { value: "uploads_asc", label: "Least Uploads" },
        { value: "name_asc", label: "Name (A-Z)" },
        { value: "name_desc", label: "Name (Z-A)" },
        { value: "recent", label: "Recently Active" },
        { value: "oldest", label: "Longest Active" },
    ];
    const viewModeOptions = [
        { value: "users", label: "Top Users" },
        { value: "files", label: "Top Files" },
    ];

    const topThree = filteredLeaderboard.slice(0, 3);
    const restOfLeaderboard = filteredLeaderboard.slice(3);

    const PodiumCard = ({ entry }) => {
        const { rank, user, uploadCount } = entry;
        const rankStyles = {
            1: {
                icon: Crown,
                color: "text-yellow-400",
                ring: "ring-yellow-400",
                bg: "bg-yellow-500/10",
                glow: "shadow-[0_0_20px_rgba(250,204,21,0.5)]",
                order: "md:order-2",
                transform: "md:-translate-y-8",
                label: "1st Place",
            },
            2: {
                icon: Medal,
                color: "text-gray-300",
                ring: "ring-gray-300",
                bg: "bg-gray-400/10",
                glow: "hover:shadow-[0_0_20px_rgba(209,213,219,0.2)]",
                order: "md:order-1",
                label: "2nd Place",
            },
            3: {
                icon: Award,
                color: "text-amber-500",
                ring: "ring-amber-500",
                bg: "bg-amber-600/10",
                glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                order: "md:order-3",
                label: "3rd Place",
            },
        };
        const style = rankStyles[rank];
        if (!style) return null;
        const IconComponent = style.icon;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (rank || 0) * 0.1 }}
                className={`w-full flex flex-col items-center p-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 ring-2 ring-transparent transition-all duration-300 cursor-pointer ${style.order} ${style.transform} ${style.glow}`}
                onClick={() => alert(`Maps to profile of ${user?.name}`)}
            >
                <div
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center ${style.bg} ring-4 ${style.ring}`}
                >
                    <IconComponent className={`w-12 h-12 ${style.color}`} />
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white font-bold text-lg w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-600">
                        {rank}
                    </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white truncate w-full text-center">
                    {user?.name ?? "Unknown User"}
                </h3>
                <p className="text-gray-400 text-sm truncate w-full text-center">
                    {user?.email ?? "No email"}
                </p>
                <div className="mt-4 text-center">
                    <p className={`text-4xl font-bold ${style.color}`}>
                        {uploadCount ?? 0}
                    </p>
                    <p className="text-gray-400 text-sm">Uploads</p>
                </div>
                <div
                    className={`mt-3 text-xs font-bold ${style.color} uppercase tracking-wider`}
                >
                    {style.label}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen w-full bg-gray-900 text-white p-0 pb-32 pt-24">
            <Helmet>
                <title>Leaderboard - SCSIT</title>
                <meta
                    name="description"
                    content="View the top contributors and upload leaders on the platform."
                />
            </Helmet>

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 opacity-50 -z-10 mb-5 sm:mb-10"></div>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
                            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-gray-900" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                            Leaderboard
                        </h1>
                    </div>
                    <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-3xl mx-auto px-4">
                        Recognizing our top contributors and most viewed files.
                    </p>
                </motion.div>

                <div className="relative z-10 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 mb-10 p-4 flex flex-col md:flex-row items-center gap-4 flex-wrap">
                    <CustomSelect
                        options={viewModeOptions}
                        value={viewMode}
                        onChange={setViewMode}
                        icon={Trophy}
                        name="viewMode"
                    />

                    <div className="relative flex-1 w-full min-w-[200px]" style={{ display: viewMode === "users" ? "block" : "none" }}>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={
                                viewMode === "users"
                                    ? "Search contributors..."
                                    : "Search files..."
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700/70 border border-gray-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500 transition"
                        />
                    </div>

                    {viewMode === "users" && (
                        <>
                            <CustomSelect
                                options={timeFilterOptions}
                                value={timeFilter}
                                onChange={setTimeFilter}
                                icon={Filter}
                            />
                            <CustomSelect
                                options={sortByOptions}
                                value={sortBy}
                                onChange={setSortBy}
                                icon={TrendingUp}
                            />
                            <ToggleSwitch
                                enabled={includeCreators}
                                setEnabled={setIncludeCreators}
                                label="Include Creators"
                            />
                        </>
                    )}
                </div>

                {viewMode === "users" ? (
                    <>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader className="w-12 h-12 text-yellow-400 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg flex items-center justify-center gap-2">
                                <AlertCircle /> {error}
                            </div>
                        ) : (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 mb-10 p-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-blue-600/10 p-5 rounded-xl border border-blue-700/30 flex items-center gap-4">
                                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                                <Users className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Total Contributors</p>
                                                <p className="text-3xl font-bold text-white">
                                                    {stats.totalUploaders}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-green-600/10 p-5 rounded-xl border border-green-700/30 flex items-center gap-4">
                                            <div className="bg-green-500/20 p-3 rounded-lg">
                                                <FileText className="w-8 h-8 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Total Uploads</p>
                                                <p className="text-3xl font-bold text-white">
                                                    {stats.totalUploads}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-yellow-600/10 p-5 rounded-xl border border-yellow-700/30 flex items-center gap-4">
                                            <div className="bg-yellow-500/20 p-3 rounded-lg">
                                                <TrendingUp className="w-8 h-8 text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Top Contributor</p>
                                                <p className="text-3xl font-bold text-white">
                                                    {stats.topUploaderCount} uploads
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-purple-600/10 p-5 rounded-xl border border-purple-700/30 flex items-center gap-4">
                                            <div className="bg-purple-500/20 p-3 rounded-lg">
                                                <BarChart className="w-8 h-8 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Average Uploads</p>
                                                <p className="text-3xl font-bold text-white">
                                                    {stats.avgUploads}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <AnimatePresence>
                                    {filteredLeaderboard.length > 0 ? (
                                        <div className="space-y-12">
                                            {topThree.length > 0 && (
                                                <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8 mt-8">
                                                    {topThree.map((entry) => (
                                                        <PodiumCard key={entry.userId} entry={entry} />
                                                    ))}
                                                </div>
                                            )}
                                            {restOfLeaderboard.length > 0 && (
                                                <hr className="border-gray-700 my-12" />
                                            )}
                                            <motion.div layout className="space-y-2">
                                                {restOfLeaderboard.map((entry) => (
                                                    <motion.div
                                                        layout
                                                        key={entry.userId}
                                                        className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700 transition-all duration-300 hover:border-yellow-500/50 hover:bg-gray-800"
                                                    >
                                                        <div
                                                            className="p-4 grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 cursor-pointer"
                                                            onClick={() =>
                                                                alert(`Maps to profile of ${entry.user?.name}`)
                                                            }
                                                        >
                                                            <div className="text-xl font-bold text-gray-400 w-10 text-center">
                                                                {entry.rank}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-white">
                                                                    <Highlight
                                                                        text={entry.user?.name}
                                                                        highlight={searchTerm}
                                                                    />
                                                                </h3>
                                                                <p className="text-gray-400 text-sm">
                                                                    <Highlight
                                                                        text={entry.user?.email}
                                                                        highlight={searchTerm}
                                                                    />
                                                                </p>
                                                                <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                                                                    <div
                                                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1 rounded-full"
                                                                        style={{
                                                                            width: `${(entry.uploadCount / stats.topUploaderCount) * 100}%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xl font-bold text-white">
                                                                    {entry.uploadCount}
                                                                </p>
                                                                <p className="text-sm text-gray-400">Uploads</p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedUser(
                                                                        expandedUser === entry.userId
                                                                            ? null
                                                                            : entry.userId,
                                                                    );
                                                                }}
                                                                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                                                            >
                                                                {expandedUser === entry.userId ? (
                                                                    <X size={20} />
                                                                ) : (
                                                                    <LineChart size={20} />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <AnimatePresence>
                                                            {expandedUser === entry.userId && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                >
                                                                    <ContributionChart userId={entry.userId} />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700"
                                        >
                                            <div className="mx-auto bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center border border-gray-700">
                                                <Users className="w-12 h-12 text-gray-500" />
                                            </div>
                                            <h3 className="mt-6 text-2xl font-bold text-white">
                                                No Contributors Found
                                            </h3>
                                            <p className="mt-2 text-gray-400">
                                                No contributors match your current search or filter
                                                criteria.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setSearchTerm("");
                                                    setSortBy("uploads_desc");
                                                    setTimeFilter("all");
                                                }}
                                                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all"
                                            >
                                                Reset Filters
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </>
                ) : (
                    <FileLeaderboard />
                )}
            </div>

            <AnimatePresence>
                {myRank && !isLoading && viewMode === "users" && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        transition={{ type: "spring", stiffness: 200, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-30 p-4"
                    >
                        <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-700 to-gray-800 backdrop-blur-xl rounded-2xl border border-yellow-500/30 shadow-2xl p-4 grid grid-cols-[auto_1fr_auto] items-center gap-4">
                            <div className="bg-yellow-500/20 text-yellow-400 rounded-lg p-3">
                                <UserCheck size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">
                                    Your Rank: #{myRank.rank}
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    {myRank.uploadCount} uploads
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Last active</p>
                                <p className="font-semibold text-white">
                                    {formatTimeAgo(myRank.lastUpload)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeaderboardPage;