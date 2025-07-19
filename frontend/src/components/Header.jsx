"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, User, LogOut, Menu, X, Home, Upload, GraduationCap } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)


  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : ""


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  // Navigation items
  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/scsit/courses", label: "Courses", icon: GraduationCap },
    { href: "/upload", label: "Upload", icon: Upload },
  ]

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-gray-900 bg-opacity-20 backdrop-filter backdrop-blur-2xl border-b border-gray-700/30 fixed top-0 z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <BookOpen className="w-8 h-8 text-green-400" />
          </div>

          {/* Hamburger Menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2 text-gray-200 hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 bg-slate-800 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-green-400" />
                <span className="text-lg font-bold text-white">Menu</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeSidebar}
                className="p-2 text-gray-300 hover:text-white focus:outline-none"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Navigation Items */}
            <div className="py-6">
              <nav className="space-y-2 px-4">
                {navigationItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={closeSidebar}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200 group"
                  >
                    <item.icon className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                    <span className="font-medium">{item.label}</span>
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* User Section */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700 bg-slate-900">
              {user ? (
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {initials || <User className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.name || "User"}</p>
                      <p className="text-gray-400 text-sm truncate">{user.email || "No email provided"}</p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      logout()
                      closeSidebar()
                      navigate("/")
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate("/login")
                    closeSidebar()
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                >
                  Login
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
