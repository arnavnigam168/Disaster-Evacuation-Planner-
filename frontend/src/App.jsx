import { useState } from "react";
import MapView from "./MapView";

export default function App() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [coords, setCoords] = useState({ start: null, end: null });
  const [routeStats, setRouteStats] = useState({ distance: null, duration: null });

  // Function to get lat/lng from city name
  const fetchCoordinates = async (place) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  };

  const handleRoute = async () => {
    const start = await fetchCoordinates(startLocation);
    const end = await fetchCoordinates(endLocation);

    if (start && end) {
      setCoords({ start, end });
    } else {
      alert("Invalid location(s). Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Disaster Evacuation Planner</h1>

        <label className="block text-sm font-medium">Start Location</label>
        <input
          type="text"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          placeholder="Enter start city"
        />

        <label className="block text-sm font-medium">End Location</label>
        <input
          type="text"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          placeholder="Enter destination city"
        />

        <button
          onClick={handleRoute}
          className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700"
        >
          Search & Route
        </button>

        {routeStats.distance && (
          <div className="mt-6">
            <h2 className="font-semibold">Route Statistics</h2>
            <p>Distance: {routeStats.distance} km</p>
            <p>Duration: {routeStats.duration} hrs</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapView
          start={coords.start}
          end={coords.end}
          setRouteStats={setRouteStats}
        />
      </div>
    </div>
  );
}
