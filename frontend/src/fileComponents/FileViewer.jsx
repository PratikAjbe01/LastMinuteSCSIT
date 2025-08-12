"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X, ZoomIn, ZoomOut, RotateCw, Eye, Share2, RefreshCcw } from "lucide-react"
import { useParams } from "react-router-dom"
import { RWebShare } from "react-web-share"
import Img from "../components/lazyLoadImage/Img"
import { CLIENT_URL } from "../utils/urls"

const Watermark = () => {
    const watermarkText = "© LastMinute SCSIT";
    return (
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none select-none">
            <div className="absolute -inset-1/4">
                {Array.from({ length: 150 }).map((_, i) => (
                    <p
                        key={i}
                        className="text-white/10 font-bold text-2xl whitespace-nowrap opacity-50"
                        style={{
                            position: 'absolute',
                            top: ${(i * 10) % 150}%,
                            left: ${((i * 4) % 100)}%,
                            transform: 'rotate(-30deg)',
                        }}
                    >
                        {watermarkText}
                    </p>
                ))}
            </div>
        </div>
    );
};

const FileViewer = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalHeight = document.body.style.height;
    const originalTouchAction = document.body.style.touchAction;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.height = '100%';
    document.body.style.width = '100%';
    document.body.style.touchAction = 'none';
    document.body.classList.add('no-scroll', 'no-select');
    
    const preventScroll = (e) => {
      e.preventDefault();
      return false;
    };
    
    const preventTouchMove = (e) => {
      if (e.target.closest('.file-viewer-content')) {
        return;
      }
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    document.addEventListener('scroll', preventScroll, { passive: false });

    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U") ||
        (e.metaKey && e.altKey && (e.key === "i" || e.key === "j" || e.key === "c")) ||
        (e.ctrlKey && e.key === "s")
      ) {
        e.preventDefault();
      }
    };
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.height = originalHeight;
      document.body.style.touchAction = originalTouchAction;
      document.body.classList.remove('no-scroll', 'no-select');
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('scroll', preventScroll);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (file?.type === "document" && (file.fileUrl || file.url)) {
      setPdfUrl(${file.fileUrl || file.url}#toolbar=0&navpanes=0);
    }
  }, [file]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    if (mainRef.current) {
        mainRef.current.scrollTop = (mainRef.current.scrollHeight - mainRef.current.clientHeight) / 2;
        mainRef.current.scrollLeft = (mainRef.current.scrollWidth - mainRef.current.clientWidth) / 2;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900 z-50 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
      <header className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-b border-gray-700 p-2 sm:p-4 flex items-center justify-between gap-2 z-30">
        <div className="flex items-center space-x-3 min-w-0">
          <Eye className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm sm:text-base">{file.name || file.title}</p>
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
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleReset} className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-green-600/80 text-white hover:bg-green-600 rounded-lg transition-colors text-sm font-medium">
            <RefreshCcw className="w-4 h-4" />
            Reset
          </motion.button>
          <RWebShare data={{ text: Check out this file from SCSIT: ${file?.name || file?.title}, url: ${CLIENT_URL}/share/file/${file?._id}, title: LastMinute SCSIT Shared you a file - ${file?.name || file?.title} }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 sm:p-3 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors bg-gray-700 rounded-lg">
              <Share2 className="w-4 h-4" />
            </motion.button>
          </RWebShare>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="p-2 sm:p-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      <main 
        ref={mainRef}
        className="relative overflow-auto flex items-center justify-center p-4 file-viewer-content"
        onDoubleClick={(e) => e.preventDefault()}
      >
        <motion.div
            animate={{ 
                rotate: rotation,
                ...(isMobile ? { scale: zoom / 100 } : {})
            }}
            style={!isMobile ? { 
                width: zoom === 100 ? '100%' : ${zoom}%, 
                height: zoom === 100 ? '100%' : ${zoom}%
            } : {
                transformOrigin: 'center center'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }} 
            className={relative flex items-center justify-center ${isMobile ? 'max-w-full max-h-full' : ''}}
        >
            <Watermark />
            <div 
                className="w-full h-full flex items-center justify-center"
                onContextMenu={(e) => e.preventDefault()}
            >
                {file?.type === "document" && pdfUrl ? (
                    <iframe 
                        src={pdfUrl} 
                        title={file.title} 
                        className="w-full h-full border-0 rounded-lg bg-white shadow-2xl" 
                    />
                ) : file?.type === "image" ? (
                    <Img 
                        src={file.fileUrl || file.url} 
                        alt={file.title} 
                        className={object-contain ${isMobile ? 'max-w-full max-h-full' : 'w-full h-full'}}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                    />
                ) : (
                    <div className="text-white text-center">Loading preview...</div>
                )}
            </div>
        </motion.div>
      </main>
      
      <footer className="z-30">
          <div className="sm:hidden bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2 flex items-center justify-around">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomOut} className={p-3 rounded-lg ${zoom <= 50 ? 'bg-gray-600 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300'}} disabled={zoom <= 50}>
                <ZoomOut className="w-5 h-5" />
            </motion.button>
            <span className="text-gray-200 text-base font-semibold px-4 py-2 bg-gray-700 rounded-lg min-w-[70px] text-center">{zoom}%</span>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomIn} className={p-3 rounded-lg ${zoom >= 300 ? 'bg-gray-600 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300'}} disabled={zoom >= 300}>
                <ZoomIn className="w-5 h-5" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleReset} className="p-3 bg-green-600 text-white rounded-lg">
                <RefreshCcw className="w-5 h-5"/>
            </motion.button>
          </div>
          <div className="hidden sm:block bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2">
            <div className="max-w-7xl mx-auto text-center text-gray-400 text-xs">
                Use zoom and rotate controls to adjust the view. Right-click and downloads are disabled for security.
            </div>
          </div>
      </footer>
    </motion.div>
  );
};

export default FileViewer;