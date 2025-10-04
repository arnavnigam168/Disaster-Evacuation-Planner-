import React, { useState, useCallback } from 'react';
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
import { MapContainer, TileLayer, Marker, Popup, Polyline, FeatureGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import RoutePlanner from './components/RoutePlanner';
import MapComponent from './components/MapComponent';
import L from 'leaflet';
import './sidebar.css';
// Prefer using public assets copied from node_modules for reliable serving
const publicBase = '/leaflet-images';
const icon = `${publicBase}/marker-icon.png`;
const icon2x = `${publicBase}/marker-icon-2x.png`;
const iconShadow = `${publicBase}/marker-shadow.png`;
import DrawControl from './components/DrawControl';
import { useRef } from 'react';

// Ensure Leaflet default marker images and anchors are set correctly when using Vite
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: icon2x,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Components
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-slate-200 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-slate-400" />
          <span className="font-semibold text-sm">{title}</span>
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
            <div className="p-4 space-y-4 bg-slate-900/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Toggle = ({ label, icon: Icon, color = "blue", checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <div className="flex items-center gap-3">
      <Icon size={16} className={`text-${color}-400`} />
      <span className="text-slate-300 group-hover:text-slate-100">{label}</span>
    </div>
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
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
  const [routeError, setRouteError] = useState(null);
  const [drawnItems, setDrawnItems] = useState(new L.FeatureGroup());
  const featureGroupRef = useRef(null);

  // Memoize the route summary handler so its reference doesn't change each render.
  const onRouteSummary = useCallback((summary) => {
    setRouteStats(summary);
    setShowRouteSummary(true);
  }, []);

  // Format seconds into "H h M min" or "M min"
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '';
    const s = Number(seconds);
    const mins = Math.round(s / 60);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem ? `${h} h ${rem} min` : `${h} h`;
  };

  const handleRouteFind = useCallback(async (startLocation, endLocation) => {
    setRouteError(null);
    setShowRouteSummary(false);
    try {
      const startResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(startLocation)}&format=json&limit=1`);
      const startData = await startResponse.json();

      const endResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endLocation)}&format=json&limit=1`);
      const endData = await endResponse.json();

      if (!startData.length || !endData.length) {
        setRouteError("Could not find one or both locations. Please be more specific.");
        setStart("");
        setEnd("");
        return;
      }

      const startCoords = { lat: parseFloat(startData[0].lat), lng: parseFloat(startData[0].lon) };
      const endCoords = { lat: parseFloat(endData[0].lat), lng: parseFloat(endData[0].lon) };

      setStart(startCoords);
      setEnd(endCoords);
    } catch (error) {
      console.error("Error geocoding:", error);
      setRouteError("An error occurred while planning the route.");
      setStart("");
      setEnd("");
    }
  }, []);

  const onCreated = (e) => {
    const { layerType, layer } = e;
    const newDrawnItems = new L.FeatureGroup();
    drawnItems.eachLayer(l => newDrawnItems.addLayer(l));
    newDrawnItems.addLayer(layer);
    setDrawnItems(newDrawnItems);
  };

  const onEdited = (e) => {
    const { layers } = e;
    const newDrawnItems = new L.FeatureGroup();
    layers.eachLayer(layer => newDrawnItems.addLayer(layer));
    setDrawnItems(newDrawnItems);
  };

  const onDeleted = (e) => {
    const { layers } = e;
    const newDrawnItems = new L.FeatureGroup();
    drawnItems.eachLayer(l => {
        let found = false;
        layers.eachLayer(deletedLayer => {
            if (l._leaflet_id === deletedLayer._leaflet_id) {
                found = true;
            }
        });
        if (!found) {
            newDrawnItems.addLayer(l);
        }
    });
    setDrawnItems(newDrawnItems);
  };

  const disasterTypes = [
    { value: "flood", label: "Flood" },
    { value: "wildfire", label: "Wildfire" },
    { value: "earthquake", label: "Earthquake" }
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-800 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={clsx(
          "sidebar sidebar-modern glass-effect fixed top-0 left-0 h-full w-72 overflow-y-auto p-4 text-white shadow-lg z-50",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <h2 className="text-xl font-bold mb-0">Evacuation Planner</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-slate-700"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {/* Sections */}
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

          <CollapsibleSection title="Route Planner" icon={Navigation} defaultOpen={true}>
            <RoutePlanner onRouteFind={handleRouteFind} />
            {routeError && (
              <div className="p-3 mt-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                {routeError}
              </div>
            )}
          </CollapsibleSection>

          {/* Route Statistics card (polished) */}
          {routeStats && (
            <div className="section-card">
              <div className="section-title">Route Statistics</div>
              <div className="section-body">
                <div className="route-stats">
                  <div className="stat-item">
                    <div className="stat-label">Distance</div>
                    <div className="stat-value">{routeStats.distance}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Estimated Time</div>
                    <div className="stat-value">{routeStats.durationSeconds ? formatDuration(routeStats.durationSeconds) : (routeStats.time || routeStats.duration)}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Safety</div>
                    <div className="stat-value">85</div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 relative h-full">
        <MapComponent start={start} end={end} onRouteFound={onRouteSummary} drawnItems={drawnItems}>
            <FeatureGroup ref={featureGroupRef}>
              {/* DrawControl uses leaflet-draw directly to avoid react-leaflet-draw hook issues */}
            </FeatureGroup>
            <DrawControl
              featureGroupRef={featureGroupRef}
              onCreated={onCreated}
              onEdited={onEdited}
              onDeleted={onDeleted}
              drawOptions={{
                rectangle: true,
                polygon: true,
                circle: true,
                circlemarker: false,
                marker: false,
                polyline: false,
              }}
            />
        </MapComponent>
      </main>

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
                <div className="text-lg font-semibold">{routeStats.durationSeconds ? formatDuration(routeStats.durationSeconds) : (routeStats.duration + ' min')}</div>
              </div>
            </div>
          </div>
        </FloatingCard>
      )}
    </div>
  );
}

export default App;