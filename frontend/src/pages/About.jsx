"use client"

import { useContext, useEffect } from "react"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"
import { Target, BookOpen, Users, Archive, Filter, Shield, Upload, BrainCircuit, Database, Wind, Palette, Linkedin, ArrowRight, Cloud } from "lucide-react"
import { ValuesContext } from "../context/ValuesContext"
import { useSwipeable } from "react-swipeable"

const Section = ({ title, children }) => (
    <div className="mb-20">
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
        >
            {title}
        </motion.h2>
        {children}
    </div>
);

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Archive, title: "Centralized Repository", description: "End the frantic search. Our platform organizes years of papers, notes, and syllabi into one unified library, structured by course and semester.", href: "/scsit/courses" },
    { icon: Filter, title: "Advanced Search & Filter", description: "Find exactly what you need in seconds. Use our powerful global search or apply specific filters for subjects, years, and categories.", href: "/allfiles" },
    { icon: Shield, title: "Secure In-App Viewer", description: "Preview documents and images directly in the browser with zoom and rotate controls. No more unnecessary downloads or context switching.", href: null },
    { icon: Upload, title: "Community Driven Content", description: "The archive is kept relevant and growing by admins. The upload system makes contributing new materials simple and efficient.", href: "/upload" },
  ];

  const developers = [
    { name: "Pratik Ajbe", role: "Full-Stack Developer", linkedinUrl: "https://www.linkedin.com/in/pratik-ajbe-710bb326a/", imageUrl: "https://media.licdn.com/dms/image/v2/D4D03AQEnC-bYyRf3gQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1697458598982?e=1756339200&v=beta&t=BzhNEaXfk1trIXNUPCGV6hYNkIjnKvGU5SmwBb6pAmU" },
    { name: "Balram Dhakad", role: "Full-Stack Developer", linkedinUrl: "https://www.linkedin.com/in/balram-dhakad-2a9110210/", imageUrl: "https://media.licdn.com/dms/image/v2/D5603AQHB2Xyb8bUzsA/profile-displayphoto-shrink_800_800/B56ZcplHMmGsAc-/0/1748749285834?e=1756339200&v=beta&t=-SRxJ52qlgxvp4gmkb4jmhJ56QTFwYg89Q93TAd4B0Q" }
  ];

  const techStack = [
    { name: "React", icon: BrainCircuit },
    { name: "Node.js & Express", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
    { name: "MongoDB", icon: Database },
    { name: "Tailwind CSS", icon: Wind },
    { name: "Framer Motion", icon: Palette },
    { name: "Cloudinary", icon: Cloud },
  ];

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

  return (
    <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-500 text-white p-0 pb-16 pt-24 overflow-x-hidden">
      <Helmet>
        <title>About Us - LastMinute SCSIT</title>
        <meta name="description" content="Learn about the mission and technology behind LastMinute SCSIT, the academic resource hub for SCSIT, Indore." />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Connecting Knowledge, Empowering Students.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            LastMinute SCSIT was born from a simple idea: to eliminate the stress of finding academic resources and create a single source of truth for every student at the School of Computer Science & IT.
          </p>
        </motion.div>

        <Section title="What We Offer">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700 flex flex-col group hover:border-green-400/50 transition-all duration-300">
                        <div className="absolute -top-3 -left-3 w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600 group-hover:bg-green-500/20 group-hover:border-green-500 transition-all duration-300">
                            <feature.icon className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold mt-12 mb-3">{feature.title}</h3>
                        <p className="text-gray-400 flex-grow">{feature.description}</p>
                        {feature.href && (
                            <button onClick={() => navigate(feature.href)} className="mt-6 text-green-400 font-semibold hover:text-green-300 transition-colors flex items-center gap-2 self-start">
                                Explore <ArrowRight size={16} />
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        </Section>

        <Section title="Meet the Developers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {developers.map((dev, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700 text-center flex flex-col items-center group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-green-500/20 to-transparent"></div>
                        <img className="relative w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-600 group-hover:border-green-500 transition-colors duration-300" src={dev.imageUrl} alt={dev.name} />
                        <h3 className="text-2xl font-bold text-white">{dev.name}</h3>
                        <p className="text-green-400 font-semibold">{dev.role}</p>
                        <a href={dev.linkedinUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
                            <Linkedin size={16} /> Connect on LinkedIn
                        </a>
                    </motion.div>
                ))}
            </div>
        </Section>

        <Section title="Technology Stack">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
                {techStack.map((tech, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="flex flex-col items-center group">
                        <div className="h-20 w-20 mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            {typeof tech.icon === 'string' ? (
                                <img src={tech.icon} alt={tech.name} className="h-16 w-16" />
                            ) : (
                                <tech.icon className="w-16 h-16 text-gray-400 group-hover:text-white transition-colors duration-300" />
                            )}
                        </div>
                        <h4 className="font-semibold text-white transition-colors duration-300 group-hover:text-green-400">{tech.name}</h4>
                    </motion.div>
                ))}
            </div>
        </Section>
      </div>
    </div>
  )
}

export default AboutPage;