import React from 'react';
import { DISASTER_TYPES } from '../lib/constants';
import { AlertTriangle } from 'lucide-react';

const DisasterSelector = ({ selectedType, onSelect, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-amber-500" size={20} />
        <h3 className="text-sm font-semibold text-slate-200">Active Disaster Type</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {Object.values(DISASTER_TYPES).map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg
              transition-all duration-200
              ${selectedType === type.id
                ? 'bg-slate-700 ring-2 ring-slate-500 text-white'
                : 'bg-slate-800/50 hover:bg-slate-700/70 text-slate-300 hover:text-white'
              }
            `}
          >
            <span className="text-xl">{type.icon}</span>
            <span className="text-sm font-medium">{type.label}</span>
          </button>
        ))}
      </div>
      
      {selectedType && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: DISASTER_TYPES[selectedType.toUpperCase()].color }}
            />
            <span>Draw affected areas on map</span>
          </div>
          <div className="text-xs text-slate-400">
            Areas marked as affected will be avoided when planning evacuation routes
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterSelector;