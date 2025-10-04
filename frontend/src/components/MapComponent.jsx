import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

import Routing from "./Routing";

function MapComponent({ start, end, onRouteFound, drawnItems, children }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      // Invalidate map size to fix rendering issues
      mapRef.current.invalidateSize();
    }
  }, []);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      whenCreated={map => mapRef.current = map}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {children}
      {start && end && <Routing start={start} end={end} onRouteFound={onRouteFound} drawnItems={drawnItems} />}
    </MapContainer>
  );
}

export default MapComponent;