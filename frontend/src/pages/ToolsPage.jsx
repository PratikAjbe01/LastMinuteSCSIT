"use client";

import { useState, useMemo, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { ArrowLeft, Calculator, CheckCircle, AlertTriangle, X, RotateCcw, Trash2, Edit, Save, Upload, Download, BarChart2, Plus, Info, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { evaluate, create, all } from "mathjs";
import { useSwipeable } from "react-swipeable";
import { ValuesContext } from "../context/ValuesContext";
import CelebrationEffect from "../components/CelebrationEffect";

const math = create(all);
math.import({
  customFactorial: (n) => {
    if (!Number.isInteger(n) || n < 0) throw new Error("Factorial requires a non-negative integer");
    return math.factorial(n);
  },
  nPr: (n, r) => {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < r || r < 0) throw new Error("Invalid nPr inputs");
    return math.factorial(n) / math.factorial(n - r);
  },
  nCr: (n, r) => {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < r || r < 0) throw new Error("Invalid nCr inputs");
    return math.factorial(n) / (math.factorial(r) * math.factorial(n - r));
  },
}, { override: false });

const Modal = ({ children, onClose, title }) => (
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
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-gray-900/95 rounded-3xl border border-gray-700/50 w-full max-w-2xl shadow-2xl shadow-black/50"
      onClick={(e) => e.stopPropagation()}
      role="document"
    >
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800">
        <h3 id="modal-title" className="text-xl sm:text-2xl font-bold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-gray-800/50"
          aria-label="Close modal"
        >
          <X size={22} />
        </button>
      </div>
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">{children}</div>
    </motion.div>
  </motion.div>
);

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 50, scale: 0.9 }}
    className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 p-4 sm:px-6 sm:py-4 rounded-2xl shadow-2xl text-white backdrop-blur-xl z-50 ${type === "error"
        ? "bg-red-500/90 shadow-red-500/30"
        : type === "warning"
          ? "bg-orange-500/90 shadow-orange-500/30"
          : "bg-green-500/90 shadow-green-500/30"
      }`}
    role="alert"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {type === "error" ? (
          <AlertTriangle size={20} />
        ) : (
          <CheckCircle size={20} />
        )}
        <span className="font-medium flex-1">{message}</span>
      </div>
      <button onClick={onClose} className="text-white/80 hover:text-white ml-4" aria-label="Close toast">
        <X size={18} />
      </button>
    </div>
  </motion.div>
);

const CGPACalculator = ({ showToast }) => {
  const [semesters, setSemesters] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSemesterIndex, setEditSemesterIndex] = useState(null);
  const [useCredits, setUseCredits] = useState(true);
  const [newSemester, setNewSemester] = useState({
    semester: "",
    subjects: [{ name: "", credits: "", grade: "", marks: "" }],
  });
  const [gradeSystem, setGradeSystem] = useState("standard");
  const fileInputRef = useRef(null);

  const gradeSystems = {
    standard: { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "D": 4, "F": 0 },
    custom: { "A++": 10, "A+": 9, "A": 8.5, "B+": 8, "B": 7, "C": 6, "D": 5, "F": 0 },
  };

  const marksToGrade = (marks, system = gradeSystem) => {
    marks = parseFloat(marks);
    if (isNaN(marks) || marks < 0 || marks > 100) return null;
    if (system === "standard") {
      if (marks >= 90) return "O";
      if (marks >= 80) return "A+";
      if (marks >= 70) return "A";
      if (marks >= 60) return "B+";
      if (marks >= 50) return "B";
      if (marks >= 40) return "C";
      if (marks >= 35) return "D";
      return "F";
    } else {
      if (marks >= 95) return "A++";
      if (marks >= 85) return "A+";
      if (marks >= 75) return "A";
      if (marks >= 65) return "B+";
      if (marks >= 55) return "B";
      if (marks >= 45) return "C";
      if (marks >= 35) return "D";
      return "F";
    }
  };

  const calculateCGPA = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;
    semesters.forEach((sem) => {
      sem.subjects.forEach((sub) => {
        const credits = parseFloat(sub.credits) || 0;
        const points = useCredits
          ? gradeSystems[gradeSystem][sub.grade] || 0
          : gradeSystems[gradeSystem][marksToGrade(sub.marks, gradeSystem)] || 0;
        totalCredits += credits;
        totalPoints += credits * points;
      });
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(3) : "0.000";
  }, [semesters, useCredits, gradeSystem]);

  const calculateStats = useMemo(() => {
    const stats = { highest: 0, lowest: 10, average: 0, totalCredits: 0, semesterGPAs: [] };
    let totalPoints = 0;
    semesters.forEach((sem, index) => {
      let semCredits = 0;
      let semPoints = 0;
      sem.subjects.forEach((sub) => {
        const credits = parseFloat(sub.credits) || 0;
        const points = useCredits
          ? gradeSystems[gradeSystem][sub.grade] || 0
          : gradeSystems[gradeSystem][marksToGrade(sub.marks, gradeSystem)] || 0;
        stats.highest = Math.max(stats.highest, points);
        stats.lowest = Math.min(stats.lowest, points);
        totalPoints += points * credits;
        stats.totalCredits += credits;
        semCredits += credits;
        semPoints += credits * points;
      });
      stats.semesterGPAs.push(semCredits > 0 ? (semPoints / semCredits).toFixed(3) : "0.000");
    });
    stats.average = stats.totalCredits > 0 ? (totalPoints / stats.totalCredits).toFixed(3) : "0.000";
    return stats;
  }, [semesters, useCredits, gradeSystem]);

  const validateSubject = (subject) => {
    if (!subject.name) return "Subject name is required.";
    if (!subject.credits || isNaN(subject.credits) || subject.credits <= 0 || subject.credits > 10) return "Credits must be between 0.1 and 10.";
    if (useCredits && (!subject.grade || !gradeSystems[gradeSystem][subject.grade])) return `Valid grade (${Object.keys(gradeSystems[gradeSystem]).join(", ")}) is required.`;
    if (!useCredits && (isNaN(subject.marks) || subject.marks < 0 || subject.marks > 100)) return "Marks must be between 0 and 100.";
    return null;
  };

  const validateImportData = (data) => {
    if (!Array.isArray(data)) return "Data must be an array of semesters.";
    for (const sem of data) {
      if (!sem.semester || typeof sem.semester !== "string") return "Each semester must have a valid name.";
      if (!Array.isArray(sem.subjects)) return "Each semester must have an array of subjects.";
      for (const sub of sem.subjects) {
        if (!sub.name || typeof sub.name !== "string") return "Each subject must have a valid name.";
        if (!sub.credits || isNaN(sub.credits) || sub.credits <= 0 || sub.credits > 10) return "Each subject must have valid credits between 0.1 and 10.";
        if (useCredits && (!sub.grade || !gradeSystems[gradeSystem][sub.grade])) return `Each subject must have a valid grade (${Object.keys(gradeSystems[gradeSystem]).join(", ")}).`;
        if (!useCredits && (isNaN(sub.marks) || sub.marks < 0 || sub.marks > 100)) return "Each subject must have valid marks between 0 and 100.";
      }
    }
    return null;
  };

  const handleAddSemester = () => {
    const errors = newSemester.subjects.map(validateSubject).filter((e) => e);
    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }
    if (!newSemester.semester) {
      showToast("Semester name is required.", "error");
      return;
    }
    if (editSemesterIndex !== null) {
      const updatedSemesters = [...semesters];
      updatedSemesters[editSemesterIndex] = { ...newSemester };
      setSemesters(updatedSemesters);
      setEditSemesterIndex(null);
      showToast("Semester updated successfully", "success");
    } else {
      setSemesters([...semesters, { ...newSemester }]);
      showToast("Semester added successfully", "success");
    }
    setNewSemester({ semester: "", subjects: [{ name: "", credits: "", grade: "", marks: "" }] });
    setModalOpen(false);
  };

  const handleEditSemester = (index) => {
    setNewSemester({ ...semesters[index] });
    setEditSemesterIndex(index);
    setModalOpen(true);
  };

  const handleDeleteSemester = (index) => {
    setSemesters(semesters.filter((_, i) => i !== index));
    showToast("Semester deleted successfully", "success");
  };

  const addSubjectField = () => {
    setNewSemester({
      ...newSemester,
      subjects: [...newSemester.subjects, { name: "", credits: "", grade: "", marks: "" }],
    });
  };

  const removeSubjectField = (index) => {
    setNewSemester({
      ...newSemester,
      subjects: newSemester.subjects.filter((_, i) => i !== index),
    });
  };

  const handleReset = () => {
    setSemesters([]);
    setGradeSystem("standard");
    showToast("CGPA data reset", "success");
  };

  const handleExport = () => {
    const data = JSON.stringify(semesters);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cgpa_data.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully", "success");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      showToast("Only JSON files are allowed.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        const validationError = validateImportData(importedData);
        if (validationError) {
          showToast(validationError, "error");
          return;
        }
        setSemesters(importedData);
        showToast("Data imported successfully", "success");
      } catch {
        showToast("Error reading file or invalid JSON format.", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/50 p-4 sm:p-8 shadow-2xl"
    >
      <Helmet>
        <title>CGPA Calculator | Tools LastMinuteSCSIT</title>
        <meta name="description" content="Calculate and manage your CGPA with ease. Add subjects, set credits, and visualize your academic performance." />
      </Helmet>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/20 rounded-2xl">
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">CGPA Calculator</h2>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Cumulative Grade Point Average</p>
          </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <p className="text-4xl sm:text-5xl font-bold text-teal-400">{calculateCGPA}</p>
          <p className="text-sm text-gray-400 mt-1">Current CGPA</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 text-gray-300 bg-gray-800/50 rounded-xl px-4 py-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={useCredits}
              onChange={() => setUseCredits(!useCredits)}
              className="w-5 h-5 accent-teal-500 rounded"
              aria-label="Toggle between grade and marks input"
            />
            <span className="font-medium">Use Grades</span>
          </motion.label>
          <select
            value={gradeSystem}
            onChange={(e) => setGradeSystem(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            aria-label="Select grading system"
          >
            <option value="standard">Standard Grading</option>
            <option value="custom">Custom Grading</option>
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Reset CGPA data"
          >
            <RotateCcw size={16} /> <span className="hidden sm:inline">Reset</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Export CGPA data"
          >
            <Download size={16} /> <span className="hidden sm:inline">Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Import CGPA data"
          >
            <Upload size={16} /> <span className="hidden sm:inline">Import</span>
          </motion.button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
            aria-label="Upload CGPA data file"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setNewSemester({ semester: "", subjects: [{ name: "", credits: "", grade: "", marks: "" }] });
          setEditSemesterIndex(null);
          setModalOpen(true);
        }}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold rounded-xl py-3 sm:py-4 mb-8 transition-all duration-200 shadow-lg shadow-teal-500/20"
        aria-label="Add new semester"
      >
        <Plus size={20} /> Add Semester
      </motion.button>

      {semesters.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {semesters.map((sem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-800/50 p-4 sm:p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{sem.semester}</h3>
                    <p className="text-sm text-gray-400">GPA: {calculateStats.semesterGPAs[index]}</p>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditSemester(index)}
                      className="p-2 text-gray-400 hover:text-teal-400 transition-colors"
                      aria-label={`Edit semester ${sem.semester}`}
                    >
                      <Edit size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteSemester(index)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label={`Delete semester ${sem.semester}`}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
                <div className="space-y-2">
                  {sem.subjects.map((sub, subIndex) => (
                    <div key={subIndex} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-300 py-1 gap-2">
                      <span className="font-medium truncate">{sub.name}</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-gray-400">{sub.credits} credits</span>
                        <span className="px-2 py-1 bg-gray-700/50 rounded text-xs font-semibold">
                          {useCredits ? sub.grade : `${sub.marks} (${marksToGrade(sub.marks, gradeSystem)})`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-6">Performance Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-teal-400">{calculateStats.highest.toFixed(1)}</p>
                <p className="text-sm text-gray-400 mt-1">Highest Grade</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-orange-400">{calculateStats.lowest.toFixed(1)}</p>
                <p className="text-sm text-gray-400 mt-1">Lowest Grade</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">{calculateStats.average}</p>
                <p className="text-sm text-gray-400 mt-1">Average Grade</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-purple-400">{calculateStats.totalCredits.toFixed(0)}</p>
                <p className="text-sm text-gray-400 mt-1">Total Credits</p>
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-white mb-4">Semester Progress</h4>
              <div className="space-y-3">
                {calculateStats.semesterGPAs.map((gpa, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-24 sm:w-32 text-sm text-gray-300 font-medium">Semester {index + 1}</span>
                    <div className="flex-1 bg-gray-700/50 rounded-full h-6 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-teal-500 to-teal-400 h-full flex items-center justify-end px-3"
                        initial={{ width: 0 }}
                        animate={{ width: `${(gpa / 10) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <span className="text-xs text-white font-semibold">{gpa}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-4">
            <Info size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">No semesters added yet.</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Semester" to get started</p>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editSemesterIndex !== null ? "Edit Semester" : "Add Semester"}
            onClose={() => {
              setModalOpen(false);
              setEditSemesterIndex(null);
            }}
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="semester-name" className="text-sm font-medium text-gray-300 mb-2 block">
                  Semester Name
                </label>
                <input
                  id="semester-name"
                  type="text"
                  value={newSemester.semester}
                  onChange={(e) => setNewSemester({ ...newSemester, semester: e.target.value })}
                  placeholder="e.g., Semester 1"
                  className="w-full mt-1 p-3 bg-gray-800/50 rounded-xl border border-gray-700 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  aria-label="Semester name"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Subjects</h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addSubjectField}
                    className="flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-medium"
                    aria-label="Add another subject"
                  >
                    <Plus size={18} /> Add Subject
                  </motion.button>
                </div>
                {newSemester.subjects.map((sub, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-3 items-center bg-gray-800/30 p-3 rounded-xl"
                  >
                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={sub.name}
                      onChange={(e) => {
                        const updatedSubjects = [...newSemester.subjects];
                        updatedSubjects[index].name = e.target.value;
                        setNewSemester({ ...newSemester, subjects: updatedSubjects });
                      }}
                      className="flex-1 w-full sm:w-auto p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      aria-label={`Subject name ${index + 1}`}
                    />
                    <div className="flex w-full sm:w-auto gap-3">
                      <input
                        type="number"
                        placeholder="Credits"
                        value={sub.credits}
                        onChange={(e) => {
                          const updatedSubjects = [...newSemester.subjects];
                          updatedSubjects[index].credits = e.target.value;
                          setNewSemester({ ...newSemester, subjects: updatedSubjects });
                        }}
                        className="flex-1 w-full sm:w-24 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        min="0.1"
                        step="0.1"
                        max="10"
                        aria-label={`Credits for subject ${index + 1}`}
                      />
                      {useCredits ? (
                        <select
                          value={sub.grade}
                          onChange={(e) => {
                            const updatedSubjects = [...newSemester.subjects];
                            updatedSubjects[index].grade = e.target.value;
                            setNewSemester({ ...newSemester, subjects: updatedSubjects });
                          }}
                          className="flex-1 w-full sm:w-24 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                          aria-label={`Grade for subject ${index + 1}`}
                        >
                          <option value="">Grade</option>
                          {Object.keys(gradeSystems[gradeSystem]).map((grade) => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          placeholder="Marks"
                          value={sub.marks}
                          onChange={(e) => {
                            const updatedSubjects = [...newSemester.subjects];
                            updatedSubjects[index].marks = e.target.value;
                            setNewSemester({ ...newSemester, subjects: updatedSubjects });
                          }}
                          className="flex-1 w-full sm:w-24 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                          min="0"
                          max="100"
                          step="0.1"
                          aria-label={`Marks for subject ${index + 1}`}
                        />
                      )}
                      {newSemester.subjects.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeSubjectField(index)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          aria-label={`Remove subject ${index + 1}`}
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddSemester}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold rounded-xl py-3 transition-all shadow-lg shadow-teal-500/20"
                aria-label="Save semester"
              >
                <Save size={18} /> {editSemesterIndex !== null ? "Update Semester" : "Save Semester"}
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SGPACalculator = ({ showToast }) => {
  const [subjects, setSubjects] = useState([{ name: "", credits: "", grade: "", marks: "" }]);
  const [useCredits, setUseCredits] = useState(true);
  const [gradeSystem, setGradeSystem] = useState("standard");
  const fileInputRef = useRef(null);

  const gradeSystems = {
    standard: { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "D": 4, "F": 0 },
    custom: { "A++": 10, "A+": 9, "A": 8.5, "B+": 8, "B": 7, "C": 6, "D": 5, "F": 0 },
  };

  const marksToGrade = (marks, system = gradeSystem) => {
    marks = parseFloat(marks);
    if (isNaN(marks) || marks < 0 || marks > 100) return null;
    if (system === "standard") {
      if (marks >= 90) return "O";
      if (marks >= 80) return "A+";
      if (marks >= 70) return "A";
      if (marks >= 60) return "B+";
      if (marks >= 50) return "B";
      if (marks >= 40) return "C";
      if (marks >= 35) return "D";
      return "F";
    } else {
      if (marks >= 95) return "A++";
      if (marks >= 85) return "A+";
      if (marks >= 75) return "A";
      if (marks >= 65) return "B+";
      if (marks >= 55) return "B";
      if (marks >= 45) return "C";
      if (marks >= 35) return "D";
      return "F";
    }
  };

  const calculateSGPA = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;
    subjects.forEach((sub) => {
      const credits = parseFloat(sub.credits) || 0;
      const points = useCredits
        ? gradeSystems[gradeSystem][sub.grade] || 0
        : gradeSystems[gradeSystem][marksToGrade(sub.marks, gradeSystem)] || 0;
      totalCredits += credits;
      totalPoints += credits * points;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(3) : "0.000";
  }, [subjects, useCredits, gradeSystem]);

  const calculateStats = useMemo(() => {
    const stats = { highest: 0, lowest: 10, average: 0, totalCredits: 0, subjectGPAs: [] };
    let totalPoints = 0;
    subjects.forEach((sub) => {
      const credits = parseFloat(sub.credits) || 0;
      const points = useCredits
        ? gradeSystems[gradeSystem][sub.grade] || 0
        : gradeSystems[gradeSystem][marksToGrade(sub.marks, gradeSystem)] || 0;
      stats.highest = Math.max(stats.highest, points);
      stats.lowest = Math.min(stats.lowest, points);
      totalPoints += points * credits;
      stats.totalCredits += credits;
      stats.subjectGPAs.push(points.toFixed(3));
    });
    stats.average = stats.totalCredits > 0 ? (totalPoints / stats.totalCredits).toFixed(3) : "0.000";
    return stats;
  }, [subjects, useCredits, gradeSystem]);

  const validateSubject = (subject) => {
    if (!subject.name) return "Subject name is required.";
    if (!subject.credits || isNaN(subject.credits) || subject.credits <= 0 || subject.credits > 10) return "Credits must be between 0.1 and 10.";
    if (useCredits && (!subject.grade || !gradeSystems[gradeSystem][subject.grade])) return `Valid grade (${Object.keys(gradeSystems[gradeSystem]).join(", ")}) is required.`;
    if (!useCredits && (isNaN(subject.marks) || subject.marks < 0 || subject.marks > 100)) return "Marks must be between 0 and 100.";
    return null;
  };

  const validateImportData = (data) => {
    if (!Array.isArray(data)) return "Data must be an array of subjects.";
    for (const sub of data) {
      if (!sub.name || typeof sub.name !== "string") return "Each subject must have a valid name.";
      if (!sub.credits || isNaN(sub.credits) || sub.credits <= 0 || sub.credits > 10) return "Each subject must have valid credits between 0.1 and 10.";
      if (useCredits && (!sub.grade || !gradeSystems[gradeSystem][sub.grade])) return `Each subject must have a valid grade (${Object.keys(gradeSystems[gradeSystem]).join(", ")}).`;
      if (!useCredits && (isNaN(sub.marks) || sub.marks < 0 || sub.marks > 100)) return "Each subject must have valid marks between 0 and 100.";
    }
    return null;
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: "", credits: "", grade: "", marks: "" }]);
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    const errors = subjects.map(validateSubject).filter((e) => e);
    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }
    showToast(`SGPA: ${calculateSGPA}`, "success");
  };

  const handleReset = () => {
    setSubjects([{ name: "", credits: "", grade: "", marks: "" }]);
    setGradeSystem("standard");
    showToast("SGPA data reset", "success");
  };

  const handleExport = () => {
    const data = JSON.stringify(subjects);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sgpa_data.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully", "success");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      showToast("Only JSON files are allowed.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        const validationError = validateImportData(importedData);
        if (validationError) {
          showToast(validationError, "error");
          return;
        }
        setSubjects(importedData);
        showToast("Data imported successfully", "success");
      } catch {
        showToast("Error reading file or invalid JSON format.", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/50 p-4 sm:p-8 shadow-2xl"
    >
      <Helmet>
        <title>SGPA Calculator | Tools LastMinuteSCSIT</title>
        <meta name="description" content="Calculate and manage your SGPA with ease. Add subjects, set credits, and visualize your academic performance." />
      </Helmet>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl">
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">SGPA Calculator</h2>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Semester Grade Point Average</p>
          </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <p className="text-4xl sm:text-5xl font-bold text-blue-400">{calculateSGPA}</p>
          <p className="text-sm text-gray-400 mt-1">Current SGPA</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 text-gray-300 bg-gray-800/50 rounded-xl px-4 py-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={useCredits}
              onChange={() => setUseCredits(!useCredits)}
              className="w-5 h-5 accent-blue-500 rounded"
              aria-label="Toggle between grade and marks input"
            />
            <span className="font-medium">Use Grades</span>
          </motion.label>
          <select
            value={gradeSystem}
            onChange={(e) => setGradeSystem(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            aria-label="Select grading system"
          >
            <option value="standard">Standard Grading</option>
            <option value="custom">Custom Grading</option>
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Reset SGPA data"
          >
            <RotateCcw size={16} /> <span className="hidden sm:inline">Reset</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Export SGPA data"
          >
            <Download size={16} /> <span className="hidden sm:inline">Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Import SGPA data"
          >
            <Upload size={16} /> <span className="hidden sm:inline">Import</span>
          </motion.button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
            aria-label="Upload SGPA data file"
          />
        </div>
      </div>

      <div className="space-y-4">
        {subjects.map((sub, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex flex-col sm:flex-row gap-3 items-center bg-gray-800/30 p-3 rounded-xl"
          >
            <input
              type="text"
              placeholder="Subject Name"
              value={sub.name}
              onChange={(e) => {
                const updatedSubjects = [...subjects];
                updatedSubjects[index].name = e.target.value;
                setSubjects(updatedSubjects);
              }}
              className="flex-1 w-full sm:w-auto p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              aria-label={`Subject name ${index + 1}`}
            />
            <div className="flex w-full sm:w-auto gap-3">
              <input
                type="number"
                placeholder="Credits"
                value={sub.credits}
                onChange={(e) => {
                  const updatedSubjects = [...subjects];
                  updatedSubjects[index].credits = e.target.value;
                  setSubjects(updatedSubjects);
                }}
                className="flex-1 w-full sm:w-24 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                min="0.1"
                step="0.1"
                max="10"
                aria-label={`Credits for subject ${index + 1}`}
              />
              {useCredits ? (
                <select
                  value={sub.grade}
                  onChange={(e) => {
                    const updatedSubjects = [...subjects];
                    updatedSubjects[index].grade = e.target.value;
                    setSubjects(updatedSubjects);
                  }}
                  className="flex-1 w-full sm:w-24 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  aria-label={`Grade for subject ${index + 1}`}
                >
                  <option value="">Grade</option>
                  {Object.keys(gradeSystems[gradeSystem]).map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  placeholder="Marks"
                  value={sub.marks}
                  onChange={(e) => {
                    const updatedSubjects = [...subjects];
                    updatedSubjects[index].marks = e.target.value;
                    setSubjects(updatedSubjects);
                  }}
                  className="flex-1 w-full sm:w-24 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="0"
                  max="100"
                  step="0.1"
                  aria-label={`Marks for subject ${index + 1}`}
                />
              )}
              {subjects.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveSubject(index)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  aria-label={`Remove subject ${index + 1}`}
                >
                  <Trash2 size={18} />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddSubject}
          className="w-full bg-gray-700/50 hover:bg-gray-700/70 text-white font-semibold rounded-xl py-3 transition-all"
          aria-label="Add another subject"
        >
          <Plus size={20} className="inline mr-2" />
          Add Subject
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCalculate}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl py-4 transition-all shadow-lg shadow-blue-500/20"
          aria-label="Calculate SGPA"
        >
          <Calculator size={20} /> Calculate SGPA
        </motion.button>
        {calculateSGPA !== "0.000" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"
          >
            <h3 className="text-xl font-bold text-white mb-6">Performance Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-green-400">{calculateStats.highest}</p>
                <p className="text-sm text-gray-400 mt-1">Highest Grade</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-orange-400">{calculateStats.lowest}</p>
                <p className="text-sm text-gray-400 mt-1">Lowest Grade</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">{calculateStats.average}</p>
                <p className="text-sm text-gray-400 mt-1">Average Grade</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-purple-400">{calculateStats.totalCredits.toFixed(0)}</p>
                <p className="text-sm text-gray-400 mt-1">Total Credits</p>
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-white mb-4">Subject Grade Points</h4>
              <div className="space-y-3">
                {subjects.map((sub, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-24 sm:w-40 text-sm text-gray-300 font-medium truncate">{sub.name || "Subject " + (index + 1)}</span>
                    <div className="flex-1 bg-gray-700/50 rounded-full h-6 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-full flex items-center justify-end px-3"
                        initial={{ width: 0 }}
                        animate={{ width: `${(calculateStats.subjectGPAs[index] / 10) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <span className="text-xs text-white font-semibold">{calculateStats.subjectGPAs[index]}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const AttendanceCalculator = ({ showToast }) => {
  const [subjects, setSubjects] = useState([{ name: "", attended: "", total: "", minAttendance: 75 }]);
  const [targetAttendance, setTargetAttendance] = useState(75);
  const [showChart, setShowChart] = useState(false);
  const fileInputRef = useRef(null);

  const calculateAttendance = useMemo(() => {
    let totalAttended = 0;
    let totalClasses = 0;
    const subjectPercentages = [];
    subjects.forEach((sub) => {
      const attended = parseInt(sub.attended) || 0;
      const total = parseInt(sub.total) || 0;
      totalAttended += attended;
      totalClasses += total;
      subjectPercentages.push(total > 0 ? ((attended / total) * 100).toFixed(2) : "0.00");
    });
    const percentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(2) : "0.00";
    const classesNeeded = subjects.map((sub) => {
      const attended = parseInt(sub.attended) || 0;
      const total = parseInt(sub.total) || 0;
      const minAttendance = parseFloat(sub.minAttendance) || 75;
      if (total === 0) return 0;
      const required = Math.ceil((minAttendance / 100) * total - attended);
      return required > 0 ? required : 0;
    });
    const totalClassesNeeded = Math.ceil((targetAttendance / 100) * totalClasses - totalAttended);
    const bunkableClasses = subjects.map((sub) => {
      const attended = parseInt(sub.attended) || 0;
      const total = parseInt(sub.total) || 0;
      const minAttendance = parseFloat(sub.minAttendance) || 75;
      if (total === 0) return 0;
      const maxBunk = Math.floor(attended / (minAttendance / 100) - total);
      return maxBunk > 0 ? maxBunk : 0;
    });
    return { percentage, classesNeeded, totalClassesNeeded: totalClassesNeeded > 0 ? totalClassesNeeded : 0, subjectPercentages, bunkableClasses };
  }, [subjects, targetAttendance]);

  const validateSubject = (subject) => {
    if (!subject.name) return "Subject name is required.";
    if (isNaN(subject.attended) || subject.attended < 0) return "Attended classes must be non-negative.";
    if (isNaN(subject.total) || subject.total < 0 || subject.total < subject.attended) return "Total classes must be non-negative and at least attended classes.";
    if (isNaN(subject.minAttendance) || subject.minAttendance < 0 || subject.minAttendance > 100) return "Minimum attendance must be between 0 and 100.";
    return null;
  };

  const validateImportData = (data) => {
    if (!data.subjects || !Array.isArray(data.subjects)) return "Data must include an array of subjects.";
    if (!data.targetAttendance || isNaN(data.targetAttendance) || data.targetAttendance < 0 || data.targetAttendance > 100) return "Target attendance must be between 0 and 100.";
    for (const sub of data.subjects) {
      if (!sub.name || typeof sub.name !== "string") return "Each subject must have a valid name.";
      if (isNaN(sub.attended) || sub.attended < 0) return "Each subject must have valid non-negative attended classes.";
      if (isNaN(sub.total) || sub.total < 0 || sub.total < sub.attended) return "Each subject must have valid total classes.";
      if (isNaN(sub.minAttendance) || sub.minAttendance < 0 || sub.minAttendance > 100) return "Each subject must have valid minimum attendance between 0 and 100.";
    }
    return null;
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: "", attended: "", total: "", minAttendance: 75 }]);
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    const errors = subjects.map(validateSubject).filter((e) => e);
    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }
    showToast(`Overall Attendance: ${calculateAttendance.percentage}%`, "success");
  };

  const handleReset = () => {
    setSubjects([{ name: "", attended: "", total: "", minAttendance: 75 }]);
    setTargetAttendance(75);
    setShowChart(false);
    showToast("Attendance data reset", "success");
  };

  const handleExport = () => {
    const data = JSON.stringify({ subjects, targetAttendance });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_data.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully", "success");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      showToast("Only JSON files are allowed.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        const validationError = validateImportData(importedData);
        if (validationError) {
          showToast(validationError, "error");
          return;
        }
        setSubjects(importedData.subjects);
        setTargetAttendance(importedData.targetAttendance);
        showToast("Data imported successfully", "success");
      } catch {
        showToast("Error reading file or invalid JSON format.", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/50 p-4 sm:p-8 shadow-2xl"
    >
      <Helmet>
        <title>Attendance Calculator | Tools LastMinuteSCSIT</title>
        <meta name="description" content="Calculate and manage your attendance with ease. Set target attendance, track subjects, and visualize your attendance data." />
      </Helmet>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-2xl">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Attendance Calculator</h2>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Track your class attendance</p>
          </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <p className="text-4xl sm:text-5xl font-bold text-purple-400">{calculateAttendance.percentage}%</p>
          <p className="text-sm text-gray-400 mt-1">Overall Attendance</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-4 py-2">
          <label htmlFor="target-attendance" className="text-gray-300 font-medium">Target:</label>
          <input
            id="target-attendance"
            type="number"
            value={targetAttendance}
            onChange={(e) => setTargetAttendance(parseFloat(e.target.value) || 0)}
            className="w-20 p-2 bg-transparent border-b border-gray-600 text-white focus:border-purple-400 transition-all outline-none"
            min="0"
            max="100"
            step="0.1"
            aria-label="Target attendance percentage"
          />
          <span className="text-gray-300">%</span>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Reset attendance data"
          >
            <RotateCcw size={16} /> <span className="hidden sm:inline">Reset</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Export attendance data"
          >
            <Download size={16} /> <span className="hidden sm:inline">Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Import attendance data"
          >
            <Upload size={16} /> <span className="hidden sm:inline">Import</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChart(!showChart)}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold rounded-xl py-2 px-3 sm:px-4 transition-all duration-200 text-sm"
            aria-label="Toggle attendance chart"
          >
            <BarChart2 size={16} /> <span className="hidden sm:inline">{showChart ? "Hide" : "Show"}</span>
          </motion.button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
            aria-label="Upload attendance data file"
          />
        </div>
      </div>

      <div className="space-y-4">
        {subjects.map((sub, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex flex-col sm:flex-row gap-3 items-center bg-gray-800/30 p-3 rounded-xl"
          >
            <input
              type="text"
              placeholder="Subject Name"
              value={sub.name}
              onChange={(e) => {
                const updatedSubjects = [...subjects];
                updatedSubjects[index].name = e.target.value;
                setSubjects(updatedSubjects);
              }}
              className="flex-1 w-full sm:w-auto p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              aria-label={`Subject name ${index + 1}`}
            />
            <div className="flex w-full sm:w-auto gap-3 flex-wrap">
              <input
                type="number"
                placeholder="Attended"
                value={sub.attended}
                onChange={(e) => {
                  const updatedSubjects = [...subjects];
                  updatedSubjects[index].attended = e.target.value;
                  setSubjects(updatedSubjects);
                }}
                className="flex-1 min-w-[80px] p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                min="0"
                aria-label={`Attended classes for subject ${index + 1}`}
              />
              <input
                type="number"
                placeholder="Total"
                value={sub.total}
                onChange={(e) => {
                  const updatedSubjects = [...subjects];
                  updatedSubjects[index].total = e.target.value;
                  setSubjects(updatedSubjects);
                }}
                className="flex-1 min-w-[80px] p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                min="0"
                aria-label={`Total classes for subject ${index + 1}`}
              />
              <input
                type="number"
                placeholder="Min %"
                value={sub.minAttendance}
                onChange={(e) => {
                  const updatedSubjects = [...subjects];
                  updatedSubjects[index].minAttendance = e.target.value;
                  setSubjects(updatedSubjects);
                }}
                className="flex-1 min-w-[80px] p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                min="0"
                max="100"
                step="0.1"
                aria-label={`Minimum attendance for subject ${index + 1}`}
              />
            </div>
            {subjects.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemoveSubject(index)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                aria-label={`Remove subject ${index + 1}`}
              >
                <Trash2 size={18} />
              </motion.button>
            )}
          </motion.div>
        ))}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddSubject}
          className="w-full bg-gray-700/50 hover:bg-gray-700/70 text-white font-semibold rounded-xl py-3 transition-all"
          aria-label="Add another subject"
        >
          <Plus size={20} className="inline mr-2" />
          Add Subject
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCalculate}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-xl py-4 transition-all shadow-lg shadow-purple-500/20"
          aria-label="Calculate attendance"
        >
          <Calculator size={20} /> Calculate Attendance
        </motion.button>
        {calculateAttendance.percentage !== "0.00" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Attendance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 mb-2 flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-400" />
                    Classes Needed for Target ({targetAttendance}%)
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {calculateAttendance.totalClassesNeeded} classes
                  </p>
                  {calculateAttendance.classesNeeded.some((n) => n > 0) && (
                    <div className="mt-3 space-y-1">
                      {subjects.map((sub, index) => (
                        calculateAttendance.classesNeeded[index] > 0 && (
                          <p key={index} className="text-sm text-gray-300">
                            {sub.name}: {calculateAttendance.classesNeeded[index]} more
                          </p>
                        )
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 mb-2 flex items-center gap-2">
                    <TrendingDown size={16} className="text-orange-400" />
                    Bunkable Classes
                  </p>
                  {calculateAttendance.bunkableClasses.some((n) => n > 0) ? (
                    <div className="space-y-1">
                      {subjects.map((sub, index) => (
                        calculateAttendance.bunkableClasses[index] > 0 && (
                          <p key={index} className="text-sm text-gray-300">
                            {sub.name}: {calculateAttendance.bunkableClasses[index]} classes
                          </p>
                        )
                      ))}
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-orange-400">No classes can be bunked</p>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showChart && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 overflow-hidden"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Subject-wise Attendance</h3>
                  <div className="space-y-3">
                    {subjects.map((sub, index) => {
                      const percentage = parseFloat(calculateAttendance.subjectPercentages[index]);
                      const isLow = percentage < sub.minAttendance;
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <span className="w-24 sm:w-40 text-sm text-gray-300 font-medium truncate">
                            {sub.name || "Subject " + (index + 1)}
                          </span>
                          <div className="flex-1 bg-gray-700/50 rounded-full h-6 overflow-hidden">
                            <motion.div
                              className={`h-full flex items-center justify-end px-3 ${isLow
                                  ? "bg-gradient-to-r from-red-500 to-red-400"
                                  : "bg-gradient-to-r from-purple-500 to-purple-400"
                                }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                              <span className="text-xs text-white font-semibold">{percentage}%</span>
                            </motion.div>
                          </div>
                          {isLow && (
                            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const ScientificCalculator = ({ showToast, showSCSIT, setShowSCSIT }) => {
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [useDegrees, setUseDegrees] = useState(true);
  const displayRef = useRef(null);

  const buttons = [
    ["C", "CE", "(", ")", "÷"],
    ["sin", "cos", "tan", "√", "nCr"],
    ["7", "8", "9", "×", "nPr"],
    ["4", "5", "6", "-", "!"],
    ["1", "2", "3", "+", "log"],
    ["0", ".", "π", "e", "exp"],
    ["MC", "MR", "M+", "M-", "="],
    ["sin⁻¹", "cos⁻¹", "tan⁻¹", "x²", "xʸ"],
    ["ln", "abs", "rand", "mod", "round"],
  ];

  const validateExpression = (expression) => {
    if (!expression || expression === "0") return "Empty expression";
    try {
      math.parse(expression);
      return null;
    } catch {
      return "Invalid expression syntax";
    }
  };

  const handleButtonClick = (value) => {
    try {
      if (value === "C") {
        setDisplay("0");
        setShowSCSIT(false);
      } else if (value === "CE") {
        setDisplay(display.slice(0, -1) || "0");
        setShowSCSIT(false);
      } else if (value === "=") {
        const cleanedExpression = display
          .replace("÷", "/")
          .replace("×", "*")
          .replace("π", Math.PI)
          .replace("e", Math.E)
          .replace("sin⁻¹", useDegrees ? "asin(deg)" : "asin")
          .replace("cos⁻¹", useDegrees ? "acos(deg)" : "acos")
          .replace("tan⁻¹", useDegrees ? "atan(deg)" : "atan")
          .replace("sin", useDegrees ? "sin(deg)" : "sin")
          .replace("cos", useDegrees ? "cos(deg)" : "cos")
          .replace("tan", useDegrees ? "tan(deg)" : "tan")
          .replace("x²", "^2")
          .replace("xʸ", "^")
          .replace("ln", "log")
          .replace("mod", "%")
          .replace("rand", "random()");
        const validationError = validateExpression(cleanedExpression);
        if (validationError) {
          showToast(validationError, "error");
          setDisplay("Error");
          return;
        }
        const result = math.evaluate(cleanedExpression, { deg: (x) => (x * Math.PI) / 180 });
        if (isNaN(result) || !isFinite(result)) {
          showToast("Result is undefined or infinite", "error");
          setDisplay("Error");
          return;
        }
        const formattedResult = Number(result.toFixed(6));
        const isSCSIT = (display === "17+50" || display === "50+17");
        const isSCSIT2 = (display === "50-17" || display === "17-50");
        const isSCSIT3 = (display === "50*17" || display === "17*50");
        const isSCSIT4 = (display === "50/17" || display === "17/50");
        const isSCSIT5 = (display === "50%17" || display === "17%50");
        const isSCSIT6 = (display === "50^17" || display === "17^50");
        const isSCSIT7 = (display === "50" || display === "17");
        setDisplay(formattedResult.toString());
        setLastResult(formattedResult);
        setHistory([...history.slice(-9), `${display} = ${formattedResult}`]);
        if (isSCSIT || isSCSIT2 || isSCSIT3 || isSCSIT4 || isSCSIT5 || isSCSIT6 || isSCSIT7) {
          setShowSCSIT(true);
          setTimeout(() => setShowSCSIT(false), 3000);
        }
      } else if (value === "MC") {
        setMemory(0);
        showToast("Memory cleared", "success");
      } else if (value === "MR") {
        setDisplay(memory.toString());
      } else if (value === "M+") {
        const current = parseFloat(display) || 0;
        if (isNaN(current)) {
          showToast("Invalid memory value", "error");
          return;
        }
        setMemory((prev) => prev + current);
        showToast("Added to memory", "success");
      } else if (value === "M-") {
        const current = parseFloat(display) || 0;
        if (isNaN(current)) {
          showToast("Invalid memory value", "error");
          return;
        }
        setMemory((prev) => prev - current);
        showToast("Subtracted from memory", "success");
      } else if (["sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹", "ln", "abs", "round"].includes(value)) {
        setDisplay(`${value}(${display})`);
      } else if (value === "√") {
        setDisplay(`sqrt(${display})`);
      } else if (value === "!") {
        setDisplay(`factorial(${display})`);
      } else if (value === "nCr" || value === "nPr") {
        setDisplay(`${display} ${value} `);
      } else if (value === "log") {
        setDisplay(`log10(${display})`);
      } else if (value === "exp") {
        setDisplay(`exp(${display})`);
      } else if (value === "x²") {
        setDisplay(`(${display})^2`);
      } else if (value === "xʸ") {
        setDisplay(`${display}^`);
      } else if (value === "π") {
        setDisplay(display === "0" ? "π" : display + "π");
      } else if (value === "e") {
        setDisplay(display === "0" ? "e" : display + "e");
      } else if (value === "rand") {
        setDisplay("random()");
      } else if (value === "mod") {
        setDisplay(`${display}%`);
      } else {
        setDisplay(display === "0" ? value : display + value);
      }
    } catch (error) {
      showToast("Invalid operation or input", "error");
      setDisplay("Error");
    }
  };

  const handleKeyPress = (e) => {
    const keyMap = {
      "Enter": "=", "Escape": "C", "Backspace": "CE",
      "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
      "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
      "+": "+", "-": "-", "*": "×", "/": "÷", ".": ".",
      "(": "(", ")": ")", "%": "mod", "^": "xʸ", "!": "!",
      "p": "π", "e": "e",
    };
    if (keyMap[e.key]) {
      handleButtonClick(keyMap[e.key]);
    } else if (e.key === "s" && e.ctrlKey) {
      handleButtonClick("sin");
    } else if (e.key === "c" && e.ctrlKey) {
      handleButtonClick("cos");
    } else if (e.key === "t" && e.ctrlKey) {
      handleButtonClick("tan");
    }
  };

  useEffect(() => {
    displayRef.current.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/50 p-4 sm:p-8 shadow-2xl max-w-2xl mx-auto"
      onKeyDown={handleKeyPress}
      tabIndex={0}
      ref={displayRef}
    >
      <Helmet>
        <title>Scientific Calculator | Tools LastMinuteSCSIT</title>
        <meta name="description" content="A powerful scientific calculator with advanced functions, history tracking, and memory features. Perfect for students and professionals." />
      </Helmet>

      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <div className="p-3 bg-orange-500/20 rounded-2xl">
          <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Scientific Calculator</h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Advanced mathematical operations</p>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 mb-6 relative">
        <input
          type="text"
          value={display}
          readOnly
          className={`w-full p-4 bg-gray-900/50 rounded-xl border border-gray-700 text-white text-right text-2xl sm:text-3xl font-mono transition-all duration-500 overflow-x-auto ${showSCSIT ? "bg-gradient-to-r from-green-600 to-green-500 text-white border-orange-400" : ""
            }`}
          aria-label="Calculator display"
        />
        {showSCSIT && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <AnimatePresence>
              <motion.span
                key="title-span"
                className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -3, 0],
                  filter: [
                    "drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))",
                    "drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))",
                    "drop-shadow(0 0 7px rgba(255, 255, 255, 0.6))",
                  ],
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  default: {
                    duration: 0.8,
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                  },
                  filter: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  y: {
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  },
                }}
              >
                LastMinute SCSIT
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
        {history.length > 0 && (
          <div className="mt-3 text-sm text-gray-300 max-h-32 overflow-y-auto custom-scrollbar bg-gray-900/30 rounded-lg p-3">
            {history.map((entry, index) => (
              <p key={index} className="py-1 font-mono break-words">{entry}</p>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <motion.label
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 text-gray-300 bg-gray-800/50 rounded-xl px-4 py-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={useDegrees}
            onChange={() => setUseDegrees(!useDegrees)}
            className="w-5 h-5 accent-orange-500 rounded"
            aria-label="Toggle degrees/radians"
          />
          <span className="font-medium">Degrees</span>
        </motion.label>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setDisplay("0");
            setHistory([]);
            setShowSCSIT(false);
            showToast("Calculator reset", "success");
          }}
          className="flex items-center justify-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold rounded-xl py-2 px-4 transition-all duration-200"
          aria-label="Reset calculator"
        >
          <RotateCcw size={18} /> Reset
        </motion.button>
      </div>

      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {buttons.flat().map((button, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(button)}
            className={`p-2 h-12 sm:h-14 rounded-xl text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center ${["C", "CE"].includes(button)
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                : ["MC", "MR", "M+", "M-"].includes(button)
                  ? "bg-gray-700/50 hover:bg-gray-700/70 text-gray-300"
                  : ["sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹", "√", "nCr", "nPr", "!", "log", "exp", "x²", "xʸ", "ln", "abs", "rand", "mod", "round"].includes(button)
                    ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                    : button === "="
                      ? "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white"
                      : ["÷", "×", "-", "+"].includes(button)
                        ? "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400"
                        : "bg-gray-800/50 hover:bg-gray-800/70"
              }`}
            title={button}
            aria-label={`Calculator button ${button}`}
          >
            {button}
          </motion.button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">Memory: {memory}</p>
      </div>

    </motion.div>
  );
};

const PercentageCalculator = ({ showToast }) => {
  const [value, setValue] = useState("");
  const [total, setTotal] = useState("");
  const [percentage, setPercentage] = useState("");
  const [changeFrom, setChangeFrom] = useState("");
  const [changeTo, setChangeTo] = useState("");
  const [result, setResult] = useState(null);

  const calculatePercentage = () => {
    const val = parseFloat(value);
    const tot = parseFloat(total);
    if (isNaN(val) || isNaN(tot) || tot === 0) {
      showToast("Invalid input for percentage calculation", "error");
      return;
    }
    setResult({ percentage: ((val / tot) * 100).toFixed(2) });
  };

  const calculatePercentageChange = () => {
    const from = parseFloat(changeFrom);
    const to = parseFloat(changeTo);
    if (isNaN(from) || isNaN(to) || from === 0) {
      showToast("Invalid input for percentage change", "error");
      return;
    }
    const change = (((to - from) / from) * 100).toFixed(2);
    setResult({ change, isIncrease: to > from });
  };

  const calculateValueFromPercentage = () => {
    const perc = parseFloat(percentage);
    const tot = parseFloat(total);
    if (isNaN(perc) || isNaN(tot)) {
      showToast("Invalid input for value calculation", "error");
      return;
    }
    setResult({ value: (tot * (perc / 100)).toFixed(2) });
  };

  const handleReset = () => {
    setValue("");
    setTotal("");
    setPercentage("");
    setChangeFrom("");
    setChangeTo("");
    setResult(null);
    showToast("Percentage calculator reset", "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/50 p-4 sm:p-8 shadow-2xl"
    >
      <Helmet>
        <title>Percentage Calculator | Tools LastMinuteSCSIT</title>
        <meta name="description" content="Calculate and manage your percentages with ease. Find percentage values, percentage changes, and more." />
      </Helmet>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-green-500/20 rounded-2xl">
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Percentage Calculator</h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Quick percentage calculations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-colors"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Calculate Percentage
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Value</label>
              <input
                type="number"
                placeholder="Enter value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Total</label>
              <input
                type="number"
                placeholder="Enter total"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={calculatePercentage}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg py-3 transition-all"
            >
              Calculate
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-colors"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Value from Percentage
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Percentage</label>
              <input
                type="number"
                placeholder="Enter percentage"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="w-full p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Total</label>
              <input
                type="number"
                placeholder="Enter total"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={calculateValueFromPercentage}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg py-3 transition-all"
            >
              Calculate
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-colors"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Percentage Change
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">From</label>
              <input
                type="number"
                placeholder="Initial value"
                value={changeFrom}
                onChange={(e) => setChangeFrom(e.target.value)}
                className="w-full p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">To</label>
              <input
                type="number"
                placeholder="Final value"
                value={changeTo}
                onChange={(e) => setChangeTo(e.target.value)}
                className="w-full p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={calculatePercentageChange}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-lg py-3 transition-all"
            >
              Calculate
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 text-center bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"
          >
            {result.percentage && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Result</p>
                <p className="text-4xl sm:text-5xl font-bold text-green-400">{result.percentage}%</p>
                <p className="text-gray-400 mt-2">{value} is {result.percentage}% of {total}</p>
              </div>
            )}
            {result.value && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Result</p>
                <p className="text-4xl sm:text-5xl font-bold text-blue-400">{result.value}</p>
                <p className="text-gray-400 mt-2">{percentage}% of {total} is {result.value}</p>
              </div>
            )}
            {result.change && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Change</p>
                <div className="flex items-center justify-center gap-3">
                  {result.isIncrease ? (
                    <TrendingUp size={32} className="text-green-400" />
                  ) : (
                    <TrendingDown size={32} className="text-red-400" />
                  )}
                  <p className={`text-4xl sm:text-5xl font-bold ${result.isIncrease ? "text-green-400" : "text-red-400"}`}>
                    {result.change}%
                  </p>
                </div>
                <p className="text-gray-400 mt-2">
                  {result.isIncrease ? "Increase" : "Decrease"} from {changeFrom} to {changeTo}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleReset}
        className="w-full mt-6 flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-700/70 text-white font-semibold rounded-xl py-3 transition-all"
      >
        <RotateCcw size={18} /> Reset All
      </motion.button>
    </motion.div>
  );
};

const CalculatorPage = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
  const { toolName } = useParams();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);
  const [showSCSIT, setShowSCSIT] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", show: false });

  const showToast = (message, type) => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: "", type: "", show: false }), 4000);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (toolName) {
      const tool = modes.find(mode => mode.value === toolName);
      if (tool) {
        setSelectedMode(tool);
      }
    }
  }, [toolName]);

  const modes = [
    { value: "cgpa", label: "CGPA Calculator" },
    { value: "sgpa", label: "SGPA Calculator" },
    { value: "attendance", label: "Attendance Calculator" },
    { value: "scientific", label: "Scientific Calculator" },
    { value: "percentage", label: "Percentage Calculator" },
  ];

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "rgba(31, 41, 55, 0.5)",
      borderColor: "rgba(107, 114, 128, 0.3)",
      color: "#E5E7EB",
      borderRadius: "1rem",
      padding: "0.5rem",
      boxShadow: "none",
      "&:hover": { borderColor: "#00A3B5" },
      transition: "all 0.2s ease",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "rgba(31, 41, 55, 0.95)",
      borderRadius: "1rem",
      border: "1px solid rgba(107, 114, 128, 0.3)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(10px)",
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "rgba(0, 163, 181, 0.2)"
        : state.isFocused
          ? "rgba(55, 65, 81, 0.5)"
          : "transparent",
      color: state.isSelected ? "#00A3B5" : "#E5E7EB",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:active": { backgroundColor: "rgba(0, 163, 181, 0.3)" },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#E5E7EB",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9CA3AF",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": { color: "#E5E7EB" },
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

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
    <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-4 sm:p-6 pb-10 pt-20 sm:pt-24">
      <Helmet>
        <title>Tools Suite | LastMinuteSCSIT</title>
        <meta name="description" content="Modern CGPA, SGPA, attendance, and scientific calculators with enhanced features for students." />
      </Helmet>
      <style>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
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
          background: rgba(107, 114, 128, 0.6);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.9);
        }
      `}</style>
      <div className="max-w-6xl mx-auto mt-6 sm:mt-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-all duration-200"
            aria-label="Back to home"
          >
            <ArrowLeft size={20} /> Back to Home
          </motion.button>
          <div className="w-full sm:w-80">
            <Select
              options={modes}
              value={selectedMode}
              onChange={(option) => {
                setSelectedMode(option);
              }}
              styles={customSelectStyles}
              placeholder="Select a calculator..."
              aria-label="Select calculator tool"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          {selectedMode ? (
            selectedMode.value === "cgpa" ? (
              <CGPACalculator key="cgpa" showToast={showToast} />
            ) : selectedMode.value === "sgpa" ? (
              <SGPACalculator key="sgpa" showToast={showToast} />
            ) : selectedMode.value === "attendance" ? (
              <AttendanceCalculator key="attendance" showToast={showToast} />
            ) : selectedMode.value === "scientific" ? (
              <ScientificCalculator key="scientific" showToast={showToast} setShowSCSIT={setShowSCSIT} showSCSIT={showSCSIT} />
            ) : selectedMode.value === "percentage" ? (
              <PercentageCalculator key="percentage" showToast={showToast} />
            ) : null
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-6">
                <Calculator size={40} className="text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Select a Calculator</h2>
              <p className="text-gray-400">Choose a tool from the dropdown above to get started</p>
            </motion.div>
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
      <CelebrationEffect show={showSCSIT} usingIn={'scalc'} />
    </div>
  );
};

export default CalculatorPage;