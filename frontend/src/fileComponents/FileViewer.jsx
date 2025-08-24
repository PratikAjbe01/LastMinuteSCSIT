"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Share2,
  RefreshCcw,
  RefreshCcwDot,
  EyeIcon,
  EyeOff,
  File,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { RWebShare } from "react-web-share";
import Img from "../components/lazyLoadImage/Img";
import { API_URL, CLIENT_URL } from "../utils/urls";
import { useAuthStore } from "./../store/authStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import MarkdownRenderer from "./MarkdownRenderer2";
import { Helmet } from "react-helmet-async";

const Watermark = ({ file }) => {
  const watermarkText = "© LastMinute SCSIT";
  return (
    <div className="absolute hidden sm:hidden inset-0 z-10 overflow-hidden pointer-events-none select-none" style={{ display: file.type === "text" ? "none" : "block" }}>
      <div className="absolute -inset-1/4">
        {Array.from({ length: 150 }).map((_, i) => (
          <p
            key={i}
            className="bg-white/40 font-bold text-2xl whitespace-nowrap opacity-50"
            style={{
              position: "absolute",
              top: `${(i * 10) % 150}%`,
              left: `${(i * 4) % 100}%`,
              transform: "rotate(-30deg)",
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
  const { user } = useAuthStore();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const mainRef = useRef(null);
  const contentRef = useRef(null);
  const [isToggleUiButtonVisible, setIsToggleUiButtonVisible] = useState(false);

  useEffect(() => {
    const handleToggleUiButtonVisibility = (e) => {
      if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        setIsToggleUiButtonVisible((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleToggleUiButtonVisibility);

    return () => {
      document.removeEventListener("keydown", handleToggleUiButtonVisibility);
    };
  }, []);

  useEffect(() => {
    const increaseViews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/files/increasefileviews`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: file._id, userId: user?._id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("View count increased:", result);
      } catch (error) {
        console.error("Error increasing file views:", error);
      }
    };

    const addFileToUserOpenedArray = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/add-opened-file`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileId: file._id, userId: user?._id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("View count increased:", result);
      } catch (error) {
        console.error("Error increasing file views:", error);
      }
    };

    if (file && file._id) {
      increaseViews();
    }
    if (user?._id) {
      addFileToUserOpenedArray();
    }
  }, [file]);

  const increaseFileShares = async () => {
    try {
      const response = await fetch(`${API_URL}/api/files/increasefileshares`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: file._id, userId: user?._id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Share count increased:", result);
    } catch (error) {
      console.error("Error increasing file shares:", error);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const [reloadKey, setReloadKey] = useState(0);

  const handleReloadPdf = () => {
    setReloadKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalHeight = document.body.style.height;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.height = "100%";
    document.body.style.width = "100%";
    document.body.style.touchAction = "none";
    document.body.classList.add("no-scroll", "no-select");

    const preventScroll = (e) => {
      if (!contentRef.current || contentRef.current.contains(e.target)) {
        return;
      }
      e.preventDefault();
      return false;
    };

    const preventTouchMove = (e) => {
      if (e.target.closest(".file-viewer-content")) {
        return;
      }
      e.preventDefault();
      return false;
    };

    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });
    document.addEventListener("scroll", preventScroll, { passive: false });

    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U") ||
        (e.metaKey &&
          e.altKey &&
          (e.key === "i" || e.key === "j" || e.key === "c")) ||
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
      document.body.classList.remove("no-scroll", "no-select");
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventTouchMove);
      document.removeEventListener("scroll", preventScroll);
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
        if (
          urlObject.hostname === "localhost" &&
          urlObject.searchParams.has("url")
        ) {
          finalUrlForGoogle = urlObject.searchParams.get("url");
        } else {
          finalUrlForGoogle = initialUrl;
        }
      } catch (error) {
        finalUrlForGoogle = initialUrl;
      }

      const encodedUrl = encodeURIComponent(finalUrlForGoogle);
      setPdfUrl(
        `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`,
      );
    }
  }, [file]);

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

  console.log(file);

  const contentStyle = {
    transform: `scale(${zoom}) rotate(${rotation}deg)`,
    transformOrigin: "center center",
    transition: "transform 0.2s ease-out",
    maxWidth: "none",
    maxHeight: "none",
    width: file?.type === "document" ? "100%" : "auto",
    height: file?.type === "document" ? "100%" : "auto",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-gray-900 z-50 grid h-screen overflow-hidden ${isUiVisible ? "grid-rows-[auto_1fr_auto]" : "grid-rows-[1fr]"
        }`}
    >
      <Helmet>
        <title>{"Viewing file: " + (file.name || file.title) + " | Last Minute SCSIT"}</title>
        <meta name="description" content={`View ${file.name || file.title}`} />
      </Helmet>
      <AnimatePresence>
        {isUiVisible && (
          <motion.header
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-b border-gray-700 p-2 sm:p-4 flex items-center justify-between gap-2 z-30"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <File className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm sm:text-base">
                  {file.name || file.title}
                </p>
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleZoomOut}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </motion.button>
                <span className="text-gray-300 text-sm px-2 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleZoomIn}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRotate}
                className="p-2 sm:p-3 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-green-600/80 text-white hover:bg-green-600 rounded-lg transition-colors text-sm font-medium"
              >
                <RefreshCcw className="w-4 h-4" />
                Reset
              </motion.button>
              <motion.button onClick={() => increaseFileShares()}>
                <RWebShare
                  data={{
                    text: `Check out this file from SCSIT: ${file?.name || file?.title}`,
                    url: `${CLIENT_URL}/share/file/${file?._id}`,
                    title: `LastMinute SCSIT Shared you a file - ${file?.name || file?.title}`,
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center p-2 sm:p-[10px] text-gray-300 hover:text-white hover:bg-gray-600 transition-all duration-200 bg-gray-700 rounded-lg"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </RWebShare>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 sm:p-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <main
        ref={mainRef}
        className={`relative overflow-auto grid place-items-center file-viewer-content ${isUiVisible ? "p-2 sm:p-4" : "p-0"}`}
        onDoubleClick={(e) => e.preventDefault()}
      >
        <div
          ref={contentRef}
          style={contentStyle}
          className="relative flex items-center justify-center"
        >
          {/* <Watermark file={file} /> */}
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
            ) : file?.type === "text" ? (
              <div className="prose prose-invert prose-lg max-w-none w-full h-full p-4 sm:p-6 overflow-auto rounded-lg bg-white text-left">
                <MarkdownRenderer content={file?.text} />
              </div>
            ) : (
              <div className="text-white text-center">Loading preview...</div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isUiVisible && (
          <motion.footer
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="z-30"
          >
            <div className="sm:hidden bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-2 flex items-center justify-around">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomOut}
                className={`p-3 rounded-lg ${zoom <= 0.5 ? "bg-gray-600 text-gray-500 cursor-not-allowed" : "bg-gray-700 text-gray-300"}`}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-5 h-5" />
              </motion.button>
              <span className="text-gray-200 text-base font-semibold px-4 py-2 bg-gray-700 rounded-lg min-w-[70px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomIn}
                className={`p-3 rounded-lg ${zoom >= 3 ? "bg-gray-600 text-gray-500 cursor-not-allowed" : "bg-gray-700 text-gray-300"}`}
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="p-3 bg-green-600 text-white rounded-lg"
              >
                <RefreshCcw className="w-5 h-5" />
              </motion.button>
              {file?.type === "document" && (
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
              <div
                className="max-w-7xl mx-auto text-center text-gray-400 text-xs flex items-center"
                style={{
                  justifyContent:
                    file.type === "document" ? "space-between" : "center",
                }}
              >
                <p>
                  Use zoom and rotate controls to adjust the view. Right-click and
                  downloads are disabled for security.
                </p>
                {file?.type === "document" && (
                  <div className="flex items-center space-x-2">
                    <p>Reload PDF, if not loaded.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReloadPdf}
                      className="p-2 bg-blue-600 text-white rounded-lg"
                      title="Reload PDF"
                    >
                      <RefreshCcwDot className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isToggleUiButtonVisible && (
          <motion.button
            onClick={() => setIsUiVisible(!isUiVisible)}
            className="fixed bottom-12 right-5 z-40 bg-green-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9, rotate: -15 }}
            title={isUiVisible ? "Hide UI" : "Show UI"}
            aria-label={isUiVisible ? "Hide UI" : "Show UI"}
          >
            <AnimatePresence mode="wait">
              {isUiVisible ? (
                <motion.div
                  key="eye-off"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  <EyeOff className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="eye"
                  initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  transition={{ duration: 0.2 }}
                >
                  <Eye className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showLoader && (
          <motion.div
            className="fixed bottom-12 left-5 z-40 flex items-center gap-3 rounded-full bg-gray-900/80 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ ease: "easeInOut", duration: 0.4 }}
          >
            <RefreshCcw className="h-4 w-4 animate-spin text-green-400" />
            <span>Preparing Preview...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FileViewer;
