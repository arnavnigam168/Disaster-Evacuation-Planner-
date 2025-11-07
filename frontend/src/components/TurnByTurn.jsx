import React from 'react';

const metersToKm = (m) => (m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${Math.round(m)} m`);
const msToMin = (ms) => `${Math.round(ms/60000)} min`;

export default function TurnByTurn({ steps = [], onStepHover }) {
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {steps.map((s, idx) => (
        <div key={idx} className="flex items-start justify-between bg-primary/10 p-2 rounded" onMouseEnter={() => onStepHover && s.point && onStepHover(s.point)}>
          <div className="text-sm text-hsl(var(--foreground))">
            <div className="font-semibold">{s.text || 'Continue'}</div>
            {s.street_name && <div className="text-xs text-gray-400">{s.street_name}</div>}
          </div>
          <div className="text-right text-xs text-gray-300">
            <div>{metersToKm(s.distance || 0)}</div>
            <div>{msToMin(s.time || 0)}</div>
          </div>
        </div>
      ))}
      {steps.length === 0 && <div className="text-sm text-gray-400">No instructions available.</div>}
    </div>
  );
}


