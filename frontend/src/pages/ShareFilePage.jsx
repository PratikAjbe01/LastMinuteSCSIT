"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X, ZoomIn, ZoomOut, RotateCw, Eye, Share2, Loader, RefreshCcw, RefreshCcwDot, File } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { RWebShare } from "react-web-share"
import { API_URL, CLIENT_URL } from "../utils/urls"
import Img from "../components/lazyLoadImage/Img"

const Watermark = () => {
  const watermarkText = "© LastMinute SCSIT";
  return (
    <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none select-none">
      <div className="absolute -inset-1/4">
        {Array.from({ length: 150 }).map((_, i) => (
          <p
            key={i}
            className="text-white/40 font-bold text-2xl whitespace-nowrap opacity-50"
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
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const mainRef = useRef(null);
  const contentRef = useRef(null);

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
      } catch (err) {
        console.error("Error fetching file:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  useEffect(() => {
    const increaseViews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/files/increasefileviews`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: id || file._id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('View count increased:', result);
      } catch (error) {
        console.error('Error increasing file views:', error);
      }
    };

    if (id) {
      increaseViews();
    }
  }, [id]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('no-scroll', 'no-select');

    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U") || (e.ctrlKey && e.key === "s")
      ) {
        e.preventDefault();
      }
    };
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('no-scroll', 'no-select');
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (file?.type === "document" && (file.fileUrl || file.url)) {
      const initialUrl = file.fileUrl || file.url;
      let finalUrlForGoogle;

      try {
        const urlObject = new URL(initialUrl);
        if (urlObject.hostname === 'localhost' && urlObject.searchParams.has('url')) {
          finalUrlForGoogle = urlObject.searchParams.get('url');
        } else {
          finalUrlForGoogle = initialUrl;
        }
      } catch (error) {
        finalUrlForGoogle = initialUrl;
      }

      const encodedUrl = encodeURIComponent(finalUrlForGoogle);
      setPdfUrl(`https://docs.google.com/gview?url=${encodedUrl}&embedded=true`);
    }
  }, [file]);

  const handleReloadPdf = () => {
    setReloadKey(prevKey => prevKey + 1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
      mainRef.current.scrollLeft = 0;
    }
  };

  const onClose = () => navigate('/');

  const contentStyle = {
    transform: `scale(${zoom}) rotate(${rotation}deg)`,
    transformOrigin: 'center center',
    transition: 'transform 0.2s ease-out',
    maxWidth: 'none',
    maxHeight: 'none',
    width: file?.type === 'document' ? '100%' : 'auto',
    height: file?.type === 'document' ? '100%' : 'auto',
  };

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900 z-50 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
      <header className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-b border-gray-700 p-2 sm:p-4 flex items-center justify-between gap-2 z-30">
        <div className="flex items-center space-x-3 min-w-0">
          <File className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm sm:text-base">{file.name || file.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            title={`${file?.views || 0} Views`}
            className="group flex cursor-pointer items-center justify-center gap-x-1.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-sm px-3 py-2 text-sm font-medium shadow-lg shadow-black/20 transition-all duration-300 ease-out hover:border-green-400/40 hover:bg-green-500/15 hover:shadow-xl hover:shadow-green-500/20 active:shadow-md min-w-[70px]"
          >
            <Eye className="h-4 w-4 text-green-400 transition-all duration-300 group-hover:text-green-300 group-hover:drop-shadow-sm flex-shrink-0" />
            <span className="font-semibold tracking-wider text-green-300 transition-all duration-300 group-hover:text-green-200 group-hover:drop-shadow-sm leading-none tabular-nums">
              {file?.views || 0}
            </span>
          </motion.div>
          <div className="hidden sm:flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomOut} className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors" disabled={zoom <= 0.5}>
              <ZoomOut className="w-4 h-4" />
            </motion.button>
            <span className="text-gray-300 text-sm px-2 min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomIn} className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors" disabled={zoom >= 3}>
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
          <RWebShare data={{ text: `Check out this file from SCSIT: ${file?.name || file?.title}`, url: `${CLIENT_URL}/share/file/${file?._id}`, title: `LastMinute SCSIT Shared you a file - ${file?.name || file?.title}` }}>
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
        className="relative overflow-auto grid place-items-center p-4 file-viewer-content"
        onDoubleClick={(e) => e.preventDefault()}
      >
        <div
          ref={contentRef}
          style={contentStyle}
          className="relative flex items-center justify-center"
        >
          <Watermark />
          <div
            className="w-full h-full flex items-center justify-center"
            onContextMenu={(e) => e.preventDefault()}
          >
            {file?.type === "document" && pdfUrl ? (
              <iframe
                key={reloadKey}
                src={pdfUrl}
                title={file.title}
                className="w-full h-full border-0 rounded-lg bg-white shadow-2xl"
              />
            ) : file?.type === "image" ? (
              <Img
                src={file.fileUrl || file.url}
                alt={file.title}
                className="object-contain max-w-full max-h-full"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            ) : (
              <div className="text-white text-center">Loading preview...</div>
            )}
          </div>
        </div>
      </main>

      <footer className="z-30">
        <div className="sm:hidden bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2 flex items-center justify-around">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomOut} className={`p-3 rounded-lg ${zoom <= 0.5 ? 'bg-gray-600 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300'}`} disabled={zoom <= 0.5}>
            <ZoomOut className="w-5 h-5" />
          </motion.button>
          <span className="text-gray-200 text-base font-semibold px-4 py-2 bg-gray-700 rounded-lg min-w-[70px] text-center">{Math.round(zoom * 100)}%</span>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleZoomIn} className={`p-3 rounded-lg ${zoom >= 3 ? 'bg-gray-600 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300'}`} disabled={zoom >= 3}>
            <ZoomIn className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleReset} className="p-3 bg-green-600 text-white rounded-lg">
            <RefreshCcw className="w-5 h-5" />
          </motion.button>
          {file?.type === 'document' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReloadPdf}
              className="p-3 bg-blue-600 text-white rounded-lg"
              title="Reload PDF"
            >
              <RefreshCcwDot className="w-5 h-5" />
            </motion.button>
          )}
        </div>
        <div className="hidden sm:block bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2">
          <div className="max-w-7xl mx-auto text-center text-gray-400 text-xs flex justify-between items-center">
            <p>Use zoom and rotate controls to adjust the view. Right-click and downloads are disabled for security.</p>
            {file?.type === 'document' && (
              <div className="flex items-center space-x-2">
                <p>Reload PDF, if not loaded.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReloadPdf}
                  className="p-1 bg-blue-600 text-white rounded-lg"
                  title="Reload PDF"
                >
                  <RefreshCcwDot className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default ShareFilePage;