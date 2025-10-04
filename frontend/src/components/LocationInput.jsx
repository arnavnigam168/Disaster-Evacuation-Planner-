import React from "react";
import { MapPin } from "lucide-react";

function LocationInput({ label, value, setValue, icon: Icon = MapPin }) {
  const isValidCoordinate = (coord) => {
    if (!coord) return true;
    const parts = coord.split(',').map(part => part.trim());
    if (parts.length !== 2) return false;
    
    const [lat, lng] = parts.map(Number);
    return !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 &&
           lng >= -180 && lng <= 180;
  };

  const handleChange = (e) => {
    e.preventDefault();
    const inputValue = e.target.value;
    setValue(inputValue);
  };

  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={`Enter ${label}`}
        className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
      />
    </div>
  );
}

export default LocationInput;
