import React from 'react';

export default function SafetyDashboard({ rri = 0, factors = {} }) {
  const entries = [
    { key: 'roadRisk', label: 'Road Risk', color: '#f59e0b' },
    { key: 'elevationRisk', label: 'Elevation Risk', color: '#10b981' },
    { key: 'avoidanceFactor', label: 'Avoidance Factor', color: '#ef4444' },
    { key: 'dynamicRisk', label: 'Dynamic Risk', color: '#6366f1' }
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-300">
        Route Risk Index:{' '}
        <span className="font-semibold">{(rri || 0).toFixed(2)}</span>
      </div>

      {entries.map(({ key, label, color }) => {
        const v = Math.max(0, Math.min(1, Number(factors[key] || 0)));
        return (
          <div key={key}>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{label}</span>
              <span>{(v * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded">
              <div
                className="h-2 rounded"
                style={{ width: `${v * 100}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
