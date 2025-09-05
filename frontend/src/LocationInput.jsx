import React from "react";

function LocationInput({ label, value, setValue }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Enter ${label}`}
        className="p-2 border rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600"
      />
    </div>
  );
}

export default LocationInput;
