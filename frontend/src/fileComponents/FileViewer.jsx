"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, ZoomIn, ZoomOut, RotateCw, Download, Eye, Share, Share2 } from "lucide-react"
import Img from "../components/lazyLoadImage/Img"
import { useParams } from "react-router-dom"
import { RWebShare } from "react-web-share"

const FileViewer = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [pdfUrl, setPdfUrl] = useState(null)

  useEffect(() => {
    const width = window.innerWidth;
    if (width <= 768) {
      window.open(file?.url, "_blank");
    }
  }, []);

  const { course, semesterId } = useParams();

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault()
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (file?.type === "document") {
      // Try direct URL first for better browser compatibility
      setPdfUrl(file.url)
    }
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [file?.url, file?.type])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleReset = () => {
    setZoom(100)
    setRotation(0)
  }

  const baseUrl = window.location.origin
  console.log("Base URL:", baseUrl)

  console.log("FileViewer rendered with file:", file)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 z-50 flex flex-col overflow-hidden"
    >
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-b border-gray-700 p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
            <span className="text-white font-semibold text-sm sm:text-base truncate">{file.title}</span>
          </div>
          <div className="text-gray-400 text-xs sm:text-sm truncate">
            {file.semester} • {file.subject} • {file.year}
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end">
          <RWebShare
            data={{
              text: `LastMinute SCSIT shared ${file?.title} of ${file.subject} ( ${file.year} )'.`,
              url: `${baseUrl}/scsit/${course}/semesters/${semesterId}`,
              title: "LastMinute SCSIT Shared File" + file?.name | file?.title,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 sm:p-3 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors flex items-center space-x-1 bg-gray-700 rounded-lg"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
          </RWebShare>

          <div className="hidden sm:flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>

            <span className="text-gray-300 text-sm px-2 min-w-[60px] text-center">{zoom}%</span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
              disabled={zoom >= 300}
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex sm:hidden items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="p-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-3 h-3" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="p-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
              disabled={zoom >= 300}
            >
              <ZoomIn className="w-3 h-3" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRotate}
            className="p-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-2 py-2 sm:px-3 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-xs sm:text-sm font-medium"
          >
            Reset
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
      </div>

      <div className="flex sm:hidden bg-gray-800 bg-opacity-90 border-b border-gray-700 p-2">
        <div className="flex items-center justify-center space-x-2 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomOut}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors bg-gray-700"
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-4 h-4" />
          </motion.button>

          <span className="text-gray-300 text-sm px-3 py-2 bg-gray-700 rounded min-w-[60px] text-center">{zoom}%</span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomIn}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors bg-gray-700"
            disabled={zoom >= 300}
          >
            <ZoomIn className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-2 sm:p-4 relative">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotate: 0 }}
          animate={{ scale: zoom / 100, opacity: 1, rotate: rotation }}
          transition={{ duration: 0.3 }}
          className="max-w-full max-h-full w-full h-full flex items-center justify-center mx-auto relative"
          style={{ transformOrigin: "center center" }}
        >
          {file?.type === "document" && pdfUrl ? (
            <>
              <iframe
                src={`${pdfUrl}`}
                title={file.title}
                className="w-full h-full border-0 rounded-none shadow-none bg-white block"
                style={{ 
                  transformOrigin: "center center",
                  minHeight: "50vh",
                  width: "100%",
                  height: "100%"
                }}
              />
            </>
          ) : file?.type === "document" ? (
            <div className="text-white text-center text-sm sm:text-base">Loading PDF...</div>
          ) : (
            <Img 
              src={file.url || "/placeholder.svg"} 
              alt={file.title} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl mx-auto" 
            />
          )}
        </motion.div>
      </div>

      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
            Use zoom and rotate controls to adjust the view. Right-click and downloads are disabled for security.
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-xs sm:text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Download Disabled</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FileViewer