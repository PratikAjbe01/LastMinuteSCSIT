"use client";

import { useState, useEffect, useMemo, useRef, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, Info, Edit2, Save, XCircle, List, Cog, RotateCcw, Target, Calendar, AlertTriangle, Trash2, Filter, ArrowUpDown, Undo2, Loader2, RefreshCw, Home, FileCheck2 } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, isValid, startOfMonth, parseISO, compareAsc, addDays, subDays, differenceInDays, isSameDay, startOfDay, endOfDay } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../utils/urls";
import { useSwipeable } from "react-swipeable";
import { ValuesContext } from "../context/ValuesContext";
import { EditProfileModal } from "../components/EditProfileModal";

const ALL_SEMESTER_DATA = {
  "BCA": {
    "1": ["Programming in C", "Mathematics for Computing", "Digital Electronics", "Communication Skills", "Computer Organization"],
    "2": ["Data Structures", "Discrete Mathematics", "Web Development", "Object Oriented Programming", "Database Management Systems"],
    "3": ["Operating Systems", "Computer Networks", "Java Programming", "Software Engineering", "Computer Graphics"],
    "4": ["Advanced Database Systems", "Web Technologies", "Project Work"],
    "5": ["Artificial Intelligence", "Cyber Security", "Mobile Application Development"],
    "6": ["Cloud Computing", "Big Data Analytics", "Project Work"],
  },
  "MCA": {
    "1": { subjects: [{ name: "Computer Organisation and Architecture" }, { name: "Mathematical Foundation for Computer Application" }, { name: "Data Structures Using C++" }, { name: "Operating System" }, { name: "Communication Skills and Report Writing" }] },
    "2": { subjects: [{ name: "Software Engineering" }, { name: "Database Management System" }, { name: "Design and Analysis of Algorithms" }, { name: "Computer Networks" }, { name: "Internet and Web Technology" }] },
    "3": { subjects: [{ name: "Information Security" }, { name: "Automata Theory and Compiler Constructions" }, { name: "Artificial Intelligence and Machine Learning" }, { name: "Cloud Computing" }, { name: "Information Technology Project Management" }] },
    "4": { subjects: [{ name: "Project Work" }] }
  },
  "BCA_INT": {
    "1": ["Programming in C", "Mathematics for Computing", "Digital Electronics", "Communication Skills"],
    "2": ["Data Structures", "Discrete Mathematics", "Web Development", "Computer Organization"],
    "3": ["Operating Systems", "Object Oriented Programming", "Database Management Systems"],
    "4": ["Computer Networks", "Java Programming", "Software Engineering"],
    "5": ["Computer Graphics", "Web Technologies", "Advanced Database Systems"],
    "6": ["Artificial Intelligence", "Cloud Computing", "Project Work"],
    "7": ["Big Data Analytics", "Cyber Security", "Mobile Application Development"],
    "8": ["Advanced Web Technologies", "Project Work"],
  },
  "MSC_INT_CS": {
    "1": ["Fundamentals of IT & Programming", "Digital Logic", "Mathematics-I", "Communication Skills"],
    "2": ["Data Structures", "Computer Organization", "Mathematics-II", "Intro to Cyber Security"],
    "3": ["Object-Oriented Programming", "Operating Systems", "Database Management Systems", "Network Fundamentals"],
    "4": ["Web Technologies", "Software Engineering", "Principles of Information Security", "Python for Security"],
    "5": ["Computer Networks & Security", "Cryptography Basics", "Ethical Hacking Fundamentals", "Cyber Law & Ethics"],
    "6": ["Secure Coding Practices", "Web Application Security", "Digital Forensics-I", "Minor Project-I"],
    "7": ["Network Security & Firewalls", "Malware Analysis", "Intrusion Detection Systems", "Elective-I"],
    "8": ["Cloud Security", "Mobile & Wireless Security", "Digital Forensics-II", "Elective-II"],
    "9": ["Advanced Cryptography", "IoT Security", "Cyber Threat Intelligence", "Minor Project-II"],
    "10": ["Major Project / Internship"],
  },
  "MTECH_CS": {
    "1": ["Advanced Data Structures", "Theory of Computation", "Modern Computer Architecture", "Advanced Algorithms"],
    "2": ["Machine Learning", "Advanced Database Systems", "Compiler Design", "Research Methodology"],
    "3": ["Deep Learning", "Cloud Computing", "Minor Project"],
    "4": ["Dissertation / Major Project"],
  },
  "MTECH_CS_EXEC": {
    "1": ["Software Project Management", "Advanced Operating Systems", "Data Warehousing & Mining", "IT Strategy"],
    "2": ["Agile Methodologies", "Information Systems Security", "Business Intelligence", "Cloud Services"],
    "3": ["Big Data Analytics", "DevOps", "Case Studies Project"],
    "4": ["Dissertation / Major Project"],
  },
  "MTECH_NM_IS": {
    "1": ["Advanced Computer Networks", "Cryptography & Network Security", "Network Programming", "Wireless & Mobile Networks"],
    "2": ["Information & System Security", "Network Management & Operations", "Ethical Hacking", "Research Methodology"],
    "3": ["Cloud & Data Center Networking", "Intrusion Detection & Prevention Systems", "Digital Forensics", "Minor Project"],
    "4": ["Dissertation / Major Project"],
  },
  "MTECH_IA_SE": {
    "1": ["Advanced Software Engineering", "Information Architecture & Design", "Software Metrics & Quality Assurance", "Object-Oriented Analysis & Design"],
    "2": ["Software Architecture & Patterns", "Component-Based Software Engineering", "User Experience (UX) Design", "Research Methodology"],
    "3": ["Software Project & Risk Management", "Agile Software Development", "Service-Oriented Architecture", "Minor Project"],
    "4": ["Dissertation / Major Project"],
  },
  "PHD": {
    "1": ["Research Methodology", "Advanced Computing", "Statistical Methods"],
    "2": ["Machine Learning", "Data Science", "Literature Review"],
    "3": ["Artificial Intelligence", "Advanced Algorithms", "Big Data Analytics"],
    "4": ["Cyber Security", "Cloud Computing", "Thesis Work"],
    "5": ["Advanced Topics in Computing", "Research Seminar"],
    "6": ["Thesis Work"],
  },
  "MSC_CS": {
    "1": ["Advanced Data Structures", "Theory of Computation", "Advanced Algorithms", "Computer Systems and Networks"],
    "2": ["Artificial Intelligence", "Compiler Design", "Advanced Database Systems", "Software Project Management"],
    "3": ["Machine Learning", "Cryptography and Network Security", "Cloud Computing", "Elective I"],
    "4": ["Major Project"],
  },
  "MSC_IT": {
    "1": ["IT Fundamentals", "Web Technologies", "Object-Oriented Programming", "Network Essentials"],
    "2": ["Data Warehousing and Mining", "Mobile Computing", "Information Security", "E-Commerce"],
    "3": ["Big Data Technologies", "Internet of Things (IoT)", "Digital Image Processing", "Elective II"],
    "4": ["Major Project"],
  },
  "MBA_CM": {
    "1": ["Principles of Management", "Managerial Economics", "IT for Managers", "Accounting for Managers"],
    "2": ["Marketing Management", "Human Resource Management", "Database Management Systems", "Business Communication"],
    "3": ["Software Project Management", "E-Business Strategies", "Information Security", "Strategic Management"],
    "4": ["Internship and Project Report"],
  },
  "PGDCA": {
    "1": ["Computer Fundamentals & PC Software", "Programming in C", "Database Management using FoxPro", "System Analysis and Design"],
    "2": ["GUI Programming with Visual Basic", "Web Design and Development", "Object-Oriented Programming with C++", "Project Work"],
  },
};

const getOrdinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const Modal = ({ children, onClose, title }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onClick={onClose}
    role="dialog"
    aria-labelledby="modal-title"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl shadow-2xl overflow-hidden"
      onClick={e => e.stopPropagation()}
      role="document"
    >
      <div className="flex justify-between items-center p-5 border-b border-gray-700">
        <h3 id="modal-title" className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors rounded-full p-2"
          aria-label="Close modal"
        >
          <svg data-name="icon-close" width="20" height="20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="10"><path d="M10 10 L90 90 M10 90 L90 10" /></svg>
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
    </motion.div>
  </motion.div>
);

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-green-600'}`}
    role="alert"
  >
    <div className="flex items-center gap-2">
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200" aria-label="Close toast">
        <X size={16} />
      </button>
    </div>
  </motion.div>
);

const AttendanceManager = () => {
  const { userId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editData, setEditData] = useState({ attended: 0, total: 0, startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd') });
  const [lastAction, setLastAction] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ lastSync: null, pending: false });
  const undoTimeoutRef = useRef(null);
  const pollingRef = useRef(null);
  const syncQueueRef = useRef([]);
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeModal, setActiveModal] = useState({ type: null, data: null });
  const [modalInput, setModalInput] = useState({});
  const [logSortOrder, setLogSortOrder] = useState('desc');
  const [filter, setFilter] = useState({ type: 'all', startDate: subDays(new Date(), 30), endDate: new Date() });
  const [newManualDate, setNewManualDate] = useState('');
  const currentDate = new Date();
  const todayStr = format(currentDate, 'yyyy-MM-dd');

  const courseKey = useMemo(() => user?.course?.toUpperCase().replace('-', '_') || '', [user?.course]);
  const courseData = useMemo(() => ALL_SEMESTER_DATA[courseKey] || {}, [courseKey]);
  const semester = user?.semester;

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: '', type: '', show: false }), 5000);
  }, []);

  const generateInitialHistory = useCallback((startDateStr) => {
    const startDate = parseISO(startDateStr);
    if (!isValid(startDate) || compareAsc(startDate, currentDate) > 0) {
      return [];
    }
    const daysDiff = differenceInDays(currentDate, startDate) + 1;
    return Array.from({ length: Math.min(daysDiff, 180) }, (_, i) => {
      const date = addDays(startDate, i);
      return { date: format(date, 'yyyy-MM-dd'), status: 'no-class' };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [currentDate]);

  const calculateSubjectMetrics = useCallback((subject) => {
    const validHistory = subject.history.filter(h => isValid(parseISO(h.date)));
    const total = validHistory.filter(h => h.status !== 'no-class').length;
    const attended = validHistory.filter(h => h.status === 'present').length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) || 0 : 0;
    const goalPercentage = subject.goal || 75;
    const status = total > 0 ? (percentage >= goalPercentage ? 'safe' : 'danger') : 'neutral';

    let classesNeeded = 0;
    let canBunk = 0;

    if (total > 0) {
      if (percentage < goalPercentage) {
        classesNeeded = Math.ceil((goalPercentage * total - 100 * attended) / (100 - goalPercentage));
      } else {
        canBunk = Math.floor((100 * attended - goalPercentage * total) / goalPercentage);
      }
    }

    const message = total > 0
      ? percentage >= goalPercentage
        ? canBunk > 0 ? `Safe! Can miss ${canBunk} class${canBunk > 1 ? 'es' : ''}` : 'Attendance is safe'
        : `Need ${classesNeeded} consecutive present${classesNeeded > 1 ? 's' : ''}`
      : 'No attendance data';

    const todayEntry = validHistory.find(h => h.date === todayStr);
    const todayStatus = todayEntry ? todayEntry.status : 'not-marked';

    return {
      ...subject,
      attended,
      total,
      percentage,
      status,
      message,
      todayStatus,
      classesNeeded,
      canBunk
    };
  }, [todayStr]);

  const validateAttendanceData = useCallback((data) => {
    if (!Array.isArray(data)) return false;
    return data.every(subject =>
      subject.name &&
      typeof subject.name === 'string' &&
      Array.isArray(subject.history) &&
      subject.history.every(h => h.date && h.status && ['present', 'absent', 'no-class'].includes(h.status))
    );
  }, []);

  const fetchAttendance = useCallback(async (showLoader = true) => {
    if (!courseData || !semester || !user?.course) {
      showToast('Missing course information', 'error');
      setIsLoading(false);
      return;
    }

    if (showLoader) setIsLoading(true);
    console.log()
    try {
      const response = await fetch(`${API_URL}/api/attendance/${user.course}/${semester}`, {
        headers: {
          'Authorization': `Bearer ${user.token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch attendance: ${response.statusText}`);
      }

      const { data } = await response.json();

      if (!validateAttendanceData(data)) {
        throw new Error('Invalid attendance data format');
      }

      const semesterContent = courseData[semester] || {};
      let subjectNames = [];

      if (courseKey === 'MCA' && Array.isArray(semesterContent.subjects)) {
        subjectNames = semesterContent.subjects.map(s => s.name);
      } else if (Array.isArray(semesterContent)) {
        subjectNames = semesterContent;
      }

      const currentSubjectNames = data.map(s => s.name);
      const defaultStartDate = format(subDays(currentDate, 30), 'yyyy-MM-dd');

      const newSubjectsToAdd = subjectNames
        .filter(name => !currentSubjectNames.includes(name))
        .map(name => ({
          name,
          goal: 75,
          startDate: defaultStartDate,
          history: generateInitialHistory(defaultStartDate),
        }));

      const subjectsToValidate = [...data.filter(s => subjectNames.includes(s.name)), ...newSubjectsToAdd];

      setSubjects(subjectsToValidate.map(calculateSubjectMetrics));
      setSyncStatus({ lastSync: new Date(), pending: false });

    } catch (error) {
      console.error('Error fetching attendance:', error);
      showToast('Failed to load attendance data', 'error');

      const semesterContent = courseData[semester] || {};
      let subjectNames = [];

      if (courseKey === 'MCA' && Array.isArray(semesterContent.subjects)) {
        subjectNames = semesterContent.subjects.map(s => s.name);
      } else if (Array.isArray(semesterContent)) {
        subjectNames = semesterContent;
      }

      const defaultStartDate = format(subDays(currentDate, 30), 'yyyy-MM-dd');
      const newSubjectsToAdd = subjectNames.map(name => ({
        name,
        goal: 75,
        startDate: defaultStartDate,
        history: generateInitialHistory(defaultStartDate),
      }));

      setSubjects(newSubjectsToAdd.map(calculateSubjectMetrics));
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [courseData, semester, user, currentDate, generateInitialHistory, calculateSubjectMetrics, validateAttendanceData, showToast, courseKey]);

  const processSyncQueue = useCallback(async () => {
    if (syncQueueRef.current.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const itemsToSync = [...syncQueueRef.current];
    syncQueueRef.current = [];

    try {
      for (const syncItem of itemsToSync) {
        const response = await fetch(`${API_URL}/api/attendance/${user?.course}/${semester}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token || ''}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ subjects: syncItem.subjects }),
        });

        if (!response.ok) {
          throw new Error(`Sync failed: ${response.statusText}`);
        }
      }

      setSyncStatus({ lastSync: new Date(), pending: false });

    } catch (error) {
      console.error('Sync error:', error);
      syncQueueRef.current = [...itemsToSync, ...syncQueueRef.current];
      setSyncStatus(prev => ({ ...prev, pending: true }));
      showToast('Sync failed. Will retry automatically.', 'warning');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, user, semester, showToast]);

  const updateAttendance = useCallback(async (newSubjects, optimistic = false, subjectName = null) => {
    const originalSubjects = JSON.parse(JSON.stringify(subjects));

    if (optimistic) {
      setSubjects(newSubjects.map(calculateSubjectMetrics));
      setLastAction({ state: originalSubjects, subjectName, timestamp: Date.now() });

      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => setLastAction(null), 10000);
    }

    syncQueueRef.current.push({ subjects: newSubjects, timestamp: Date.now() });
    setSyncStatus(prev => ({ ...prev, pending: true }));

    setTimeout(() => processSyncQueue(), optimistic ? 500 : 0);

    if (!optimistic) {
      showToast('Attendance updated successfully', 'success');
    }
  }, [subjects, calculateSubjectMetrics, processSyncQueue, showToast]);

  const resetSubjectAttendance = useCallback(async (subjectName) => {
    const originalSubjects = JSON.parse(JSON.stringify(subjects));
    setLastAction({ state: originalSubjects, subjectName });

    try {
      const response = await fetch(`${API_URL}/api/attendance/${user?.course}/${semester}/subject/${encodeURIComponent(subjectName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Reset failed: ${response.statusText}`);
      }

      await fetchAttendance(false);
      showToast('Subject attendance reset successfully', 'success');
      setActiveModal({ type: null, data: null });

    } catch (error) {
      console.error('Error resetting subject attendance:', error);
      setLastAction(null);
      showToast('Failed to reset subject attendance', 'error');
    }
  }, [subjects, user, semester, fetchAttendance, showToast]);

  const handleUndo = useCallback(async () => {
    if (!lastAction) return;

    const timeSinceAction = Date.now() - (lastAction.timestamp || 0);
    if (timeSinceAction > 10000) {
      showToast('Undo time limit exceeded', 'warning');
      setLastAction(null);
      return;
    }

    await updateAttendance(lastAction.state, false, lastAction.subjectName);
    setLastAction(null);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    showToast('Action undone', 'success');
  }, [lastAction, updateAttendance, showToast]);

  const { presentDays, absentDays, dailySummary } = useMemo(() => {
    const summary = {};
    subjects.forEach(subject => {
      subject.history.forEach(record => {
        const recordDate = parseISO(record.date);
        if (!isValid(recordDate)) return;
        const dateKey = format(recordDate, 'yyyy-MM-dd');
        if (!summary[dateKey]) summary[dateKey] = [];
        summary[dateKey].push({ subject: subject.name, status: record.status });
      });
    });

    const present = new Set();
    const absent = new Set();

    Object.keys(summary).forEach(dateStr => {
      const dayRecords = summary[dateStr];
      const hasClasses = dayRecords.some(r => r.status !== 'no-class');

      if (hasClasses) {
        if (dayRecords.some(r => r.status === 'absent')) {
          absent.add(parseISO(dateStr));
        } else if (dayRecords.every(r => r.status === 'present' || r.status === 'no-class')) {
          present.add(parseISO(dateStr));
        }
      }
    });

    return {
      presentDays: Array.from(present),
      absentDays: Array.from(absent),
      dailySummary: summary
    };
  }, [subjects]);

  const handleAttendanceChange = useCallback(async (subjectName, type) => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

    const subject = subjects.find(s => s.name === subjectName);
    if (!subject) {
      showToast('Subject not found', 'error');
      return;
    }

    const existingEntry = subject.history.find(h => h.date === todayStr);
    if (existingEntry?.status === type) {
      showToast(`Already marked as ${type} for today`, 'warning');
      return;
    }

    const newSubjects = subjects.map(sub => {
      if (sub.name === subjectName) {
        let newHistory = sub.history.filter(h => h.date !== todayStr);
        newHistory.push({ date: todayStr, status: type });
        newHistory = [...new Map(newHistory.map(h => [h.date, h])).values()]
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        return { ...sub, history: newHistory };
      }
      return sub;
    });

    await updateAttendance(newSubjects, true, subjectName);
  }, [subjects, todayStr, updateAttendance, showToast]);

  const handleEditClick = useCallback((subject) => {
    setEditingSubject(subject.name);
    setEditData({
      attended: subject.attended || 0,
      total: subject.total || 0,
      startDate: subject.startDate || format(subDays(currentDate, 30), 'yyyy-MM-dd')
    });
  }, [currentDate]);

  const handleSaveEdit = useCallback(async () => {
    if (editData.attended > editData.total) {
      showToast('Attended classes cannot exceed total classes', 'error');
      return;
    }

    if (editData.attended < 0 || editData.total < 0) {
      showToast('Class counts cannot be negative', 'error');
      return;
    }

    const startDate = parseISO(editData.startDate);
    if (!isValid(startDate) || compareAsc(startDate, currentDate) > 0) {
      showToast('Invalid start date', 'error');
      return;
    }

    const newHistory = generateInitialHistory(editData.startDate).map((entry, i) => {
      if (i < editData.total) {
        return { ...entry, status: i < editData.attended ? 'present' : 'absent' };
      }
      return { ...entry, status: 'no-class' };
    });

    const newSubjects = subjects.map(s =>
      s.name === editingSubject
        ? { ...s, history: newHistory, startDate: editData.startDate }
        : s
    );

    await updateAttendance(newSubjects, true, editingSubject);
    setEditingSubject(null);
  }, [editData, editingSubject, subjects, currentDate, generateInitialHistory, updateAttendance, showToast]);

  const handleDailyUpdate = useCallback(async (date, dailyRecords) => {
    if (!isValid(date)) {
      showToast('Invalid date selected', 'error');
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    if (!isSameDay(date, currentDate)) {
      showToast('Can only update attendance for the current day', 'warning');
      return;
    }

    const newSubjects = subjects.map(sub => {
      const newStatus = dailyRecords[sub.name] || 'no-class';
      let newHistory = sub.history.filter(h => h.date !== dateStr);

      if (newStatus !== 'no-class') {
        newHistory.push({ date: dateStr, status: newStatus });
      }

      newHistory = [...new Map(newHistory.map(h => [h.date, h])).values()]
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return { ...sub, history: newHistory };
    });

    await updateAttendance(newSubjects, true);
    setActiveModal({ type: null, data: null });
  }, [subjects, currentDate, updateAttendance, showToast]);

  const handleSettingsSave = useCallback(async (subjectName, newGoal) => {
    if (newGoal < 1 || newGoal > 100) {
      showToast('Attendance goal must be between 1% and 100%', 'error');
      return;
    }

    const newSubjects = subjects.map(s =>
      s.name === subjectName ? { ...s, goal: newGoal } : s
    );

    await updateAttendance(newSubjects, true, subjectName);
    setActiveModal({ type: null, data: null });
  }, [subjects, updateAttendance, showToast]);

  const handleAddManualEntry = useCallback(async (subjectName, status) => {
    if (!newManualDate || !isSameDay(parseISO(newManualDate), currentDate)) {
      showToast('Can only add entries for the current day', 'warning');
      return;
    }

    const subject = subjects.find(s => s.name === subjectName);
    if (!subject) {
      showToast('Subject not found', 'error');
      return;
    }

    if (subject.history.some(h => h.date === newManualDate && h.status === status)) {
      showToast('This entry already exists', 'warning');
      return;
    }

    const newSubjects = subjects.map(s => {
      if (s.name === subjectName) {
        let newHistory = s.history.filter(h => h.date !== newManualDate);
        newHistory.push({ date: newManualDate, status });
        newHistory = newHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        return { ...s, history: newHistory };
      }
      return s;
    });

    await updateAttendance(newSubjects, true, subjectName);
    setNewManualDate('');
  }, [newManualDate, subjects, currentDate, updateAttendance, showToast]);

  const subjectsForSemester = useMemo(() => {
    if (!semester || !courseData || !user?.course) return [];
    const semesterContent = courseData[semester] || {};
    const officialSubjectNames = courseKey === 'MCA' && Array.isArray(semesterContent.subjects)
      ? semesterContent.subjects.map(sub => sub.name)
      : Array.isArray(semesterContent)
        ? semesterContent
        : [];
    return subjects.filter(s => officialSubjectNames.includes(s.name));
  }, [subjects, semester, courseData, courseKey, user?.course]);

  const safeSelectedDate = useMemo(() => {
    if (selectedDate && isValid(selectedDate)) {
      return selectedDate;
    }
    return currentDate;
  }, [selectedDate, currentDate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!user?.course || !semester) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      await fetchAttendance();
    };

    loadData();

    pollingRef.current = setInterval(() => {
      fetchAttendance(false);
    }, 60000);

    const syncInterval = setInterval(() => {
      processSyncQueue();
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearInterval(syncInterval);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, [user?.course, semester]);

  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
  const isExcludedRoute = location.pathname.startsWith("/login") || location.pathname === "/signup";
  const isMobile = window.innerWidth <= 768;

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

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-gray-800/80 p-8 rounded-2xl border border-gray-700 max-w-md w-full"
        >
          <Loader2 className="mx-auto h-12 w-12 text-blue-400 animate-spin" />
          <h2 className="mt-4 text-2xl font-semibold text-white">Loading Attendance Data</h2>
          <p className="mt-2 text-gray-300">Please wait while we fetch your records...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || !courseData || !semester) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-gray-800/80 p-8 rounded-2xl border border-gray-700 max-w-md w-full"
          role="alert"
        >
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-semibold text-white">Data Not Found</h2>
          <p className="mt-2 text-gray-300">Unable to load course or semester information.</p>
          <p className="mt-2 text-gray-300">Set Course and Sem Data if not set.</p>
          <button
            onClick={() => setEditModalOpen(true)}
            className="mt-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mx-auto"
            aria-label="Set Course and Sem Data"
          >
            <FileCheck2 size={18} /> Set Course and Sem Data
          </button>
        </motion.div>
        {editModalOpen && (
          <EditProfileModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            user={user}
          />
        )}
      </div>
    );
  }

  return (
    <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 p-4 pb-8 pt-20">
      <Helmet>
        <title>Attendance Manager - {user.course}</title>
        <meta name="description" content={`Manage your attendance for ${user.course} at LastMinute SCSIT.`} />
      </Helmet>
      <style>{`
        .rdp {
          --rdp-cell-size: 42px;
          --rdp-accent-color: #00A3B5;
          --rdp-background-color: rgba(17, 24, 39, 0.8);
          --rdp-outline: 2px solid #00A3B5;
          color: #E5E7EB;
          background-color: rgba(17, 24, 39, 0.8);
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
          font-family: 'Inter', sans-serif;
        }
        .rdp-day {
          transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .rdp-day:hover:not(.rdp-day_selected) {
          background-color: rgba(55, 65, 81, 0.5);
          transform: scale(1.05);
        }
        .rdp-day_selected, .rdp-day_selected:hover {
          background: linear-gradient(135deg, #00A3B5 0%, #007B8A 100%) !important;
          color: white !important;
          box-shadow: 0 0 8px rgba(0, 163, 181, 0.5);
        }
        .rdp-day_today {
          color: #00D4D4 !important;
          font-weight: 700;
          border: 2px solid #00D4D4;
          border-radius: 50%;
        }
        .rdp-day_present:not(.rdp-day_selected) {
          position: relative;
        }
        .rdp-day_present:not(.rdp-day_selected)::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #34D399;
          box-shadow: 0 0 4px rgba(52, 211, 153, 0.5);
        }
        .rdp-day_absent:not(.rdp-day_selected) {
          position: relative;
        }
        .rdp-day_absent:not(.rdp-day_selected)::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #EF4444;
          box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
        }
        .rdp-caption_label {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
        }
        .rdp-nav_button {
          color: #00A3B5;
          transition: color 0.2s ease;
        }
        .rdp-nav_button:hover {
          color: #00D4D4;
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
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 mt-4 sm:mt-3"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-teal-400 hover:text-teal-300 transition-all duration-300 hover:scale-105 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-700/50"
            aria-label="Navigate back to home"
          >
            <Home size={20} />
            <span className="font-medium">Back to Home</span>
          </button>
          <div className="w-full sm:w-auto text-white text-lg font-semibold transition-all duration-300 hover:scale-105 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-700/50 text-center sm:text-left">
            {user.course?.toUpperCase()} - {semester}{getOrdinalSuffix(parseInt(semester, 10))} Semester
          </div>
          <div className="flex items-center gap-2">
            {syncStatus.pending && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Syncing...</span>
              </div>
            )}
            <button
              onClick={() => fetchAttendance()}
              className="flex items-center gap-3 text-teal-400 hover:text-teal-300 transition-all duration-300 hover:scale-105 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-700/50"
              disabled={isSyncing}
              aria-label="Refresh attendance data"
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-4 sm:p-6 mb-8 flex flex-col lg:flex-row items-center justify-center gap-6"
        >
          <div className="flex-shrink-0">
            <DayPicker
              mode="single"
              selected={safeSelectedDate}
              onSelect={setSelectedDate}
              month={month}
              onMonthChange={setMonth}
              modifiers={{ present: presentDays, absent: absentDays }}
              modifiersClassNames={{ present: 'rdp-day_present', absent: 'rdp-day_absent' }}
              showOutsideDays
              fixedWeeks
              aria-label="Select date for attendance"
            />
          </div>
          <div className="w-full lg:max-w-sm bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <h4 className="font-semibold text-lg text-white mb-3">
              Summary for {isValid(safeSelectedDate) ? format(safeSelectedDate, 'PPP') : format(currentDate, 'PPP')}
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {dailySummary[format(safeSelectedDate, 'yyyy-MM-dd')]?.length > 0 ? (
                dailySummary[format(safeSelectedDate, 'yyyy-MM-dd')].map(rec => (
                  <div key={rec.subject} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 truncate pr-2">{rec.subject}</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${rec.status === 'present' ? 'bg-green-500/20 text-green-300' :
                      rec.status === 'absent' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                      {rec.status.charAt(0).toUpperCase() + rec.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No records for this day.</p>
              )}
            </div>
            <button
              onClick={() => {
                setModalInput({});
                setActiveModal({ type: 'editDay', data: safeSelectedDate });
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isSameDay(safeSelectedDate, currentDate)}
              aria-label="Mark or edit attendance for current day"
            >
              <Calendar size={16} /> Mark/Edit Day
            </button>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {subjectsForSemester.map((subject, index) => {
              const circleColor = subject.status === 'safe' ? 'rgba(16, 185, 129, 0.8)' :
                subject.status === 'danger' ? 'rgba(239, 68, 68, 0.8)' :
                  'rgba(107, 114, 128, 0.8)';
              const isEditing = editingSubject === subject.name;
              const todayStatusColor = subject.todayStatus === 'present' ? 'bg-green-500/10 text-green-300' :
                subject.todayStatus === 'absent' ? 'bg-red-500/10 text-red-300' :
                  subject.todayStatus === 'no-class' ? 'bg-gray-500/10 text-gray-400' :
                    'bg-yellow-500/10 text-yellow-300';

              return (
                <motion.div
                  key={subject.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 flex flex-col relative"
                  role="region"
                  aria-labelledby={`subject-${subject.name}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 id={`subject-${subject.name}`} className="text-xl font-semibold text-white truncate pr-4" title={subject.name}>
                      {subject.name}
                    </h3>
                    <div className="flex gap-2 text-gray-400 shrink-0">
                      <button
                        onClick={() => isEditing ? setEditingSubject(null) : handleEditClick(subject)}
                        className="hover:text-white transition-colors"
                        aria-label={isEditing ? `Cancel editing ${subject.name}` : `Edit ${subject.name} attendance`}
                      >
                        {isEditing ? <XCircle size={20} /> : <Edit2 size={20} />}
                      </button>
                      <button
                        onClick={() => setActiveModal({ type: 'log', data: subject })}
                        className="hover:text-white transition-colors"
                        aria-label={`View attendance log for ${subject.name}`}
                      >
                        <List size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setModalInput({ goal: subject.goal || 75 });
                          setActiveModal({ type: 'settings', data: subject });
                        }}
                        className="hover:text-white transition-colors"
                        aria-label={`Adjust settings for ${subject.name}`}
                      >
                        <Cog size={20} />
                      </button>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex-grow flex flex-col justify-center items-center"
                      >
                        <div className="w-full space-y-4">
                          <div>
                            <label htmlFor={`start-date-${subject.name}`} className="text-sm font-medium text-gray-300">
                              Start Date
                            </label>
                            <input
                              id={`start-date-${subject.name}`}
                              type="date"
                              value={editData.startDate}
                              onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                              className="w-full mt-1 p-2 bg-gray-700/50 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              max={format(currentDate, 'yyyy-MM-dd')}
                              aria-describedby={`start-date-error-${subject.name}`}
                            />
                          </div>
                          <div>
                            <label htmlFor={`attended-${subject.name}`} className="text-sm font-medium text-gray-300">
                              Attended Classes
                            </label>
                            <input
                              id={`attended-${subject.name}`}
                              type="number"
                              value={editData.attended}
                              onChange={(e) => setEditData({ ...editData, attended: Math.max(0, parseInt(e.target.value) || 0) })}
                              className="w-full mt-1 p-2 bg-gray-700/50 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              aria-describedby={`attended-error-${subject.name}`}
                            />
                          </div>
                          <div>
                            <label htmlFor={`total-${subject.name}`} className="text-sm font-medium text-gray-300">
                              Total Classes
                            </label>
                            <input
                              id={`total-${subject.name}`}
                              type="number"
                              value={editData.total}
                              onChange={(e) => setEditData({ ...editData, total: Math.max(editData.attended, parseInt(e.target.value) || 0) })}
                              className="w-full mt-1 p-2 bg-gray-700/50 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min={editData.attended}
                              aria-describedby={`total-error-${subject.name}`}
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleSaveEdit}
                          className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors py-2"
                          aria-label={`Save changes for ${subject.name}`}
                        >
                          <Save size={16} /> Save Changes
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-grow flex flex-col"
                      >
                        <div className="flex items-center justify-center my-4">
                          <div className="relative w-36 h-36">
                            <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
                              <circle
                                className="text-gray-700"
                                strokeWidth="10"
                                stroke="currentColor"
                                fill="transparent"
                                r="45"
                                cx="50"
                                cy="50"
                              />
                              <motion.circle
                                strokeWidth="10"
                                strokeDasharray="283"
                                strokeDashoffset={283}
                                animate={{ strokeDashoffset: 283 * (1 - subject.percentage / 100) }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="45"
                                cx="50"
                                cy="50"
                                style={{ color: circleColor, transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-3xl font-semibold text-white">{subject.percentage}%</span>
                              <span className="text-sm text-gray-400">{subject.attended}/{subject.total}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-around items-center my-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAttendanceChange(subject.name, 'present')}
                            className="flex flex-col items-center gap-2 text-green-400 hover:text-green-300"
                            aria-label={`Mark ${subject.name} as present for today`}
                          >
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center border-2 border-green-500">
                              <Check size={24} />
                            </div>
                            <span className="text-sm font-medium">Present</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAttendanceChange(subject.name, 'absent')}
                            className="flex flex-col items-center gap-2 text-red-400 hover:text-red-300"
                            aria-label={`Mark ${subject.name} as absent for today`}
                          >
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500">
                              <X size={24} />
                            </div>
                            <span className="text-sm font-medium">Absent</span>
                          </motion.button>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div
                            className={`p-3 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2 ${todayStatusColor}`}
                            role="status"
                            aria-label={`Today's attendance status for ${subject.name}: ${subject.todayStatus.replace('-', ' ')}`}
                          >
                            <Info size={16} />
                            <span>
                              Today: {subject.todayStatus === 'not-marked' ? 'Not Marked' : subject.todayStatus.charAt(0).toUpperCase() + subject.todayStatus.slice(1).replace('-', ' ')}
                            </span>
                          </div>
                          <div
                            className={`p-3 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2 ${subject.status === 'safe' ? 'bg-green-500/10 text-green-300' :
                              subject.status === 'danger' ? 'bg-red-500/10 text-red-300' :
                                'bg-gray-500/10 text-gray-400'
                              }`}
                            role="alert"
                          >
                            <Info size={16} /><span>{subject.message}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {lastAction && lastAction.subjectName === subject.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-4 right-4"
                    >
                      <button
                        onClick={handleUndo}
                        className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500 hover:bg-yellow-500/30"
                        aria-label={`Undo last action for ${subject.name}`}
                      >
                        <Undo2 size={12} /> Undo
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: '', type: '', show: false })}
          />
        )}
        {activeModal.type && (
          <Modal
            title={
              {
                'log': activeModal.data?.name ? `Attendance Log for ${activeModal.data.name}` : 'Attendance Log',
                'settings': activeModal.data?.name ? `Settings for ${activeModal.data.name}` : 'Settings',
                'editDay': `Edit Attendance for ${isValid(activeModal.data) ? format(activeModal.data, 'PPP') : format(currentDate, 'PPP')}`,
                'confirmReset': `Confirm Reset`,
              }[activeModal.type]
            }
            onClose={() => {
              setActiveModal({ type: null, data: null });
              setLogSortOrder('desc');
              setFilter({ type: 'all', startDate: subDays(currentDate, 30), endDate: currentDate });
              setNewManualDate('');
            }}
          >
            {activeModal.type === 'log' && activeModal.data && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-white font-semibold text-sm">
                    Total Days: {activeModal.data.history.length}
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    Attended: {activeModal.data.history.filter(h => h.status === 'present').length} |
                    Absent: {activeModal.data.history.filter(h => h.status === 'absent').length} |
                    No Class: {activeModal.data.history.filter(h => h.status === 'no-class').length}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    {['all', 'present', 'absent', 'no-class'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFilter({ ...filter, type })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter.type === type
                          ? type === 'present' ? 'bg-green-600 text-white' :
                            type === 'absent' ? 'bg-red-600 text-white' :
                              type === 'no-class' ? 'bg-gray-600 text-white' :
                                'bg-blue-600 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                          }`}
                        aria-label={`Show ${type === 'no-class' ? 'no class' : type} attendance records`}
                      >
                        {type === 'no-class' ? 'No Class' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="text-sm text-gray-300">From:</label>
                    <input
                      id="start-date"
                      type="date"
                      value={format(filter.startDate, 'yyyy-MM-dd')}
                      onChange={(e) => setFilter({ ...filter, startDate: parseISO(e.target.value) })}
                      className="bg-gray-700/50 text-white border border-gray-600 rounded-lg p-1.5 text-sm"
                      max={format(currentDate, 'yyyy-MM-dd')}
                      aria-label="Start date for filter"
                    />
                    <label htmlFor="end-date" className="text-sm text-gray-300">To:</label>
                    <input
                      id="end-date"
                      type="date"
                      value={format(filter.endDate, 'yyyy-MM-dd')}
                      onChange={(e) => setFilter({ ...filter, endDate: parseISO(e.target.value) })}
                      className="bg-gray-700/50 text-white border border-gray-600 rounded-lg p-1.5 text-sm"
                      max={format(currentDate, 'yyyy-MM-dd')}
                      aria-label="End date for filter"
                    />
                  </div>
                  <button
                    onClick={() => setLogSortOrder(logSortOrder === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 text-gray-300 hover:text-white text-sm"
                    aria-label={`Sort log ${logSortOrder === 'desc' ? 'ascending' : 'descending'}`}
                  >
                    <ArrowUpDown size={16} /> Sort {logSortOrder === 'desc' ? '↓' : '↑'}
                  </button>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input
                      type="date"
                      value={newManualDate}
                      onChange={(e) => setNewManualDate(e.target.value)}
                      className="flex-1 bg-gray-700/50 text-white border border-gray-600 rounded-lg p-1.5 text-sm"
                      max={format(currentDate, 'yyyy-MM-dd')}
                      min={activeModal.data.startDate}
                      aria-label="Select date for new manual entry"
                    />
                    <button
                      onClick={() => handleAddManualEntry(activeModal.data.name, 'present')}
                      className="px-3 py-1.5 bg-green-600/80 hover:bg-green-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                      disabled={!newManualDate || !isSameDay(parseISO(newManualDate), currentDate)}
                      aria-label="Add present manual entry for current day"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleAddManualEntry(activeModal.data.name, 'absent')}
                      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                      disabled={!newManualDate || !isSameDay(parseISO(newManualDate), currentDate)}
                      aria-label="Add absent manual entry for current day"
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => handleAddManualEntry(activeModal.data.name, 'no-class')}
                      className="px-3 py-1.5 bg-gray-600/80 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                      disabled={!newManualDate || !isSameDay(parseISO(newManualDate), currentDate)}
                      aria-label="Add no-class manual entry for current day"
                    >
                      No Class
                    </button>
                  </div>
                </div>
                <div className="space-y-2 mt-4 custom-scrollbar max-h-[40vh] overflow-y-auto">
                  {activeModal.data.history
                    .filter(h => {
                      const hDate = parseISO(h.date);
                      const isInRange = compareAsc(hDate, filter.startDate) >= 0 && compareAsc(hDate, filter.endDate) <= 0;
                      return (filter.type === 'all' || h.status === filter.type) && isInRange;
                    })
                    .sort((a, b) => {
                      const dateA = parseISO(a.date).getTime();
                      const dateB = parseISO(b.date).getTime();
                      return logSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                    })
                    .map((entry, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                        <div>
                          <p className="font-semibold text-white text-sm">
                            {format(parseISO(entry.date), 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${entry.status === 'present' ? 'bg-green-500/20 text-green-300' :
                            entry.status === 'absent' ? 'bg-red-500/20 text-red-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  {activeModal.data.history.filter(h => {
                    const hDate = parseISO(h.date);
                    const isInRange = compareAsc(hDate, filter.startDate) >= 0 && compareAsc(hDate, filter.endDate) <= 0;
                    return (filter.type === 'all' || h.status === filter.type) && isInRange;
                  }).length === 0 && (
                      <p className="text-gray-400 text-center py-8 text-sm">No matching attendance entries.</p>
                    )}
                </div>
              </div>
            )}
            {activeModal.type === 'settings' && activeModal.data && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-2">
                    Attendance Goal (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <Target size={20} className="text-gray-400" aria-hidden="true" />
                    <input
                      id="goal"
                      type="range"
                      min="1"
                      max="100"
                      value={modalInput.goal || activeModal.data.goal || 75}
                      onChange={e => setModalInput({ ...modalInput, goal: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      aria-label="Set attendance goal percentage"
                    />
                    <span className="font-semibold text-white bg-gray-700/50 px-3 py-1 rounded-md w-16 text-center text-sm">
                      {modalInput.goal || activeModal.data.goal || 75}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingsSave(activeModal.data.name, modalInput.goal || activeModal.data.goal || 75)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors py-2.5"
                  aria-label="Save attendance goal settings"
                >
                  <Save size={16} /> Save Settings
                </button>
                <div className="border-t border-gray-700 pt-4">
                  <button
                    onClick={() => setActiveModal({ type: 'confirmReset', data: activeModal.data })}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-600/80 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors py-2.5"
                    aria-label={`Reset attendance data for ${activeModal.data.name}`}
                  >
                    <RotateCcw size={16} /> Reset Attendance Data
                  </button>
                </div>
              </div>
            )}
            {activeModal.type === 'editDay' && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  {subjectsForSemester.map(subject => {
                    const dateStr = isValid(activeModal.data) ? format(activeModal.data, 'yyyy-MM-dd') : '';
                    const currentStatus = subject.history.find(h => h.date === dateStr)?.status || 'no-class';
                    return (
                      <div key={subject.name}>
                        <p className="font-semibold text-white text-sm mb-2">{subject.name}</p>
                        <div className="flex gap-2">
                          {['present', 'absent', 'no-class'].map(status => (
                            <button
                              key={status}
                              onClick={() => setModalInput({ ...modalInput, [subject.name]: status })}
                              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${(modalInput[subject.name] || currentStatus) === status
                                ? status === 'present'
                                  ? 'bg-green-500/80 text-white hover:bg-green-600'
                                  : status === 'absent'
                                    ? 'bg-red-500/80 text-white hover:bg-red-600'
                                    : 'bg-gray-500/80 text-white hover:bg-gray-600'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              disabled={!isSameDay(activeModal.data, currentDate)}
                              aria-label={`Mark ${subject.name} as ${status.replace('-', ' ')} for current day`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => handleDailyUpdate(activeModal.data, modalInput)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors py-2.5 mt-4 sticky bottom-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isValid(activeModal.data) || !isSameDay(activeModal.data, currentDate)}
                  aria-label="Save daily attendance log for current day"
                >
                  <Save size={16} /> Save Daily Log
                </button>
              </div>
            )}
            {activeModal.type === 'confirmReset' && activeModal.data && (
              <div className="space-y-6 text-center">
                <p className="text-gray-300 text-sm">
                  Are you sure you want to reset all attendance data for <strong className="text-white">{activeModal.data.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveModal({ type: null, data: null })}
                    className="w-full flex items-center justify-center gap-2 bg-gray-600/80 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors py-2.5"
                    aria-label="Cancel reset"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => resetSubjectAttendance(activeModal.data.name)}
                    className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors py-2.5"
                    aria-label={`Confirm reset for ${activeModal.data.name}`}
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceManager;