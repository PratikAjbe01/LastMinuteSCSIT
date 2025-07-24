"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, BookOpen, Code, FileText, GraduationCap, Briefcase, School, Shield } from "lucide-react"
import FileViewer from "../fileComponents/FileViewer"
import UploadPage from "../fileComponents/UploadPage"
import { useNavigate, useParams } from "react-router-dom"
import { Helmet } from "react-helmet-async"

const semestersByCourse = {
  "BCA": ["1", "2", "3", "4", "5", "6"],
  "MCA": ["1", "2", "3", "4"],
  "BCA_INT": ["1", "2", "3", "4", "5", "6", "7", "8"],
  "MSC_INT_CS": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  "MTECH_CS": ["1", "2", "3", "4"],
  "MTECH_CS_EXEC": ["1", "2", "3", "4"],
  "MTECH_NM_IS": ["1", "2", "3", "4"],
  "MTECH_IA_SE": ["1", "2", "3", "4"],
  "PHD": ["1", "2", "3", "4", "5", "6"],
  "MSC_CS": ["1", "2", "3", "4"],
  "MSC_IT": ["1", "2", "3", "4"],
  "MBA_CM": ["1", "2", "3", "4"],
  "PGDCA": ["1", "2"],
}

const icons = [BookOpen, FileText, GraduationCap, Code, Shield, Briefcase, School];

const getOrdinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const SemestersPage = () => {
  const { course } = useParams();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadPage, setShowUploadPage] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const semesters = useMemo(() => {
    const courseKey = course?.toUpperCase();
    const semesterNumbers = semestersByCourse[courseKey];

    if (!semesterNumbers) {
      return [];
    }

    return semesterNumbers.map((sem, index) => ({
      id: parseInt(sem),
      title: `${sem}${getOrdinalSuffix(parseInt(sem))} Semester`,
      description: `Access previous year papers for the ${sem}${getOrdinalSuffix(parseInt(sem))} semester.`,
      icon: icons[index % icons.length],
      paperCount: Math.floor(Math.random() * 5) + 5,
    }));
  }, [course]);

  const handleSemesterClick = (semesterId) => {
    navigate(`/scsit/${course}/semesters/${semesterId}`);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleCloseViewer = () => {
    setSelectedFile(null);
  };
  
  if (semesters.length === 0) {
    return (
      <div className="min-h-screen w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center justify-center p-0 pb-8 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl p-8 max-w-lg mx-auto text-center border border-gray-700"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-4">Course Not Available</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            The course '{course}' has not been added yet or is not valid. Please contact the admins at SCSIT, Indore, for more information.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/scsit/courses')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            >
              Back to Courses
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (selectedFile) {
    return <FileViewer file={selectedFile} onClose={handleCloseViewer} />;
  }

  if (showUploadPage) {
    return <UploadPage onBack={() => setShowUploadPage(false)} />;
  }

  return (
    <div className="min-h-full w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 flex flex-col items-center justify-center p-0 pb-8 pt-16">
      <Helmet>
        <title>{`${course?.toUpperCase().replace(/_/g, ' ')} Semesters - SCSIT Indore`}</title>
        <meta name="description" content={`Explore semesters for the ${course?.toUpperCase().replace(/_/g, ' ')} program at the School of Computer Science and IT, Indore.`} />
      </Helmet>
      <div className="w-full h-full flex flex-col flex-1">
        <div className="text-center mb-12 mt-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text"
          >
            {course?.toUpperCase().replace(/_/g, ' ')} Papers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Access previous year examination papers for the {course?.toUpperCase().replace(/_/g, ' ')} program.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/upload`)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            >
              Upload Papers
            </motion.button>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full px-8 flex-1">
          {semesters.map((semester, index) => {
            const IconComponent = semester.icon;
            return (
              <motion.div
                key={semester.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSemesterClick(semester.id)}
                className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer border border-gray-700 hover:border-green-500 transition-all duration-300 h-full flex flex-col justify-between"
              >
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{semester.title}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{semester.description}</p>
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{semester.paperCount} Papers Available</span>
                  </div>
                </div>
                <div className="px-8 py-4 bg-gray-900 bg-opacity-50">
                  <div className="w-full py-2 text-center text-green-400 font-semibold hover:text-green-300 transition-colors">
                    View Papers →
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default SemestersPage;