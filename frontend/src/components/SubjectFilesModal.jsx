import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Image, Text, Calendar, FolderOpen } from 'lucide-react';

const FileListItem = ({ file, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
    whileHover={{ y: -3, scale: 1.02 }}
    onClick={() => onClick(file)}
    className="cursor-pointer rounded-xl border border-gray-700/80 bg-gray-800/60 p-4 transition-all duration-200 hover:border-green-500/80 hover:bg-gray-800 shadow-lg"
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
          {file?.type === "document" && <FileText className="h-5 w-5 text-white" />}
          {file?.type === "image" && <Image className="h-5 w-5 text-white" />}
          {file?.type === "text" && <Text className="h-5 w-5 text-white" />}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 font-semibold text-white">
          {file.name}
        </h3>
        <div className="flex items-center space-x-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{file.year || "N/A"}</span>
          </div>
          {file.resourceType && file.resourceType !== "none" && (
            <>
              <span className="text-gray-600">•</span>
              <span className="uppercase tracking-wider">
                {file.resourceType}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const SubjectFilesModal = ({ subject, subjectName, onClose, onFileClick, category }) => {
  const currentSubject = React.useMemo(
    () => subject?.find(s => s.name === subjectName),
    [subject, subjectName]
  );

  const filteredPapers = React.useMemo(
    () => {
      if (!currentSubject) return [];
      return currentSubject.papers.filter(paper => paper.category === category);
    },
    [currentSubject, category]
  );

  if (!currentSubject) return null;

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { y: "50px", opacity: 0, scale: 0.95 },
    visible: {
      y: "0",
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
    exit: {
      y: "50px",
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={backdropVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onClick={onClose}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md"
      >
        <motion.div
          key="modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col w-full max-w-3xl m-4 max-h-[90vh] rounded-2xl border border-gray-700 bg-gray-900/80 shadow-2xl shadow-green-500/10 overflow-hidden"
        >
          <div className="flex-shrink-0 flex items-start justify-between p-6 border-b border-gray-700/80 bg-gradient-to-b from-gray-800/50 to-transparent">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {currentSubject.name}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {filteredPapers.length} file{filteredPapers.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-full">
                {category}
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all"
                aria-label="Close modal"
              >
                <X size={24} />
              </motion.button>
            </div>
          </div>

          <div className="flex-grow p-6 overflow-y-auto">
            {filteredPapers.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {[...filteredPapers].reverse().map((paper, index) => (
                  <FileListItem
                    key={paper._id || index}
                    file={paper}
                    index={index}
                    onClick={onFileClick}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-10">
                <FolderOpen size={48} className="mb-4 text-green-500/50" />
                <p className="text-lg font-medium text-gray-300">No Files Found</p>
                <p className="text-sm max-w-xs mx-auto">
                  There are no materials available for this subject yet. Please check back later.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubjectFilesModal;
