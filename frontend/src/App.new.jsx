import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import {
  AlertCircle,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Building,
  Ban,
  Cloud,
  Navigation
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import RoutePlanner from './components/RoutePlanner';
import 'leaflet/dist/leaflet.css';

// Components
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-slate-200 hover:bg-slate-700/50"
      >
        <div className="flex items-center gap-2">
          <Icon size={20} />
          <span className="font-medium">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Toggle = ({ label, icon: Icon, color = "blue", checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
    </div>
    <div className="flex items-center gap-2">
      <Icon size={16} className={`text-${color}-500`} />
      <span className="text-slate-300 group-hover:text-slate-100">{label}</span>
    </div>
  </label>
);

const FloatingCard = ({ children, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={clsx(
        "absolute top-24 right-4 w-[90vw] sm:w-96 max-w-[calc(100vw-2rem)]",
        "bg-slate-800/95 backdrop-blur-lg rounded-lg shadow-xl",
        "border border-slate-700",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
    >
      <div className="p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </motion.div>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [disasterType, setDisasterType] = useState("flood");
  const [evacuationStatus, setEvacuationStatus] = useState("safe");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [routeStats, setRouteStats] = useState(null);
  const [showRouteSummary, setShowRouteSummary] = useState(false);
  const [layers, setLayers] = useState({
    shelters: true,
    roadClosures: true,
    floodZones: true
  });

  const handleRouteFind = useCallback((startLocation, endLocation) => {
    setStart(startLocation);
    setEnd(endLocation);
    // Simulate route calculation
    setRouteStats({
      coordinates: [
        startLocation.split(',').map(Number),
        [18.5304, 73.8567],
        [18.5404, 73.8667],
        endLocation.split(',').map(Number)
      ],
      distance: '12.5',
      duration: '25'
    });
    setShowRouteSummary(true);
  }, []);

  const disasterTypes = [
    { value: "flood", label: "Flood" },
    { value: "wildfire", label: "Wildfire" },
    { value: "earthquake", label: "Earthquake" }
  ];

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-100">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-20 px-2 sm:px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold">Disaster Evacuation Planner</h1>
        </div>
      </div>

      {/* Mission Control Panel (Sidebar) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-10"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="absolute top-16 left-0 w-[85vw] sm:w-[320px] h-[calc(100vh-4rem)] bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 z-20 overflow-y-auto shadow-xl"
            >
              {/* Evacuation Status Section */}
              <CollapsibleSection title="Evacuation Status" icon={AlertTriangle} defaultOpen={true}>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 mb-4"
                >
                  {disasterTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <div className={clsx(
                  "px-4 py-2 rounded-full font-semibold text-white text-center",
                  evacuationStatus === "safe" && "bg-emerald-500",
                  evacuationStatus === "warning" && "bg-amber-500",
                  evacuationStatus === "danger" && "bg-red-500"
                )}>
                  {evacuationStatus === "safe" && "Area is Safe"}
                  {evacuationStatus === "warning" && "Evacuation Recommended"}
                  {evacuationStatus === "danger" && "Evacuate Immediately"}
                </div>
              </CollapsibleSection>

              {/* Route Planner Section */}
              <CollapsibleSection title="Route Planner" icon={Navigation} defaultOpen={true}>
                <RoutePlanner onRouteFind={handleRouteFind} />
              </CollapsibleSection>

              {/* Hazard Layers Section */}
              <CollapsibleSection title="Hazard Layers & Legend" icon={AlertCircle}>
                <div className="space-y-4">
                  <Toggle
                    label="Emergency Shelters"
                    icon={Building}
                    color="emerald"
                    checked={layers.shelters}
                    onChange={() => setLayers({ ...layers, shelters: !layers.shelters })}
                  />
                  <Toggle
                    label="Road Closures"
                    icon={Ban}
                    color="red"
                    checked={layers.roadClosures}
                    onChange={() => setLayers({ ...layers, roadClosures: !layers.roadClosures })}
                  />
                  <Toggle
                    label="Flood Zones"
                    icon={Cloud}
                    color="blue"
                    checked={layers.floodZones}
                    onChange={() => setLayers({ ...layers, floodZones: !layers.floodZones })}
                  />
                </div>
              </CollapsibleSection>

              {/* Live Alerts Section */}
              <CollapsibleSection title="Live Alerts" icon={AlertCircle}>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                      <div>
                        <p className="text-red-200 font-medium">Flash Flood Warning</p>
                        <p className="text-slate-300 text-sm">Immediate evacuation recommended for low-lying areas.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Map View */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[18.5204, 73.8567]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {routeStats?.coordinates && (
            <Polyline
              positions={routeStats.coordinates.filter(coord => coord && coord.length === 2)}
              pathOptions={{
                color: '#22c55e',
                weight: 6,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          )}

          {start && start.includes(',') && (
            <Marker position={start.split(',').map(Number)} />
          )}
          {end && end.includes(',') && (
            <Marker position={end.split(',').map(Number)} />
          )}
        </MapContainer>
      </div>

      {/* Floating Route Summary */}
      {showRouteSummary && routeStats && (
        <FloatingCard onClose={() => setShowRouteSummary(false)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Route Summary</h3>
              <div className="text-sm text-slate-400">Updated: Just now</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Distance</div>
                <div className="text-lg font-semibold">{routeStats.distance} km</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Duration</div>
                <div className="text-lg font-semibold">{routeStats.duration} min</div>
              </div>
            </div>
          </div>
        </FloatingCard>
      )}
    </main>
  );
}

export default App;