import React from 'react'
import { Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="w-full bg-gray-800 bg-opacity-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-gray-300 text-sm">
        <div className="flex items-center space-x-2">
          <p>© {new Date().getFullYear()} LastMinute SCSIT. All rights reserved.</p>
          <Heart className="w-4 h-4 text-red-400" />
          <p>Built with love</p>
        </div>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <a href="/" className="hover:text-green-400 transition-colors">Home</a>
          <a href="/scsit/courses" className="hover:text-green-400 transition-colors">Courses</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer