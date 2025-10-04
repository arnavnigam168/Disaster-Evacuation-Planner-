import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

function MapView({ start, end, routeStats }) {
  // Default center is Pune, India
  const defaultCenter = [18.5204, 73.8567];
  const defaultZoom = 13;

  const parseCoordinates = (coordString) => {
    if (!coordString || !coordString.includes(',')) return null;
    const [lat, lng] = coordString.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  };

  const startPosition = parseCoordinates(start);
  const endPosition = parseCoordinates(end);

  return (
    <MapContainer
      center={startPosition || defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ZoomControl position="bottomright" />
      
      {startPosition && <Marker position={startPosition} />}
      {endPosition && <Marker position={endPosition} />}
      
      {routeStats?.coordinates && (
        <Polyline
          positions={routeStats.coordinates}
          pathOptions={{
            color: '#22c55e',
            weight: 6,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
      )}
    </MapContainer>
  );
}

export default MapView;