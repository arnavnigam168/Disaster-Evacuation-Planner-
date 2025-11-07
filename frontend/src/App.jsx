import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, Sun, Search, Clock, MapPin, CloudRain, ThermometerSun } from 'lucide-react';
import MapComponent from './components/MapComponent';
import TurnByTurn from './components/TurnByTurn';
import AlternativesList from './components/AlternativesList';
import axios from 'axios';
import DisasterSelector from './components/DisasterSelector';
import SafetyDashboard from './components/SafetyDashboard';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [polygonCoords, setPolygonCoords] = useState([]); // Track poly for avoidance
  const [disasterType, setDisasterType] = useState('general'); // flood|fire|ocean|industrial|general
  const [showSteps, setShowSteps] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
const [stops, setStops] = useState([]);
const [altIndex, setAltIndex] = useState(null);
const [alternatives, setAlternatives] = useState([]);
const [showWeather, setShowWeather] = useState(false);


  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const geocodeLocation = async (location) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/geocode`, { params: { q: location } });
      if (response.data?.status === 'success') {
        return { lat: response.data.lat, lng: response.data.lng };
      }
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

  const handlePolygonDrawn = (coords) => {
    setPolygonCoords(coords);
    const polyGeoJSON = {
      type: "Polygon",
      coordinates: [coords.map(([lat, lon]) => [lon, lat])] // [lon, lat] for backend
    };
    setRouteData(prev => ({
      ...prev,
      avoidancePolygon: polyGeoJSON,
      stats: { distance: 'Loading...', time: 'Loading...', safety: 'Loading...' }
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!startLocation || !endLocation) return setError('Please enter both start and end locations.');

    setLoading(true);
    setError('');
    setRouteData(null);
    setWeather(null);
    setPolygonCoords([]);

    const startCoords = await geocodeLocation(startLocation);
    const endCoords = await geocodeLocation(endLocation);

    if (!startCoords || !endCoords) {
      setError('Could not find one or both locations. Please try again.');
      setLoading(false);
      return;
    }

    const midLat = (startCoords.lat + endCoords.lat) / 2;
    const midLng = (startCoords.lng + endCoords.lng) / 2;
    const weatherData = await fetchWeather({ lat: midLat, lng: midLng });

    setRouteData({ 
      startLocation, 
      endLocation, 
      startCoords, 
      endCoords, 
      stats: { distance: 0, time: 0, safety: 0 }
    });
    setWeather(weatherData);
    setLoading(false);
  };

  useEffect(() => {
    const fetchRoute = async () => {
      if (!routeData?.startCoords || !routeData?.endCoords) return;

      setLoading(true);
      try {
        const payload = {
          startLocation: routeData.startLocation,
          endLocation: routeData.endLocation,
          startCoords: [routeData.startCoords.lng, routeData.startCoords.lat],
          endCoords: [routeData.endCoords.lng, routeData.endCoords.lat],
          avoidancePolygon: routeData.avoidancePolygon,
          altIndex,
          viaPoints: (stops||[]).filter(s => s.coords).map(s => [s.coords.lng, s.coords.lat])
        };
        console.log('Fetch Route Payload:', payload);
        const response = await axios.post('http://localhost:8080/api/route', payload);
        if (response.data.status === 'success') {
          const { distance, time, safety, routeGeoJSON, instructions, rri, rriFactors, alternatives: altSums, altGeometries, pickedAlternativeIndex } = response.data;
          const distanceKm = parseFloat(distance.replace(' km', '')) || 0;
          const timeMin = parseInt(time.replace(' min', '')) || 0;
          const safetyPerc = parseFloat(safety) || 0;
          setRouteData(prev => ({
            ...prev,
            stats: { distance: distanceKm, time: timeMin / 60, safety: safetyPerc },
            routeGeoJSON,
            instructions: Array.isArray(instructions) ? instructions : [],
            rri,
            rriFactors,
            altGeometries: Array.isArray(altGeometries) ? altGeometries : [],
            hoverAltIndex: null,
            hoverPoint: null,
          }));
          const currentIdx = typeof pickedAlternativeIndex === 'number' ? pickedAlternativeIndex : 0;
          setAlternatives(Array.isArray(altSums) ? altSums.filter(a => a.index !== currentIdx) : []);
          if (typeof pickedAlternativeIndex === 'number') setAltIndex(pickedAlternativeIndex);
          console.log('Fetch Route Success:', response.data);
        }
      } catch (error) {
        console.error('Route fetch error:', error.response?.status, error.response?.data?.message || error.message);
        setError('Failed to fetch route. Check backend logs.');
        setRouteData(prev => ({
          ...prev,
          stats: { distance: 0, time: 0, safety: 0 }
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [routeData?.startCoords, routeData?.endCoords, routeData?.avoidancePolygon, altIndex]);

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
              placeholder="Start Location (e.g., Bhopal)"
              className="input-field mb-2 text-hsl(var(--foreground))"
              aria-label="Start location"
            />
            <input
              type="text"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="End Location (e.g., Jabalpur)"
              className="input-field mb-2 text-hsl(var(--foreground))"
              aria-label="End location"
            />
            <div className="mb-2">
              <div className="text-xs text-gray-400 mb-1">Via Stops</div>
              {stops.map((s, i) => (
                <div key={i} className="flex gap-2 mb-1">
                  <input
                    type="text"
                    value={s.label || ''}
                    onChange={(e) => { const arr = [...stops]; arr[i] = { ...arr[i], label: e.target.value }; setStops(arr); }}
                    placeholder={`Stop ${i+1}`}
                    className="input-field text-hsl(var(--foreground)) flex-1"
                  />
                  <button type="button" className="btn-primary" onClick={async () => {
                    if (!stops[i]?.label) return;
                    const c = await geocodeLocation(stops[i].label);
                    const arr = [...stops]; arr[i] = { ...arr[i], coords: c }; setStops(arr);
                  }}>Geocode</button>
                  <button type="button" className="btn-primary" onClick={() => setStops(stops.filter((_, idx) => idx !== i))}>Del</button>
                </div>
              ))}
              <button type="button" className="btn-primary" onClick={() => setStops([...(stops||[]), { label: '', coords: null }])}>Add Stop</button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm text-gray-400">Disaster Type</label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                className="input-field text-hsl(var(--foreground))"
              >
                <option value="general">General</option>
                <option value="flood">Flood / Ocean</option>
                <option value="fire">Fire</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
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
                  <div className="font-bold text-lg text-hsl(var(--foreground))">
                    {typeof routeData.stats.distance === 'number' ? routeData.stats.distance.toFixed(1) : '0'} km
                  </div>
                  <div className="text-gray-400 text-sm">Distance</div>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <div className="font-bold text-lg text-hsl(var(--foreground))">
                    {typeof routeData.stats.time === 'number' ? routeData.stats.time.toFixed(2) : '0'} h
                  </div>
                  <div className="text-gray-400 text-sm">Time</div>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <div className="font-bold text-lg text-hsl(var(--foreground))">
                    {typeof routeData.stats.safety === 'number' ? routeData.stats.safety.toFixed(1) : '0'}%
                  </div>
                  <div className="text-gray-400 text-sm">Safety</div>
                </div>
              </div>
            </motion.div>
          )}
          {routeData?.rriFactors && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel mt-4">
              <div className="panel-title">
                <span className="text-hsl(var(--foreground))">Safety Breakdown</span>
              </div>
              <SafetyDashboard rri={routeData?.rri} factors={routeData?.rriFactors} />
            </motion.div>
          )}
          {/* Removed sidebar Turn-by-Turn (now floating on map) */}

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
      <MapComponent routeData={routeData} onPolygonDrawn={handlePolygonDrawn} disasterType={disasterType} showWeather={showWeather} showTraffic={showTraffic} />

      {/* Alternatives List Floating Card */}
      {showAlternatives && (
        <div className="fixed top-20 right-4 z-[1000] w-72 p-3 rounded-lg shadow-xl"
          style={{ background: theme === 'dark' ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)', border: '1px solid rgba(100,116,139,0.3)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-hsl(var(--foreground))">Alternatives</div>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1 text-gray-400">
                <input type="checkbox" checked={showWeather} onChange={(e) => setShowWeather(e.target.checked)} /> Weather
              </label>
              <label className="flex items-center gap-1 text-gray-400">
                <input type="checkbox" checked={showTraffic} onChange={(e) => setShowTraffic(e.target.checked)} /> Traffic
              </label>
              <button className="text-gray-400" onClick={() => setShowAlternatives(false)}>Close</button>
            </div>
          </div>
          {alternatives.length > 0 ? (
            <AlternativesList items={alternatives} selectedIndex={altIndex ?? 0} onSelect={(idx) => { setAltIndex(idx); }} onHover={(idx)=> setRouteData(prev=> ({...prev, hoverAltIndex: idx}))} />
          ) : (
            <div className="text-xs text-gray-400">No alternative routes available for this query.</div>
          )}
        </div>
      )}

      {/* Small open buttons */}
      {!showAlternatives && alternatives.length > 0 && (
        <button className="fixed top-20 right-4 z-[1000] btn-primary px-3 py-1" onClick={()=> setShowAlternatives(true)}>Alts</button>
      )}
      {!showAlternatives && alternatives.length === 0 && (
        <button className="fixed top-20 right-4 z-[1000] btn-primary px-3 py-1" onClick={()=> setShowAlternatives(true)}>Layers</button>
      )}
      {!showSteps && routeData?.instructions?.length > 0 && (
        <button className="fixed bottom-16 right-4 z-[1000] btn-primary px-3 py-1" onClick={()=> setShowSteps(true)}>Steps</button>
      )}

      {/* Floating Turn-by-Turn Panel (always visible when instructions are present) */}
      {showSteps && routeData?.instructions?.length > 0 && (
        <div
          className="fixed bottom-16 right-4 z-[1000] w-80 max-h-[50vh] overflow-y-auto p-3 rounded-lg shadow-xl"
          style={{
            background: theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(100,116,139,0.3)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-hsl(var(--foreground))">Turn-by-Turn</div>
            <button className="text-xs text-gray-400 hover:text-gray-200" onClick={()=> setShowSteps(false)}>Close</button>
          </div>
          <TurnByTurn steps={routeData.instructions} onStepHover={(pt) => setRouteData(prev => ({ ...prev, hoverPoint: pt }))} />
        </div>
      )}
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