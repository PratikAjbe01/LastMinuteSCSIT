import React, { useContext } from 'react';
import { Heart } from 'lucide-react';
import { ValuesContext } from '../context/ValuesContext';

const Footer = () => {
  const { user } = useContext(ValuesContext);
  return (
    <footer className="w-full bg-gradient-to-t from-gray-950 to-gray-900 text-gray-400 border-t border-teal-500/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Brand and mission */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white tracking-wide">LastMinute SCSIT</h3>
            <p className="text-sm">
              Your one-stop resource for notes, tools, and everything you need to excel at SCSIT.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-200 mb-4 tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/" className="hover:text-teal-400 hover:pl-1 transition-all duration-300">Home</a></li>
              <li><a href="/scsit/courses" className="hover:text-teal-400 hover:pl-1 transition-all duration-300">Courses</a></li>
              <li><a href="/allfiles" className="hover:text-teal-400 hover:pl-1 transition-all duration-300">All Files</a></li>
              <li><a href="/about" className="hover:text-teal-400 hover:pl-1 transition-all duration-300">About Us</a></li>
            </ul>
          </div>

          {/* Column 3: Tools */}
          <div>
            <h4 className="font-semibold text-gray-200 mb-4 tracking-wider">Tools</h4>
            <ul className="space-y-3">
              <li><a href="/calculations/tools/cgpa" className="hover:text-teal-400 hover:pl-1 transition-all duration-300">CGPA Calculator</a></li>
              <li><a href="/calculations/tools/sgpa" className="hover:text-teal-400 hover:pl-1 transition-all duration-300">SGPA Calculator</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© {new Date().getFullYear()} LastMinute SCSIT. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
