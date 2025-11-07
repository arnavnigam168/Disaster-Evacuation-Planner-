import React from 'react';

export default function AlternativesList({ items = [], selectedIndex = 0, onSelect, onHover }) {
  return (
    <div className="space-y-2">
      {items.map((alt) => (
        <button
          key={alt.index}
          onClick={() => onSelect?.(alt.index)}
          onMouseEnter={() => onHover?.(alt.index)}
          onMouseLeave={() => onHover?.(null)}
          className={`w-full text-left p-2 rounded border ${selectedIndex === alt.index ? 'border-primary bg-primary/10' : 'border-slate-700 bg-transparent hover:bg-slate-800/50'}`}
        >
          <div className="flex items-center justify-between text-sm text-hsl(var(--foreground))">
            <span>Alternative {alt.index + 1}</span>
            <span className="text-xs text-gray-400">{(alt.distanceKm || 0).toFixed(1)} km • {(alt.timeMin || 0).toFixed(0)} min</span>
          </div>
          <div className="text-xs text-gray-400">Safety: {typeof alt.safety === 'number' ? alt.safety.toFixed(1) : '-'}</div>
        </button>
      ))}
      {items.length === 0 && <div className="text-xs text-gray-400">No alternatives</div>}
    </div>
  );
}


