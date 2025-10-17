import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, Sun, Search, Clock, MapPin, CloudRain, ThermometerSun } from 'lucide-react';
import MapComponent from './components/MapComponent';
import axios from 'axios';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [weather, setWeather] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const geocodeLocation = async (location) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: location, format: 'json', limit: 1, addressdetails: 1 },
      });
      const data = response.data[0];
      if (data) return { lat: parseFloat(data.lat), lng: parseFloat(data.lon) };
      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  const fetchWeather = async (coords) => {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&timezone=auto`);
      return await response.json();
    } catch (err) {
      console.error('Weather error:', err);
      return null;
    }
  };

  const fetchRoute = async (startCoords, endCoords) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: (route.distance / 1000).toFixed(2), // km
          time: Math.round(route.duration / 3600), // hours
          safety: 85, // Placeholder safety (can be dynamic with traffic data later)
        };
      }
      throw new Error('No route found');
    } catch (err) {
      console.error('OSRM error:', err);
      return null;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!startLocation || !endLocation) return setError('Please enter both start and end locations.');

    setLoading(true);
    setError('');
    setRouteData(null);
    setWeather(null);

    const startCoords = await geocodeLocation(startLocation);
    const endCoords = await geocodeLocation(endLocation);

    if (!startCoords || !endCoords) {
      setError('Could not find one or both locations. Please try again.');
      setLoading(false);
      return;
    }

    const routeStats = await fetchRoute(startCoords, endCoords);
    if (!routeStats) {
      setError('Could not calculate route. Please try different locations.');
      setLoading(false);
      return;
    }

    const midLat = (startCoords.lat + endCoords.lat) / 2;
    const midLng = (startCoords.lng + endCoords.lng) / 2;
    const weatherData = await fetchWeather({ lat: midLat, lng: midLng });

    setRouteData({ startCoords, endCoords, stats: routeStats });
    setWeather(weatherData);
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-screen" data-theme={theme}>
      {isSidebarOpen && (
        <motion.div
          className={`sidebar ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} overflow-y-auto`}
          initial={{ x: -380 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="sidebar-header">
            <h1 className="sidebar-title text-hsl(var(--foreground))">Evacuation Planner</h1>
            <button onClick={toggleSidebar} className="close-btn" aria-label="Close sidebar">
              <X size={20} className="text-hsl(var(--foreground))" />
            </button>
          </div>
          <form onSubmit={handleSearch} className="panel">
            <div className="panel-title">
              <MapPin size={18} className="text-primary" />
              <span className="text-hsl(var(--foreground))">Route Planner</span>
            </div>
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="Start Location (e.g., Chennai)"
              className="input-field mb-2 text-hsl(var(--foreground))"
              aria-label="Start location"
            />
            <input
              type="text"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="End Location (e.g., Pune)"
              className="input-field mb-2 text-hsl(var(--foreground))"
              aria-label="End location"
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-hsl(var(--primary-foreground)) border-t-transparent rounded-full"
                />
              ) : (
                <Search size={18} className="text-hsl(var(--primary-foreground))" />
              )}
              {loading ? 'Searching Route...' : 'Search Route'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>
          {routeData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="panel mt-4"
            >
              <div className="panel-title">
                <Clock size={18} className="text-primary" />
                <span className="text-hsl(var(--foreground))">Route Statistics</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <div className="font-bold text-lg text-hsl(var(--foreground))">{routeData.stats.distance} km</div>
                  <div className="text-gray-400 text-sm">Distance</div>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <div className="font-bold text-lg text-hsl(var(--foreground))">{routeData.stats.time} h</div>
                  <div className="text-gray-400 text-sm">Time</div>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <div className="font-bold text-lg text-hsl(var(--foreground))">{routeData.stats.safety}%</div>
                  <div className="text-gray-400 text-sm">Safety</div>
                </div>
              </div>
            </motion.div>
          )}
          {weather && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="panel mt-4"
            >
              <div className="panel-title">
                <ThermometerSun size={18} className="text-primary" />
                <span className="text-hsl(var(--foreground))">Weather Alert</span>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-hsl(var(--foreground))">{weather.current.temperature_2m}°C</div>
                <div className="text-gray-400 text-sm">Current Temperature</div>
                {weather.current.weather_code === 3 && <p className="text-red-400 text-sm mt-2">Rainy conditions - Drive carefully!</p>}
              </div>
            </motion.div>
          )}
          <button onClick={toggleTheme} className="mt-auto btn-primary">
            {theme === 'dark' ? <Sun size={20} className="text-hsl(var(--primary-foreground))" /> : <Moon size={20} className="text-hsl(var(--primary-foreground))" />}
            <span className="text-hsl(var(--primary-foreground))">Toggle Theme</span>
          </button>
        </motion.div>
      )}
      <MapComponent routeData={routeData} />
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 btn-primary p-2"
        aria-label="Toggle sidebar"
        style={{ display: isSidebarOpen ? 'none' : 'block' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

export default App;