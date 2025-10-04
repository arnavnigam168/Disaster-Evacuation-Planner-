import React, { useState, useCallback } from 'react';
import { MapPin, Flag, Navigation } from 'lucide-react';
import LocationInput from './LocationInput';

const RoutePlanner = ({ onRouteFind }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onRouteFind && start && end) {
      onRouteFind(start, end);
    }
  };

  const handleStartChange = useCallback((value) => {
    setStart(value);
  }, []);

  const handleEndChange = useCallback((value) => {
    setEnd(value);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setStart(`${position.coords.latitude}, ${position.coords.longitude}`);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <LocationInput
          label="Start Location"
          value={start}
          setValue={handleStartChange}
          icon={MapPin}
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          className="w-full flex items-center justify-center gap-2 py-2 sm:py-1.5 px-3 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md border border-slate-600 transition-colors active:bg-slate-500"
        >
          <Navigation size={14} />
          Use My Current Location
        </button>
      </div>
      <LocationInput
        label="Destination"
        value={end}
        setValue={handleEndChange}
        icon={Flag}
      />
      <button
        type="submit"
        disabled={!start || !end}
        className={`
          w-full font-semibold rounded-lg px-4 py-3 transition-colors
          ${!start || !end
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
            : 'bg-amber-500 hover:bg-amber-600 text-slate-900'
          }
        `}
      >
        Find Safe Route
      </button>
    </form>
  );
};

export default RoutePlanner;