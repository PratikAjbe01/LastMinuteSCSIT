"use client"

import { useState, useEffect, useContext } from "react"
import { motion } from "framer-motion"
import { X, ZoomIn, ZoomOut, RotateCw, Eye, Share2, Loader } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { RWebShare } from "react-web-share"
import { API_URL } from "../utils/urls"
import { useSwipeable } from "react-swipeable"
import { ValuesContext } from "../context/ValuesContext"

const SecureImage = ({ src, alt, className }) => {
  const preventActions = (e) => e.preventDefault();
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onContextMenu={preventActions}
      onDragStart={preventActions}
    />
  );
};

const Watermark = () => {
    const watermarkText = "© LastMinute SCSIT";
    return (
        <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none select-none">
            <div className="absolute -inset-1/4">
                {Array.from({ length: 150 }).map((_, i) => (
                    <p
                        key={i}
                        className="text-white/20 font-bold text-2xl whitespace-nowrap opacity-50"
                        style={{
                            position: 'absolute',
                            top: `${(i * 10) % 150}%`,
                            left: `${((i * 4) % 100)}%`,
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

const ShareFilePage = () => {
    const [zoom, setZoom] = useState(100)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rotation, setRotation] = useState(0)
    const [pdfUrl, setPdfUrl] = useState(null)
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchFile = async () => {
            if (!id) {
                setError("No file ID provided.");
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${API_URL}/api/files/getfilebyid`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || "File not found.");
                }
                setFile(result.data);
            } catch (error) {
                console.error("Error fetching file:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFile();
    }, [id]);

    useEffect(() => {
        document.body.classList.add('no-scroll', 'no-select');
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
          document.body.classList.remove('no-scroll', 'no-select');
          document.removeEventListener("contextmenu", handleContextMenu);
          document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (file?.type === "document" && (file.fileUrl || file.url)) {
            setPdfUrl(`${file.fileUrl || file.url}#toolbar=0&navpanes=0`);
        }
    }, [file]);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300))
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
    const handleReset = () => {
        setZoom(100)
        setRotation(0)
    }

    const onClose = () => {
        navigate('/');
    }

     useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

     const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
    
      const isExcludedRoute = location.pathname.startsWith("/login") || location.pathname === "/signup";
      const isMobile = window.innerWidth <= 768;
      const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
          if (isMobile && !isExcludedRoute) {
            setIsSidebarOpen(true);
            console.log("Swiped left - opening sidebar");
          }
        },
        onSwipedRight: () => {
          if (isMobile && !isExcludedRoute && isSidebarOpen) {
            setIsSidebarOpen(false);
            console.log("Swiped right - closing sidebar");
          }
        },
        preventDefaultTouchmoveEvent: false,
        trackMouse: false,
        delta: 30,
      });

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center">
                <Loader className="w-12 h-12 text-green-400 animate-spin" />
            </div>
        );
    }

    if (error || !file) {
        return (
            <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-red-500">Error</h2>
                <p className="text-gray-300 mt-2">{error || "Could not load the file."}</p>
                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="mt-6 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg">
                    Go to Home
                </motion.button>
            </div>
        );
    }

    return (
        <motion.div {...swipeHandlers} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900 z-50 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
            <header className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-b border-gray-700 p-2 sm:p-4 flex items-center justify-between gap-2 z-30">
                <div className="flex items-center space-x-3 min-w-0">
                    <Eye className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm sm:text-base truncate">{file.name || file.title}</p>
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
                    <RWebShare data={{ text: `Check out this file from SCSIT: ${file?.name || file?.title}`, url: window.location.href, title: "SCSIT File" }}>
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
                className="relative overflow-auto flex items-center justify-center p-4"
                onDoubleClick={(e) => e.preventDefault()}
            >
                <Watermark />
                <motion.div
                    animate={{ rotate: rotation }}
                    style={{ width: `${zoom}%`, height: `${zoom}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                    className="relative flex items-center justify-center"
                >
                    {file?.type === "document" && pdfUrl ? (
                        <div className="relative w-full h-full" onContextMenu={(e) => e.preventDefault()}>
                            <iframe src={pdfUrl} title={file.title} className="w-full h-full border-0 rounded-lg bg-white shadow-2xl" />
                        </div>
                    ) : file?.type === "image" ? (
                        <SecureImage src={file.fileUrl || file.url} alt={file.title} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-white text-center">Loading preview...</div>
                    )}
                </motion.div>
            </main>
      
            <footer className="z-30">
                <div className="sm:hidden bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2 flex items-center justify-around">
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
                <div className="hidden sm:block bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2">
                    <div className="max-w-7xl mx-auto text-center text-gray-400 text-xs">
                        Use zoom and rotate controls to adjust the view. Right-click and downloads are disabled for security.
                    </div>
                </div>
            </footer>
        </motion.div>
    )
}

export default ShareFilePage;