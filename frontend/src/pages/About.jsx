"use client"

import { useContext, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"
import { Target, BookOpen, Users, Archive, Filter, Shield, Upload, BrainCircuit, Database, Wind, Palette, Linkedin, ArrowRight, Cloud, Github, Mail, Code, Zap, Globe, Lightbulb, TrendingUp, Heart, Award, Calendar, Clock, BookMarked, Workflow, File, Files, GraduationCap, Home, PanelTopClose, FileChartPie } from "lucide-react"
import { ValuesContext } from "../context/ValuesContext"
import { useSwipeable } from "react-swipeable"
import { API_URL } from "../utils/urls"

const Section = ({ title, children, subtitle }) => (
    <div className="mb-20">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
        >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                {title}
            </h2>
            {subtitle && <p className="mt-4 text-gray-400 max-w-2xl mx-auto">{subtitle}</p>}
        </motion.div>
        {children}
    </div>
);

const FeatureCard = ({ feature, index, navigate }) => (
    <motion.div 
        key={index} 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.5, delay: index * 0.1 }} 
        className="relative bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700 flex flex-col group hover:border-green-400/50 transition-all duration-300 h-full"
    >
        <div className="absolute -top-3 -left-3 w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600 group-hover:bg-green-500/20 group-hover:border-green-500 transition-all duration-300">
            <feature.icon className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold mt-12 mb-3">{feature.title}</h3>
        <p className="text-gray-400 flex-grow">{feature.description}</p>
        {feature.href && (
            <button 
                onClick={() => navigate(feature.href)} 
                className="mt-6 text-green-400 font-semibold hover:text-green-300 transition-colors flex items-center gap-2 self-start"
            >
                Explore <ArrowRight size={16} />
            </button>
        )}
    </motion.div>
);

const DeveloperCard = ({ dev, index }) => (
    <motion.div 
        key={index} 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.5, delay: index * 0.1 }} 
        className="relative bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700 text-center flex flex-col items-center group overflow-hidden h-full"
    >
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-green-500/20 to-transparent"></div>
        <img 
            className="relative w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-600 group-hover:border-green-500 transition-colors duration-300 object-cover" 
            src={dev.imageUrl} 
            alt={dev.name} 
        />
        <h3 className="text-2xl font-bold text-white">{dev.name}</h3>
        <p className="text-green-400 font-semibold mb-4">{dev.role}</p>
        <div className="flex gap-3 mt-auto">
            <a 
                href={dev.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-blue-600 text-white rounded-full transition-colors"
            >
                <Linkedin size={18} />
            </a>
            <a 
                href={dev.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            >
                <Github size={18} />
            </a>
            <a 
                href={`mailto:${dev.email}`} 
                className="inline-flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-green-600 text-white rounded-full transition-colors"
            >
                <Mail size={18} />
            </a>
        </div>
    </motion.div>
);

const TechIcon = ({ tech, index }) => (
    <motion.div 
        key={index} 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.5, delay: index * 0.1 }} 
        className="flex flex-col items-center group"
    >
        <div className="h-20 w-20 mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            {typeof tech.icon === 'string' ? (
                <img src={tech.icon} alt={tech.name} className="h-16 w-16" />
            ) : (
                <tech.icon className="w-16 h-16 text-gray-400 group-hover:text-white transition-colors duration-300" />
            )}
        </div>
        <h4 className="font-semibold text-white transition-colors duration-300 group-hover:text-green-400">{tech.name}</h4>
    </motion.div>
);

const StatCard = ({ icon: Icon, value, label, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 text-center"
    >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-green-400" />
        </div>
        <div className="text-3xl font-bold text-white mb-2">{value}</div>
        <div className="text-gray-400">{label}</div>
    </motion.div>
);

const ValueCard = ({ icon: Icon, title, description, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 text-center group hover:border-green-400/50 transition-all duration-300"
    >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 transition-colors duration-300">
            <Icon className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </motion.div>
);

const TimelineItem = ({ year, title, description, index }) => (
    <motion.div
        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-12`}
    >
        <div className="md:w-1/2 mb-4 md:mb-0">
            <div className={`p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                <div className="text-green-400 font-bold text-lg mb-2">{year}</div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400">{description}</p>
            </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
            <div className="w-4 h-4 bg-green-500 rounded-full border-4 border-gray-900 z-10"></div>
        </div>
        <div className="md:w-1/2"></div>
    </motion.div>
);

const AboutPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { icon: Files, value: "0", label: "Documents" },
    { icon: Users, value: "0", label: "Active Users" },
    { icon: GraduationCap, value: "13", label: "Courses" },
    { icon: Calendar, value: "1", label: "Active Year" },
  ]);

  const features = [
    { icon: Archive, title: "Centralized Repository", description: "All academic resources organized by course and semester in one place.", href: "/scsit/courses" },
    { icon: Filter, title: "Advanced Search", description: "Find resources instantly with powerful search and filtering options.", href: "/allfiles" },
    { icon: Shield, title: "Secure Viewer", description: "Preview documents directly in browser with zoom and rotate controls.", href: null },
    { icon: Upload, title: "Community Driven", description: "Contribute and access resources uploaded by the student community.", href: "/upload" },
    { icon: Target, title: "Study Tools", description: "Integrated tools for CGPA calculation and attendance management.", href: "/calculations/tools/cgpa" },
    { icon: BookOpen, title: "Task Planner", description: "Organize your studies with built-in task and deadline management.", href: "/planner/todos" },
    { icon: Users, title: "User Management", description: "Personalized dashboard and profile management for each student.", href: "/profile" },
    { icon: FileChartPie, title: "Admin Dashboard", description: "Comprehensive admin tools for content and user management.", href: "/allfiles/admin" },
  ];

   const developers = [
    { 
      name: "Pratik Ajbe", 
      role: "Full-Stack Developer", 
      linkedinUrl: "https://www.linkedin.com/in/pratik-ajbe-710bb326a/",  
      githubUrl: "https://github.com/PratikAjbe01",
      email: "pratikajbe40@gmail.com",
      imageUrl: "https://media.licdn.com/dms/image/v2/D4D03AQEnC-bYyRf3gQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1697458598982?e=1756339200&v=beta&t=BzhNEaXfk1trIXNUPCGV6hYNkIjnKvGU5SmwBb6pAmU" 
    },
    { 
      name: "Balram Dhakad", 
      role: "Full-Stack Developer", 
      linkedinUrl: "https://www.linkedin.com/in/balram-dhakad-2a9110210/",  
      githubUrl: "https://github.com/balram2002",
      email: "bdhakad886@gmail.com",
      imageUrl: "https://media.licdn.com/dms/image/v2/D5603AQHB2Xyb8bUzsA/profile-displayphoto-shrink_800_800/B56ZcplHMmGsAc-/0/1748749285834?e=1756339200&v=beta&t=-SRxJ52qlgxvp4gmkb4jmhJ56QTFwYg89Q93TAd4B0Q" 
    }
  ];

  const techStack = [
    { name: "React", icon: BrainCircuit },
    { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Express", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
    { name: "MongoDB", icon: Database },
    { name: "Tailwind CSS", icon: Wind },
    { name: "Framer Motion", icon: Zap },
    { name: "Cloudinary", icon: Cloud },
    { name: "JWT", icon: Shield },
  ];

  const values = [
    { icon: Lightbulb, title: "Innovation", description: "Constantly evolving to meet student needs with cutting-edge solutions." },
    { icon: Heart, title: "Community", description: "Built by students, for students, fostering collaborative learning." },
    { icon: Target, title: "Excellence", description: "Commitment to providing the highest quality academic resources." },
    { icon: TrendingUp, title: "Growth", description: "Empowering students to achieve their academic potential." },
  ];

  const timeline = [
    { year: "Dec 2024", title: "The Problem", description: "End-semester resource mismanagement highlighted the need for a centralized academic platform." },
    { year: "Feb 2025", title: "Planning & Design", description: "Conceptualized platform architecture and user experience design." },
    { year: "Jul 2025", title: "Development", description: "Started full-scale development with beta testing among select students." },
    { year: "Aug 2025", title: "Public Release", description: "Launched stable version to the entire SCSIT community." },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersResponse = await fetch(`${API_URL}/api/auth/fetchallusers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : ''}`,
          }
        });

        const usersResult = await usersResponse.json();
        const usersCount = usersResult.success ? usersResult.users.length : 0;

        // Fetch files count
        const filesResponse = await fetch(`${API_URL}/api/files/allfiles`);
        const filesResult = await filesResponse.json();
        const filesCount = filesResult.success ? filesResult.data.length : 0;

        // Update stats
        setStats(prevStats => [
          { icon: Files, value: filesCount.toString(), label: "Documents" },
          { icon: Users, value: usersCount.toString(), label: "Active Users" },
          { icon: GraduationCap, value: "13", label: "Courses" },
          { icon: Calendar, value: "1", label: "Active Year" },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  const { isSidebarOpen, setIsSidebarOpen } = useContext(ValuesContext);
  
  const isExcludedRoute = typeof window !== 'undefined' && 
    (window.location.pathname.startsWith("/login") || window.location.pathname === "/signup");
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile && !isExcludedRoute) {
        setIsSidebarOpen(true);
      }
    },
    onSwipedRight: () => {
      if (isMobile && !isExcludedRoute && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    },
    preventDefaultTouchmoveEvent: false,
    trackMouse: false,
    delta: 30,
  });

  return (
    <div {...swipeHandlers} className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 text-white p-0 pb-16 pt-24 overflow-x-hidden">
      <Helmet>
        <title>About Us - LastMinute SCSIT</title>
        <meta name="description" content="Learn about the mission and technology behind LastMinute SCSIT, the academic resource hub for SCSIT, Indore." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">LastMinute SCSIT</h1>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text mb-6">
            Academic Excellence, Simplified.
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Empowering SCSIT students with a centralized platform for academic resources, 
            study tools, and collaborative learning.
          </p>
        </motion.div>

        <Section title="By The Numbers" subtitle="Our impact on the SCSIT community">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} index={index} />
            ))}
          </div>
        </Section>

        <Section title="Core Features" subtitle="Designed to streamline your academic journey">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} navigate={navigate} />
            ))}
          </div>
        </Section>

        <Section title="Our Values" subtitle="Principles that guide our development">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <ValueCard key={index} {...value} index={index} />
            ))}
          </div>
        </Section>

        <Section title="Meet the Developers" subtitle="The minds behind the platform">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {developers.map((dev, index) => (
              <DeveloperCard key={index} dev={dev} index={index} />
            ))}
          </div>
        </Section>

        <Section title="Technology Stack" subtitle="Built with modern tools for optimal performance">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
            {techStack.map((tech, index) => (
              <TechIcon key={index} tech={tech} index={index} />
            ))}
          </div>
        </Section>

        <Section title="Our Journey" subtitle="Milestones in our development">
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-700"></div>
            <div className="space-y-0">
              {timeline.map((item, index) => (
                <TimelineItem key={index} {...item} index={index} />
              ))}
            </div>
          </div>
        </Section>

        <Section title="Our Mission">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
              <Globe className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <p className="text-xl text-gray-300 mb-6">
                "To eliminate the stress of finding academic resources and create a single source of truth 
                for every student at the School of Computer Science & IT."
              </p>
              <p className="text-gray-400">
                We believe in democratizing access to knowledge and fostering a collaborative learning environment 
                where students can thrive academically. Our platform is designed to be intuitive, comprehensive, 
                and constantly evolving to meet the changing needs of modern education.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Get Started Today">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to transform your academic experience?</h3>
              <p className="text-gray-300 mb-6">
                Join thousands of SCSIT students who are already using our platform to excel in their studies.
              </p>
              <button 
                onClick={() => navigate('/scsit/courses')} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
              >
                Explore Resources <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

export default AboutPage;