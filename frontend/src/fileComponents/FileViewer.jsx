"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, ZoomIn, ZoomOut, RotateCw, Download, Eye, Share2 } from "lucide-react"
import Img from "../components/lazyLoadImage/Img"
import { useParams } from "react-router-dom"
import { RWebShare } from "react-web-share"

const FileViewer = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [pdfUrl, setPdfUrl] = useState(null)

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
      setPdfUrl(file.fileUrl || file.url)
    }
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [file?.url, file?.type, file?.fileUrl])

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(100)
    setRotation(0)
  }

  const baseUrl = window.location.origin

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900 z-50 flex flex-col overflow-hidden">
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-b border-gray-700 p-2 sm:p-4 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-3 min-w-0">
          <Eye className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm sm:text-base truncate">{file.name || file.title}</p>
            <p className="text-gray-400 text-xs sm:text-sm truncate sm:hidden">
              {file.subject} • {file.year}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <div className="hidden sm:flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomOut} className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors" disabled={zoom <= 50}>
              <ZoomOut className="w-4 h-4" />
            </motion.button>
            <span className="text-gray-300 text-sm px-2 min-w-[60px] text-center">{zoom}%</span>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomIn} className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors" disabled={zoom >= 300}>
              <ZoomIn className="w-4 h-4" />
            </motion.button>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRotate} className="p-2 sm:p-3 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
            <RotateCw className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleReset} className="hidden sm:block px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium">
            Reset
          </motion.button>
          <RWebShare data={{ text: `Check out this file from SCSIT: ${file?.name || file?.title}`, url: file.url || file.fileUrl, title: "SCSIT File" }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 sm:p-3 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors bg-gray-700 rounded-lg">
              <Share2 className="w-4 h-4" />
            </motion.button>
          </RWebShare>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="p-2 sm:p-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4 relative pb-20 sm:pb-4">
        <motion.div
          animate={{ scale: zoom / 100, rotate: rotation }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          {file?.type === "document" && pdfUrl ? (
            <iframe src={pdfUrl} title={file.title} className="w-[80vw] h-[80vh] sm:w-[90vw] sm:h-[85vh] max-w-7xl border-0 rounded-lg bg-white" />
          ) : file?.type === "document" ? (
            <div className="text-white text-center">Loading PDF...</div>
          ) : (
            <Img src={file.fileUrl || file.url} alt={file.title} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          )}
        </motion.div>
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2 flex items-center justify-around">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomOut} className="p-3 bg-gray-700 text-gray-300 rounded-lg" disabled={zoom <= 50}>
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        <span className="text-gray-200 text-base font-semibold px-4 py-2 bg-gray-700 rounded-lg min-w-[70px] text-center">{zoom}%</span>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomIn} className="p-3 bg-gray-700 text-gray-300 rounded-lg" disabled={zoom >= 300}>
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleReset} className="p-3 bg-green-600 text-white rounded-lg">
          Reset
        </motion.button>
      </div>

      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-gray-400 text-xs text-center">
            Use zoom and rotate controls to adjust the view. Right-click and downloads are disabled for security.
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FileViewer