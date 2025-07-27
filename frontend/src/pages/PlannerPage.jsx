"use client";

import { useState, useMemo, useRef, useEffect, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  Calendar, CheckCircle, Trash2, Edit, Save, Plus, X, RotateCcw, Upload, Download,
  BarChart2, AlertTriangle, AlertCircle, Clock, Flag, Filter, Search, Star,
  TrendingUp, Target, Layout, Eye, EyeOff, ChevronDown, ChevronUp,
  Home
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../utils/urls";
import { ValuesContext } from "../context/ValuesContext";
import { useSwipeable } from "react-swipeable";

const Modal = ({ children, onClose, title, size = "default" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50"
    onClick={onClose}
    role="dialog"
    aria-labelledby="modal-title"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-600/50 shadow-2xl shadow-teal-500/10 overflow-hidden ${size === "large" ? "w-full max-w-4xl" : "w-full max-w-2xl"}`}
      onClick={(e) => e.stopPropagation()}
      role="document"
    >
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900">
        <h3 id="modal-title" className="text-xl sm:text-2xl font-bold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-gray-700/50"
          aria-label={`Close ${title} modal`}
        >
          <X size={24} />
        </button>
      </div>
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">{children}</div>
    </motion.div>
  </motion.div>
);

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 50, scale: 0.9 }}
    className={`fixed bottom-4 right-4 left-4 sm:left-auto p-4 rounded-2xl shadow-2xl text-white min-w-auto sm:min-w-80 z-50 ${type === "error"
        ? "bg-gradient-to-r from-red-600 to-red-700 shadow-red-500/30"
        : type === "warning"
          ? "bg-gradient-to-r from-yellow-600 to-yellow-700 shadow-yellow-500/30"
          : "bg-gradient-to-r from-green-600 to-green-700 shadow-green-500/30"
      }`}
    role="alert"
    aria-live="assertive"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${type === "error" ? "bg-red-500/30" : type === "warning" ? "bg-yellow-500/30" : "bg-green-500/30"}`}>
        {type === "error" ? <AlertCircle size={18} /> : type === "warning" ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
      </div>
      <span className="font-medium flex-1">{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" aria-label="Close notification">
        <X size={18} />
      </button>
    </div>
  </motion.div>
);

const TaskCard = ({ task, displayIndex, onToggleStatus, onDelete, onEdit, isOverdue, isToggling }) => {
  const isChecked = task.completedDates?.includes(new Date(task.dueDate).toISOString().split("T")[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: displayIndex * 0.05 }}
      className={`group relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${isChecked
          ? "border-green-500/30 shadow-green-500/10"
          : isOverdue
            ? "border-red-500/50 shadow-red-500/10"
            : task.priority === "High"
              ? "border-red-400/30 hover:border-red-400/50"
              : task.priority === "Medium"
                ? "border-yellow-400/30 hover:border-yellow-400/50"
                : "border-green-400/30 hover:border-green-400/50"
        }`}
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="flex items-start gap-4 flex-1">
          <button
            onClick={() => onToggleStatus(task._id, task.dueDate)}
            disabled={isToggling}
            className={`mt-1 p-2 rounded-full transition-all duration-300 flex-shrink-0 ${isChecked
                ? "bg-green-600 shadow-green-500/30"
                : "bg-gray-600 hover:bg-gray-500 hover:shadow-lg"
              } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label={`Mark task ${task.title} as ${isChecked ? "Pending" : "Completed"}`}
          >
            {isToggling ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <CheckCircle size={18} className="text-white" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className={`text-lg sm:text-xl font-bold transition-all ${isChecked ? "line-through text-gray-400" : "text-white"}`}>
                {task.title}
              </h3>
              {task.recurrence !== "None" && (
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                  Recurring
                </span>
              )}
              <div className={`px-2 py-1 text-xs font-bold rounded-full ${task.priority === "High"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : task.priority === "Medium"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}>
                <Flag size={12} className="inline mr-1" />
                {task.priority}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Target size={14} className="text-teal-400" />
                <span className="font-medium">Category:</span>
                <span className="px-2 py-1 bg-teal-600/20 text-teal-400 rounded-full text-xs border border-teal-500/30">
                  {task.category}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 flex-wrap">
                <Calendar size={14} className="text-blue-400" />
                <span className="font-medium">Due:</span>
                <span className={isOverdue && !isChecked ? "text-red-400 font-bold" : "text-gray-200"}>
                  {new Date(task.dueDate).toLocaleDateString()}
                  {task.time && ` at ${task.time}`}
                </span>
                {isOverdue && !isChecked && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30">
                    OVERDUE
                  </span>
                )}
              </div>
            </div>
            {task.description && (
              <p className="mt-3 text-gray-300 text-sm leading-relaxed">{task.description}</p>
            )}
            {task.notes && (
              <div className="mt-3 p-3 bg-gray-700/30 border border-gray-600/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Edit size={12} className="text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Notes</span>
                </div>
                <p className="text-gray-300 text-sm">{task.notes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-start sm:absolute sm:top-4 sm:right-4 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task._id)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
            aria-label={`Edit task ${task.title}`}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            aria-label={`Delete task ${task.title}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const StatsCard = ({ title, value, subtitle, icon: Icon, color = "teal" }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm p-6 rounded-2xl border border-${color}-500/30 shadow-${color}-500/10`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
        <Icon size={24} className={`text-${color}-400`} />
      </div>
      <div className="text-right">
        <div className={`text-3xl font-bold text-${color}-400`}>{value}</div>
        <div className="text-sm text-gray-400">{subtitle}</div>
      </div>
    </div>
    <h3 className="text-white font-semibold">{title}</h3>
  </motion.div>
);

const PlannerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState("daily");
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(() => {
    const storedCategories = localStorage.getItem('categories');
    return storedCategories ? JSON.parse(storedCategories) : ["Work", "Personal", "Study", "Health", "Shopping"];
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
    dueDate: "",
    time: "",
    recurrence: "None",
    notes: "",
    completedDates: [],
    createdAt: new Date().toISOString(),
  });
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [celebration, setCelebration] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [toast, setToast] = useState({ message: "", type: "", show: false });
  const [isImporting, setIsImporting] = useState(false);
  const [togglingTasks, setTogglingTasks] = useState(new Set());
  const fileInputRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: "", type: "", show: false }), 5000);
  }, []);

  const viewModes = [
    { value: "daily", label: "📅 Daily View", icon: Calendar },
    { value: "weekly", label: "📊 Weekly View", icon: BarChart2 },
    { value: "monthly", label: "🗓️ Monthly View", icon: Layout },
    { value: "yearly", label: "📈 Yearly View", icon: TrendingUp },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "High", label: "🔴 High Priority" },
    { value: "Medium", label: "🟡 Medium Priority" },
    { value: "Low", label: "🟢 Low Priority" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Completed", label: "✅ Completed" },
    { value: "Pending", label: "⏳ Pending" },
    { value: "Overdue", label: "🚨 Overdue" },
  ];

  const sortOptions = [
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "title", label: "Title" },
    { value: "category", label: "Category" },
    { value: "createdAt", label: "Created Date" },
  ];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "rgba(31, 41, 55, 0.9)",
      borderColor: state.isFocused ? "#14B8A6" : "#4B5563",
      color: "#E5E7EB",
      borderRadius: "1rem",
      padding: "0.25rem",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(20, 184, 166, 0.1)" : "none",
      "&:hover": { borderColor: "#14B8A6" },
      transition: "all 0.2s ease",
      minHeight: "48px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "rgba(31, 41, 55, 0.98)",
      borderRadius: "1rem",
      border: "1px solid #4B5563",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      backdropFilter: "blur(16px)",
      zIndex: 60,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#14B8A6"
        : state.isFocused
          ? "rgba(55, 65, 81, 0.8)"
          : "transparent",
      color: state.isSelected ? "#FFFFFF" : "#E5E7EB",
      "&:hover": { backgroundColor: "rgba(55, 65, 81, 0.8)", color: "#FFFFFF" },
      transition: "all 0.2s ease",
      padding: "12px 16px",
    }),
    singleValue: (provided) => ({ ...provided, color: "#E5E7EB" }),
    placeholder: (provided) => ({ ...provided, color: "#9CA3AF" }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "rgba(20, 184, 166, 0.2)",
      border: "1px solid rgba(20, 184, 166, 0.3)",
      borderRadius: "0.5rem",
    }),
    multiValueLabel: (provided) => ({ ...provided, color: "#14B8A6" }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#14B8A6",
      "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#EF4444" },
    }),
  };

  const validateTask = useCallback((task) => {
    if (!task.title?.trim()) return "Task title is required.";
    if (task.title.length > 100) return "Task title must be 100 characters or less.";
    if (!task.category) return "Category is required.";
    if (!task.dueDate || isNaN(new Date(task.dueDate).getTime())) return "Valid due date is required.";
    if (task.description && task.description.length > 500) return "Description must be 500 characters or less.";
    if (task.notes && task.notes.length > 1000) return "Notes must be 1000 characters or less.";
    if (!["Low", "Medium", "High"].includes(task.priority)) return "Valid priority is required.";
    if (!["None", "Daily", "Weekly", "Monthly"].includes(task.recurrence)) return "Valid recurrence is required.";
    if (!Array.isArray(task.completedDates)) return "Invalid completed dates format.";
    return null;
  }, []);

const generateRecurringTasks = useCallback((task, viewStart, viewEnd) => {
    if (task.recurrence === "None") {
      const taskDate = new Date(task.dueDate);
      if (taskDate >= viewStart && taskDate <= viewEnd) {
        const dueStr = taskDate.toISOString().split("T")[0];
        const isCompleted = (task.completedDates || []).includes(dueStr);
        return [{ ...task, status: isCompleted ? "Completed" : "Pending" }];
      }
      return [];
    }

    const generated = [];
    let current = new Date(task.dueDate);
    current.setHours(0, 0, 0, 0);

    if (current < viewStart) {
      return [];
    }

    while (current >= viewStart) {
    
      if (current <= viewEnd) {
        const dueStr = current.toISOString().split("T")[0];
        const isCompleted = (task.completedDates || []).includes(dueStr);
        generated.push({ ...task, status: isCompleted ? "Completed" : "Pending", dueDate: dueStr });
      }

      if (task.recurrence === "Daily") {
        current.setDate(current.getDate() - 1);
      } else if (task.recurrence === "Weekly") {
        current.setDate(current.getDate() - 7);
      } else if (task.recurrence === "Monthly") {
        current.setMonth(current.getMonth() - 1);
      } else {
        break; 
      }
    }
    
    return generated;
  }, []);

  const getPriorityScore = (priority) => {
    switch (priority) {
      case "High": return 3;
      case "Medium": return 2;
      case "Low": return 1;
      default: return 0;
    }
  };

 const filteredAndSortedTasks = useMemo(() => {
    if (!filterDate) return []; 

    let viewStart = new Date(filterDate);
    viewStart.setHours(0, 0, 0, 0);
    let viewEnd = new Date(viewStart);

    switch (viewMode) {
      case "daily":
        viewEnd.setHours(23, 59, 59, 999);
        break;
      case "weekly":
        viewEnd.setDate(viewStart.getDate() + 6);
        viewEnd.setHours(23, 59, 59, 999);
        break;
      case "monthly":
        viewEnd = new Date(viewStart.getFullYear(), viewStart.getMonth() + 1, 0);
        viewEnd.setHours(23, 59, 59, 999);
        break;
      case "yearly":
        viewEnd = new Date(viewStart.getFullYear(), 11, 31);
        viewEnd.setHours(23, 59, 59, 999);
        break;
    }

    let filtered = tasks.flatMap((task, originalIndex) =>
      generateRecurringTasks(task, viewStart, viewEnd).map((gen) => ({ ...gen, originalIndex }))
    );

    if (filters.category) {
      filtered = filtered.filter((task) => task.category === filters.category);
    }
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.notes?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.status) {
      if (filters.status === "Overdue") {
        const today = new Date();
        today.setHours(0,0,0,0); 
        filtered = filtered.filter((task) => new Date(task.dueDate) < today && task.status !== "Completed");
      } else {
        filtered = filtered.filter((task) => task.status === filters.status);
      }
    }

    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "priority":
          aVal = getPriorityScore(a.priority);
          bVal = getPriorityScore(b.priority);
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "category":
          aVal = a.category.toLowerCase();
          bVal = b.category.toLowerCase();
          break;
        case "createdAt":
          aVal = new Date(a.createdAt || a.dueDate);
          bVal = new Date(b.createdAt || b.dueDate);
          break;
        default:
          aVal = new Date(a.dueDate);
          bVal = new Date(b.dueDate);
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;

      if (sortBy === "dueDate") {
        const timeA = a.time || "00:00";
        const timeB = b.time || "00:00";
        return sortOrder === "asc" ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
      }

      return 0;
    });

    return filtered;
  }, [tasks, filters, filterDate, viewMode, sortBy, sortOrder, generateRecurringTasks]);

  const taskStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const stats = {
      total: filteredAndSortedTasks.length,
      completed: 0,
      pending: 0,
      overdue: 0,
      byCategory: {},
      byPriority: { Low: 0, Medium: 0, High: 0 },
      completionRate: 0
    };

    filteredAndSortedTasks.forEach((task) => {
      if (task.status === "Completed") {
        stats.completed++;
      } else {
        stats.pending++;
        if (task.dueDate < today) {
          stats.overdue++;
        }
      }

      stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
    });

    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  }, [filteredAndSortedTasks]);

  const handleAddTask = useCallback(async () => {
    const error = validateTask(newTask);
    if (error) {
      showToast(error, "error");
      return;
    }
    try {
      const taskPayload = { ...newTask, user: user?._id };
      if (editTaskId) {
        const response = await fetch(`${API_URL}/api/todos/${editTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskPayload)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update task: ${response.status} ${errorText}`);
        }
        const updatedTask = await response.json();
        setTasks(prevTasks => prevTasks.map(task => task._id === updatedTask.todo._id ? updatedTask.todo : task));
        showToast('Task updated successfully', 'success');
      } else {
        const response = await fetch(`${API_URL}/api/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskPayload)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to add task: ${response.status} ${errorText}`);
        }
        const addedTask = await response.json();
        setTasks(prevTasks => [...prevTasks, addedTask.todo]);
        showToast('Task added successfully', 'success');
      }
      setNewTask({
        title: "",
        description: "",
        category: "",
        priority: "Medium",
        dueDate: "",
        time: "",
        recurrence: "None",
        notes: "",
        completedDates: [],
        createdAt: new Date().toISOString(),
      });
      setModalOpen(false);
      setEditTaskId(null);
    } catch (error) {
      console.error('Task operation error:', error);
      showToast(`Task operation failed: ${error.message}`, "error");
    }
  }, [newTask, editTaskId, validateTask, showToast, user]);

  const handleEditTask = useCallback((taskId) => {
    const taskToEdit = tasks.find(task => task._id === taskId);
    if (taskToEdit) {
      setNewTask({ ...taskToEdit });
      setEditTaskId(taskId);
      setModalOpen(true);
    }
  }, [tasks]);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${taskId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete task: ${response.status} ${errorText}`);
      }
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      showToast('Task deleted successfully', 'success');
    } catch (error) {
      console.error('Delete task error:', error);
      showToast(`Delete task failed: ${error.message}`, 'error');
    }
  }, [showToast]);

  const handleToggleStatus = useCallback(async (taskId, dueDate) => {
    const key = `${taskId}-${dueDate}`;
    setTogglingTasks(prev => new Set(prev).add(key));
    try {
      const dueStr = new Date(dueDate).toISOString().split("T")[0];
      const response = await fetch(`${API_URL}/api/todos/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dueStr, userId: user?._id })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to toggle task status: ${response.status} ${errorText}`);
      }
      const { todo, action } = await response.json();
      setTasks(prevTasks => prevTasks.map(task => task._id === todo._id ? todo : task));
      if (action === 'marked') {
        setCelebration(true);
        setTimeout(() => setCelebration(false), 3000);
      }
      showToast(`Task ${action} successfully`, 'success');
    } catch (error) {
      console.error('Toggle status error:', error);
      showToast(`${error.message}`, 'error');
    } finally {
      setTogglingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  }, [showToast, user]);

  const handleAddCategory = useCallback((newCategory) => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      showToast("Category name cannot be empty.", "error");
      return;
    }
    if (trimmedCategory.length > 20) {
      showToast("Category name must be 20 characters or less.", "error");
      return;
    }
    if (categories.some(cat => cat.toLowerCase() === trimmedCategory.toLowerCase())) {
      showToast("Category already exists.", "error");
      return;
    }
    const updatedCategories = [...categories, trimmedCategory];
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    showToast(`Category "${trimmedCategory}" added successfully`, "success");
  }, [categories, showToast]);

  const handleDeleteCategory = useCallback((category) => {
    const tasksWithCategory = tasks.some(task => task.category === category);
    if (tasksWithCategory) {
      showToast("Cannot delete category as it is associated with one or more tasks.", "error");
      return;
    }
    const updatedCategories = categories.filter(cat => cat !== category);
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    showToast(`Category "${category}" deleted successfully`, "success");
  }, [categories, tasks, showToast]);

  const handleReset = useCallback(async () => {
    try {
      const deletePromises = tasks.map(task => fetch(`${API_URL}/api/todos/${task._id}`, { method: 'DELETE' }));
      await Promise.all(deletePromises);
      setTasks([]);
      const defaultCategories = ["Work", "Personal", "Study", "Health", "Shopping"];
      setCategories(defaultCategories);
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
      setFilters({
        category: "",
        priority: "",
        status: "",
        search: "",
        dateFrom: "",
        dateTo: "",
      });
      setFilterDate(new Date().toISOString().split("T")[0]);
      setSortBy("dueDate");
      setSortOrder("asc");
      setShowChart(false);
      showToast("Planner reset successfully", "success");
    } catch (error) {
      console.error('Reset planner error:', error);
      showToast(`Reset planner failed: ${error.message}`, "error");
    }
  }, [tasks, showToast]);

  const handleExport = useCallback(() => {
    const data = {
      tasks,
      categories,
      exportTimestamp: new Date().toISOString(),
      version: "2.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task_planner_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully", "success");
  }, [tasks, categories, showToast]);

  const handleImport = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      showToast("Only JSON files are allowed.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB.", "error");
      return;
    }
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!importedData || typeof importedData !== "object") {
          throw new Error("Invalid data format.");
        }
        if (!Array.isArray(importedData.tasks) || !Array.isArray(importedData.categories)) {
          throw new Error("Data must include tasks and categories arrays.");
        }
        const migratedTasks = importedData.tasks.map((task, index) => {
          const error = validateTask(task);
          if (error) throw new Error(`Task ${index + 1}: ${error}`);
          return {
            ...task,
            id: task.id || Date.now().toString() + index,
            user: user?._id,
            description: task.description || "",
            time: task.time || "",
            notes: task.notes || "",
            completedDates: task.completedDates || [],
            createdAt: task.createdAt || new Date().toISOString(),
          };
        });
        const importPromises = migratedTasks.map(async (task) => {
          const response = await fetch(`${API_URL}/api/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to import task: ${response.status} ${errorText}`);
          }
          return response.json();
        });
        const importedTasks = await Promise.all(importPromises);
        setTasks(importedTasks.map(item => item.todo));
        setCategories([...new Set(importedData.categories)]);
        localStorage.setItem('categories', JSON.stringify([...new Set(importedData.categories)]));
        showToast(`Imported ${importedTasks.length} tasks successfully`, "success");
      } catch (error) {
        console.error('Import error:', error);
        showToast(`Import failed: ${error.message}`, "error");
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      showToast("Error reading file.", "error");
      setIsImporting(false);
    };
    reader.readAsText(file);
  }, [validateTask, showToast, user]);

  const resetFilters = useCallback(() => {
    setFilters({
      category: "",
      priority: "",
      status: "",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
    showToast("Filters cleared", "success");
  }, [showToast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/todos`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
        }
        const tasksData = await response.json();
        console.log('Fetched tasks:', tasksData?.todos);
        setTasks(tasksData?.todos);
      } catch (error) {
        console.error('Fetch tasks error:', error);
        showToast(`Failed to fetch tasks: ${error.message}`, 'error');
      }
    };
    fetchData();
    console.log("todos fetched successfully : ", tasks);
  }, [showToast]);

  useEffect(() => {
    setFilterDate(new Date().toISOString().split("T")[0]);
  }, [viewMode]);

 const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
  
  const isExcludedRoute = location.pathname.startsWith("/login") || location.pathname === "/signup";
  const isMobile = window.innerWidth <= 768;
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

  return (
    <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-900 p-4 sm:p-6 pb-10 pt-24">
      <Helmet>
        <title>Professional Task Planner - Organize Your Life</title>
        <meta
          name="description"
          content="A comprehensive task management solution with advanced filtering, analytics, and productivity insights."
        />
        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.8);
          }
          input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(0.8);
          }
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.6);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #14B8A6, #0D9488);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #0D9488, #0F766E);
          }
        `}</style>
      </Helmet>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 text-teal-400 hover:text-teal-300 transition-all duration-300 hover:scale-105 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-700/50"
              aria-label="Navigate back to home"
            >
              <Home size={20} />
              <span className="font-medium hidden sm:inline">Back to Home</span>
            </button>
          </div>
          <div className="w-full lg:w-80">
            <Select
              options={viewModes}
              value={viewModes.find((mode) => mode.value === viewMode)}
              onChange={(option) => setViewMode(option.value)}
              styles={customSelectStyles}
              placeholder="Select View Mode"
              aria-label="Select task view mode"
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl border border-gray-700/50 shadow-2xl shadow-teal-500/10 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 sm:p-8 border-b border-gray-700/50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Task Planner</h1>
                <p className="text-gray-300 text-base sm:text-lg">Organize, prioritize, and achieve your goals</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full lg:w-auto">
                <div className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center border border-gray-600/30">
                  <div className="text-xl sm:text-2xl font-bold text-teal-400">{taskStats.total}</div>
                  <div className="text-xs text-gray-400">Total Tasks</div>
                </div>
                <div className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center border border-gray-600/30">
                  <div className="text-xl sm:text-2xl font-bold text-green-400">{taskStats.completed}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center border border-gray-600/30">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-400">{taskStats.pending}</div>
                  <div className="text-xs text-gray-400">Pending</div>
                </div>
                <div className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center border border-gray-600/30">
                  <div className="text-xl sm:text-2xl font-bold text-red-400">{taskStats.overdue}</div>
                  <div className="text-xs text-gray-400">Overdue</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-8 border-b border-gray-700/50">
            <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    setNewTask({
                      title: "",
                      description: "",
                      category: categories[0] || "",
                      priority: "Medium",
                      dueDate: new Date().toISOString().split("T")[0],
                      time: "",
                      recurrence: "None",
                      notes: "",
                      completedDates: [],
                      createdAt: new Date().toISOString(),
                    });
                    setEditTaskId(null);
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold rounded-2xl py-3 px-6 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30 hover:scale-105"
                  aria-label="Add new task"
                >
                  <Plus size={20} />
                  Add Task
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-3 font-semibold rounded-2xl py-3 px-6 transition-all duration-300 hover:shadow-lg hover:scale-105 ${showFilters
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-500/30"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    }`}
                  aria-label={showFilters ? "Hide filters" : "Show filters"}
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">{showFilters ? "Hide Filters" : "Show Filters"}</span>
                  {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <button
                  onClick={() => setShowChart(!showChart)}
                  className={`flex items-center gap-3 font-semibold rounded-2xl py-3 px-6 transition-all duration-300 hover:shadow-lg hover:scale-105 ${showChart
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-purple-500/30"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    }`}
                  aria-label={showChart ? "Hide analytics" : "Show analytics"}
                >
                  <BarChart2 size={18} />
                  <span className="hidden sm:inline">{showChart ? "Hide Analytics" : "Show Analytics"}</span>
                </button>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl py-2 px-4 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
                  aria-label="Export data"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl py-2 px-4 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label="Import data"
                  disabled={isImporting}
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">{isImporting ? "Importing..." : "Import"}</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl py-2 px-4 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30"
                  aria-label="Reset all data"
                >
                  <RotateCcw size={16} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
                aria-label="Upload data file"
              />
            </div>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 sm:p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Search Tasks</label>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by title, description..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full p-3 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      <option value="">All Priorities</option>
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-3 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      <option value="">All Status</option>
                      <option value="Completed">✅ Completed</option>
                      <option value="Pending">⏳ Pending</option>
                      <option value="Overdue">🚨 Overdue</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">View Date</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full p-3 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-3 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full p-3 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-xl py-2 px-4 transition-all duration-200"
                    >
                      <X size={16} />
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-teal-400" />
                Manage Categories
              </h3>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Add new category (max 20 chars)"
                  maxLength={20}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      handleAddCategory(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="flex-1 p-3 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  aria-label="Add new category"
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add new category (max 20 chars)"]');
                    if (input?.value.trim()) {
                      handleAddCategory(input.value);
                      input.value = "";
                    }
                  }}
                  className="p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/30"
                  aria-label="Add category"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <motion.div
                    key={cat}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-3 border border-gray-600/50"
                  >
                    <span className="text-gray-200 font-medium">{cat}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg p-1 transition-all"
                      aria-label={`Delete category ${cat}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <AnimatePresence>
            {showChart && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 sm:p-8 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-900/30"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <BarChart2 size={24} className="text-purple-400" />
                  Task Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatsCard
                    title="Completion Rate"
                    value={`${taskStats.completionRate}%`}
                    subtitle="of all tasks"
                    icon={TrendingUp}
                    color="green"
                  />
                  <StatsCard
                    title="Productivity Score"
                    value={taskStats.completed > taskStats.overdue ? "High" : taskStats.completed === taskStats.overdue ? "Medium" : "Low"}
                    subtitle="based on completion"
                    icon={Star}
                    color="yellow"
                  />
                  <StatsCard
                    title="Active Tasks"
                    value={taskStats.pending}
                    subtitle="need attention"
                    icon={Clock}
                    color="blue"
                  />
                  <StatsCard
                    title="Categories"
                    value={Object.keys(taskStats.byCategory).length}
                    subtitle="in use"
                    icon={Target}
                    color="purple"
                  />
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Task Status Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Completed</span>
                        <span className="text-green-400 font-bold">{taskStats.completed}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-full"
                          initial={{ width: 0 }}
                          animate={{ width: taskStats.total > 0 ? `${(taskStats.completed / taskStats.total) * 100}%` : "0%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Priority Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(taskStats.byPriority).map(([priority, count]) => (
                        <div key={priority}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300">{priority} Priority</span>
                            <span className={`font-bold ${priority === "High" ? "text-red-400" : priority === "Medium" ? "text-yellow-400" : "text-green-400"}`}>
                              {count}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className={`h-full ${priority === "High" ? "bg-gradient-to-r from-red-500 to-red-600" : priority === "Medium" ? "bg-gradient-to-r from-yellow-500 to-yellow-600" : "bg-gradient-to-r from-green-500 to-green-600"}`}
                              initial={{ width: 0 }}
                              animate={{ width: taskStats.total > 0 ? `${(count / taskStats.total) * 100}%` : "0%" }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Category Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(taskStats.byCategory).map(([category, count]) => (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300">{category}</span>
                            <span className="text-teal-400 font-bold">{count}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-teal-500 to-teal-600 h-full"
                              initial={{ width: 0 }}
              _                 animate={{ width: taskStats.total > 0 ? `${(count / taskStats.total) * 100}%` : "0%" }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                <Layout size={24} className="text-teal-400" />
                Tasks ({filteredAndSortedTasks.length})
              </h3>
              {filteredAndSortedTasks.length > 0 && (
                <div className="text-sm text-gray-400 text-left sm:text-right">
                  Showing {viewMode} view for {new Date(filterDate).toLocaleDateString()}
                </div>
              )}
            </div>
            {filteredAndSortedTasks.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedTasks.map((task, displayIndex) => {
                    const today = new Date().toISOString().split("T")[0];
                    const isOverdue = task.dueDate < today && task.status !== "Completed";
                    return (
                      <TaskCard
                        key={`${task._id}-${task.dueDate}`}
                        task={task}
                        displayIndex={displayIndex}
                        onToggleStatus={handleToggleStatus}
                      	onEdit={handleEditTask}
                      	onDelete={handleDeleteTask}
                      	isOverdue={isOverdue}
                      	isToggling={togglingTasks.has(`${task._id}-${task.dueDate}`)}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 px-4"
                role="alert"
              >
                <div className="mb-6">
                  <AlertTriangle className="mx-auto h-16 w-16 text-yellow-400" aria-hidden="true" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">No Tasks Found</h4>
                <p className="text-gray-400 text-lg mb-8">
                  {tasks.length === 0
                    ? "Get started by creating your first task!"
                    : "No tasks match your current filters. Try adjusting your search criteria."
                  }
                </p>
                {tasks.length === 0 ? (
                  <button
                    onClick={() => {
                      setNewTask({
                      	title: "",
                      	description: "",
                      	category: categories[0] || "",
                      	priority: "Medium",
                      	dueDate: new Date().toISOString().split("T")[0],
                      	time: "",
                      	recurrence: "None",
                      	notes: "",
                      	completedDates: [],
                      	createdAt: new Date().toISOString(),
                      });
                      setEditTaskId(null);
                      setModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30 hover:scale-105"
                  >
                    Create Your First Task
                  </button>
                ) : (
                  <button
                    onClick={resetFilters}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                  >
                    Clear All Filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
        <AnimatePresence>
          {modalOpen && (
            <Modal
              title={editTaskId !== null ? "Edit Task" : "Create New Task"}
              onClose={() => {
                setModalOpen(false);
                setEditTaskId(null);
              }}
              size="large"
            >
              <div className="space-y-6">
                {editTaskId !== null && newTask.recurrence !== "None" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl"
                  >
                    <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />
                    <p className="text-yellow-400 font-medium text-sm sm:text-base">
                      Editing this recurring task will affect the entire series.
                    </p>
                  </motion.div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label htmlFor="task-title" className="text-sm font-semibold text-gray-200 mb-2 block">
                      Task Title *
                    </label>
                    <input
                      id="task-title"
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-lg"
                      placeholder="Enter a descriptive task title..."
                      maxLength={100}
                      aria-required="true"
                    />
                    <div className="text-xs text-gray-400 mt-1">{newTask.title.length}/100 characters</div>
                  </div>
                  <div>
                    <label htmlFor="task-category" className="text-sm font-semibold text-gray-200 mb-2 block">
                      Category *
                    </label>
                    <select
                      id="task-category"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      aria-required="true"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="task-priority" className="text-sm font-semibold text-gray-200 mb-2 block">
                      Priority *
                    </label>
                    <select
                      id="task-priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      aria-required="true"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="task-due-date" className="text-sm font-semibold text-gray-200 mb-2 block">
                      Due Date *
                    </label>
                    <input
                      id="task-due-date"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label htmlFor="task-time" className="text-sm font-semibold text-gray-200 mb-2 block">
                      Time (Optional)
                    </label>
                    <input
                      id="task-time"
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="task-recurrence" className="text-sm font-semibold text-gray-200 mb-2 block">
                      Recurrence *
                    </label>
                    <select
                      id="task-recurrence"
                      value={newTask.recurrence}
                      onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      aria-required="true"
                    >
                      <option value="None">None</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <label htmlFor="task-description" className="text-sm font-semibold text-gray-200 mb-2 block">
                      Description (Optional)
                    </label>
                    <textarea
                      id="task-description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                      placeholder="Add details about the task..."
                      maxLength={500}
                      rows={4}
                    />
                    <div className="text-xs text-gray-400 mt-1">{newTask.description.length}/500 characters</div>
                  </div>
                  <div className="lg:col-span-2">
                    <label htmlFor="task-notes" className="text-sm font-semibold text-gray-200 mb-2 block">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="task-notes"
                      value={newTask.notes}
                      onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                      className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                      placeholder="Add additional notes..."
                      maxLength={1000}
                      rows={6}
                    />
                    <div className="text-xs text-gray-400 mt-1">{newTask.notes.length}/1000 characters</div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setEditTaskId(null);
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
                    aria-label="Cancel task creation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                    aria-label={editTaskId !== null ? "Save task changes" : "Create task"}
                  >
                    <Save size={18} />
                    {editTaskId !== null ? "Save Changes" : "Create Task"}
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {toast.show && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ message: "", type: "", show: false })}
            />
          )}
        </AnimatePresence>
  	  </div>
  	</div>
  );
};

export default PlannerPage;