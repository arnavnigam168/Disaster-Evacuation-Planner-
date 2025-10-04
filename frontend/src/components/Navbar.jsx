import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, Moon, Sun } from 'lucide-react';


const navItems = [
  { name: 'Dashboard', href: '#' },
  { name: 'Live Map', href: '#' },
  { name: 'Alerts', href: '#' },
  { name: 'Reports', href: '#' },
];

const Navbar = ({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) => {
  const [hoveredLink, setHoveredLink] = useState('');

  
  const navContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  
  const navItemVariants = {
    hidden: { y: -20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } },
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700/80"
    >
      <motion.div
        variants={navContainerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo and Burger Menu */}
          <div className="flex items-center gap-4">
            <motion.button
              variants={navItemVariants}
              className="lg:hidden rounded-full p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
            <motion.a href="#" variants={navItemVariants} className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300 bg-clip-text text-transparent tracking-tighter">
                EvacPlan
              </span>
            </motion.a>
          </div>

          {/* Center Section: Navigation Links (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                variants={navItemVariants}
                onHoverStart={() => setHoveredLink(item.name)}
                onHoverEnd={() => setHoveredLink('')}
                className="relative px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {item.name}
                {hoveredLink === item.name && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400"
                    layoutId="underline" // This is the magic for the sliding effect
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.a>
            ))}
          </div>

          {/* Right Section: Dark Mode Toggle */}
          <motion.div variants={navItemVariants}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:ring-2 ring-indigo-500/50 transition-all"
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={darkMode ? 'sun' : 'moon'}
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-indigo-600" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;