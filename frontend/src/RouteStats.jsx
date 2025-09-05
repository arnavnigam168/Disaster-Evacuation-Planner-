import React from "react";

function RouteStats({ stats }) {
  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Route Statistics</h3>
      <p>Distance: {stats.distance}</p>
      <p>Duration: {stats.duration}</p>
    </div>
  );
}

export default RouteStats;
