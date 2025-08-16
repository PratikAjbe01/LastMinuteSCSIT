"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimationControls, useMotionValue } from "framer-motion";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  X,
  Quote,
  GraduationCap,
  BookCopy,
} from "lucide-react";
import { API_URL } from "../utils/urls";
import { useAuthStore } from "../store/authStore";

const ViewTestimonialModal = ({ testimonial, onClose }) => {
  if (!testimonial) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-slate-800/50 border border-slate-700 rounded-2xl w-full max-w-3xl grid md:grid-cols-3 overflow-hidden"
      >
        <div className="p-8 flex flex-col items-center justify-center text-center bg-slate-900/50 border-r border-slate-700">
          <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white text-4xl shrink-0">
            {testimonial.username
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <h3 className="text-xl font-bold text-white">
            {testimonial.username}
          </h3>
          <p className="text-sm text-gray-400 mb-4">{testimonial.userEmail}</p>

          <div className="text-left w-full space-y-3 text-sm">
            {testimonial.course && (
              <div className="flex items-center gap-2 text-gray-300">
                <BookCopy size={14} className="text-green-400 shrink-0" />
                <span>{testimonial.course}</span>
              </div>
            )}
            {testimonial.semester && (
              <div className="flex items-center gap-2 text-gray-300">
                <GraduationCap size={14} className="text-green-400 shrink-0" />
                <span>Semester {testimonial.semester}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 md:col-span-2 flex flex-col">
          {testimonial.rating && (
            <div
              className={`text-sm font-bold self-start px-4 py-1.5 rounded-full mb-4 ${testimonial.rating === "Outstanding" ? "bg-green-500/20 text-green-300" : "bg-sky-500/20 text-sky-300"}`}
            >
              {testimonial.rating}
            </div>
          )}
          <div className="relative flex-grow">
            <Quote className="absolute top-0 left-0 w-16 h-16 text-slate-700/50" />
            <p className="relative text-gray-200 text-lg leading-relaxed max-h-64 overflow-y-auto pr-2">
              {testimonial.text}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </motion.div>
    </motion.div>
  );
};

const Testimonials = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [viewModalData, setViewModalData] = useState(null);

  useEffect(() => {
    if (viewModalData) {
      document.body.style.overflow = "hidden";
      controls.stop();
    } else {
      document.body.style.overflow = "auto";
      if (!hoverRef.current) {
        startMarquee();
      }
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [viewModalData]);

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const duplicatedTestimonials = useMemo(
    () => (isMarqueeActive ? [...testimonials, ...testimonials] : testimonials),
    [testimonials, isMarqueeActive],
  );

  const CARD_WIDTH = 400;
  const GAP = 32;
  const TOTAL_CARD_WIDTH = CARD_WIDTH + GAP;
  const MARQUEE_DURATION = 40;

  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const hoverRef = useRef(false);

  const totalWidth = TOTAL_CARD_WIDTH * testimonials.length;

  const startMarquee = () => {
    if (!isMarqueeActive) return;
    controls.start({
      x: -totalWidth,
      transition: {
        duration: MARQUEE_DURATION,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  };

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_URL}/api/testimonials/getalltestimonialsapproved`,
        );
        const data = await response.json();
        if (data.success) {
          setTestimonials(data.testimonials);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (isLoading || testimonials.length === 0) return;

    const checkWidth = () => {
      if (containerRef.current && contentRef.current) {
        const contentWidth = contentRef.current.scrollWidth;
        const containerWidth = containerRef.current.offsetWidth;
        setIsMarqueeActive(contentWidth > containerWidth);
      }
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [isLoading, testimonials]);

  useEffect(() => {
    if (isMarqueeActive) {
      startMarquee();
    } else {
      controls.stop();
      x.set(0);
    }
  }, [isMarqueeActive]);

  const handleMouseEnter = () => {
    if (!isMarqueeActive) return;
    hoverRef.current = true;
    controls.stop();
  };

  const handleMouseLeave = () => {
    if (!isMarqueeActive) return;
    hoverRef.current = false;
    startMarquee();
  };

  const handleNavigation = (direction) => {
    if (!isMarqueeActive) return;
    controls.stop();
    const currentX = x.get();
    let targetX =
      direction === "next"
        ? currentX - TOTAL_CARD_WIDTH
        : currentX + TOTAL_CARD_WIDTH;
    targetX = Math.min(0, targetX);

    controls
      .start({
        x: targetX,
        transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
      })
      .then(() => {
        if (totalWidth > 0) {
          const finalX = x.get();
          const wrappedX = finalX % totalWidth;
          if (finalX !== wrappedX) {
            x.set(wrappedX);
          }
        }
        if (!hoverRef.current) {
          startMarquee();
        }
      });
  };

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 !z-40">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-20"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                What Our Users Say
              </span>
            </h2>

            <p className="text-gray-400 text-xl max-w-2xl leading-relaxed">
              Real feedback from students who use LastMinuteSCSIT to excel.
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/about?action=postreview")}
              className="group relative px-6 py-3.5 bg-white/5 border border-white/10 rounded-full text-gray-300 hover:text-white transition-colors duration-300 active:bg-white/15 cursor-pointer"
            >
              <span className="flex items-center gap-2 font-semibold">
                <MessageSquarePlus className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                Post a Review
              </span>
            </motion.button>

            {isMarqueeActive && (
              <>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavigation("prev")}
                  className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors duration-300 active:bg-white/15"
                >
                  <ChevronLeft className="w-7 h-7" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavigation("next")}
                  className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors duration-300 active:bg-white/15"
                >
                  <ChevronRight className="w-7 h-7" />
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div
            className={`${isMarqueeActive ? "absolute" : "hidden"} -inset-y-8 -inset-4 left-0 w-24 z-10 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none hidden sm:block`}
          />

          <div
            className={`${isMarqueeActive ? "absolute" : "hidden"} -inset-y-8 -right-4 w-24 z-10 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none hidden sm:block`}
          />

          {isLoading ? (
            <div className="text-center text-gray-400 py-20">
              Loading testimonials...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center bg-slate-800/50 rounded-2xl p-12 border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-4">
                No Testimonials Yet
              </h3>

              <p className="text-gray-400">
                Be the first to share your experience by posting a review.
              </p>
            </div>
          ) : (
            <div
              ref={containerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={`flex gap-8 ${isMarqueeActive ? "overflow-hidden cursor-grab active:cursor-grabbing" : "justify-center flex-wrap"}`}
            >
              <motion.div
                ref={contentRef}
                className="flex shrink-0 gap-8"
                animate={controls}
                style={{ x }}
              >
                {duplicatedTestimonials.map((testimonial, index) => (
                  <div
                    key={`${testimonial._id}-${index}`}
                    onClick={() => setViewModalData(testimonial)}
                    className="w-[320px] sm:w-[400px] shrink-0 flex flex-col justify-between p-4 sm:p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors duration-300 hover:border-green-400/80 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white text-base sm:text-lg shrink-0">
                          {testimonial.username
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-base sm:text-lg">
                            {testimonial.username}
                          </h4>

                          <p className="text-gray-400 text-xs sm:text-sm">
                            {testimonial.userEmail}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-300 leading-relaxed mb-2 text-sm sm:text-base">
                        "{testimonial.text?.substr(0, 70)} ..."
                      </p>

                      <p className="text-gray-500 text-xs mt-1 mb-2 sm:mb-3">
                        {testimonial.course && testimonial.semester
                          ? `${testimonial.course} - Sem ${testimonial.semester}`
                          : "Not Set"}
                      </p>
                    </div>

                    {testimonial.rating && (
                      <div
                        className={`text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full w-fit ${testimonial.rating === "Outstanding" ? "bg-green-500/20 text-green-400" : "bg-sky-500/20 text-sky-400"}`}
                      >
                        {testimonial.rating}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
      <ViewTestimonialModal
        testimonial={viewModalData}
        onClose={() => setViewModalData(null)}
      />
    </div>
  );
};

export default Testimonials;
