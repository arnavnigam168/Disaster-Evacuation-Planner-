import { motion } from 'framer-motion';
import { Shield, Menu, Moon, Sun } from 'lucide-react';

const Navbar = ({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) => (
  <motion.nav
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow"
  >
    <div className="px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden rounded hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5 text-gray-900 dark:text-gray-100" />
        </button>
        <motion.div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Disaster Evacuation Planner
          </span>
        </motion.div>
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          Emergency Route Planning System
        </span>
      </div>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-2"
      >
        <motion.div animate={{ rotate: darkMode ? 180 : 0 }}>
          {darkMode ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-blue-600" />}
        </motion.div>
      </button>
    </div>
  </motion.nav>
);

export default Navbar;
