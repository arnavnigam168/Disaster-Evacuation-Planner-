import React, { useState } from "react";
import LocationInput from "./LocationInput.jsx";
import RouteStats from "./RouteStats.jsx";

function Sidebar({ setRoute }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [stats, setStats] = useState(null);

  const handleSearch = async () => {
    if (!start || !end) return alert("Enter both start and end!");

    // Dummy API simulation
    const fakeRoute = {
      start: { name: start, lat: 18.5204, lng: 73.8567 },
      end: { name: end, lat: 13.0827, lng: 80.2707 },
      coordinates: [
        [18.5204, 73.8567],
        [15.0, 78.0],
        [13.0827, 80.2707],
      ],
      distance: "1200 km",
      duration: "18 hours",
    };

    setRoute(fakeRoute);
    setStats({ distance: fakeRoute.distance, duration: fakeRoute.duration });
  };

  return (
    <div className="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 shadow-lg flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">Disaster Evacuation Planner</h2>
      <LocationInput label="Start Location" value={start} setValue={setStart} />
      <LocationInput label="End Location" value={end} setValue={setEnd} />

      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
      >
        Search & Route
      </button>

      {stats && <RouteStats stats={stats} />}
    </div>
  );
}

export default Sidebar;
