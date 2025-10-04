import React from "react";

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '';
  const mins = Math.round(Number(seconds) / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${h} h ${rem} min` : `${h} h`;
}

function RouteStats({ stats }) {
  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Route Statistics</h3>
      <p>Distance: {stats.distance}</p>
      <p>Duration: {stats.durationSeconds ? formatDuration(stats.durationSeconds) : stats.duration}</p>
    </div>
  );
}

export default RouteStats;
