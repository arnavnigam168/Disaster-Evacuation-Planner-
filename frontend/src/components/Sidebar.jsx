import React, { useState } from "react";
import { MapPin, Navigation, Search, Route, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// This is a simplified LocationInput component. 
// You can keep yours if you have it in a separate file.
const LocationInput = ({ label, value, setValue, icon }) => (
  <div className="relative w-full">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      {icon}
    </div>
    <input
      type="text"
      placeholder={label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
    />
  </div>
);

function Sidebar({ setRoute }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoordinates = async (place) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  };

  const handleSearch = async () => {
    if (!start || !end) {
      alert("Please enter both a start and end location.");
      return;
    }
    setIsLoading(true);
    setStats(null);

    const startCoords = await fetchCoordinates(start);
    const endCoords = await fetchCoordinates(end);

    if (startCoords && endCoords) {
      // Pass the coordinates and a function to update stats back to App.jsx
      setRoute({ 
        start: startCoords, 
        end: endCoords,
        setStats: setStats // Give the MapView a way to set stats here
      });
    } else {
      alert("One or more locations could not be found. Please try again.");
      setRoute(null);
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ x: -350 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl flex flex-col gap-5 border border-gray-200/50 dark:border-gray-700/50"
    >
      {/* Header */}
      <div className="text-left">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Plan Your Evacuation</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Enter start and end points.</p>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <LocationInput label="Start Location" value={start} setValue={setStart} icon={<MapPin size={18} />} />
        <LocationInput label="End Location" value={end} setValue={setEnd} icon={<Navigation size={18} />} />
      </div>

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSearch}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Searching...
          </>
        ) : (
          <>
            <Search size={18} />
            Search Route
          </>
        )}
      </motion.button>

      {/* Stats */}
      <AnimatePresence>
        {stats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center gap-3 text-sm">
              <Route className="text-indigo-500" size={18} />
              <span className="font-medium text-gray-700 dark:text-gray-300">Distance:</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.distance} km</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="text-indigo-500" size={18} />
              <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.durationSeconds ? (Math.floor(stats.durationSeconds/3600) > 0 ? `${Math.floor(stats.durationSeconds/3600)} h ${Math.round((stats.durationSeconds%3600)/60)} min` : `${Math.round(stats.durationSeconds/60)} min`) : stats.duration}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Sidebar;