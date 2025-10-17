import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';

const MapComponent = ({ routeData, onPolygonDrawn }) => {
  const position = [20.5937, 78.9629]; // Default center, will be adjusted by fitBounds
  const [map, setMap] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (!map) return;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet-images/marker-icon-2x.png',
      iconUrl: '/leaflet-images/marker-icon.png',
      shadowUrl: '/leaflet-images/marker-shadow.png',
      publicBase: '/leaflet-images',
    });
  }, [map]);

  useEffect(() => {
    const fetchRouteGeometry = async () => {
      if (!routeData || !routeData.startCoords || !routeData.endCoords) return;

      try {
        const response = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${routeData.endCoords.lng},${routeData.endCoords.lat};${routeData.startCoords.lng},${routeData.startCoords.lat}?overview=full&geometries=geojson`
        );
        const data = response.data;
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]); // Convert [lng, lat] to [lat, lng] for Leaflet
          setRouteCoords(coords);
          map.fitBounds([
            [routeData.startCoords.lat, routeData.startCoords.lng],
            [routeData.endCoords.lat, routeData.endCoords.lng],
          ]);
        } else {
          console.error('No route found:', data.message);
        }
      } catch (err) {
        console.error('OSRM fetch error:', err);
      }
    };

    fetchRouteGeometry();
  }, [map, routeData]);

  const onCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const latLngs = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
      onPolygonDrawn(latLngs); // Send polygon coordinates to App.jsx
    }
  };

  return (
    <MapContainer
      center={position}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      className="leaflet-container"
      whenCreated={setMap}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" weight={5} opacity={0.8} />}
      {routeData && (
        <>
          <Marker position={[routeData.startCoords.lat, routeData.startCoords.lng]} icon={L.divIcon({ className: 'custom-marker', html: '<div style="background-color: #ff6347; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white;"></div>', iconSize: [12, 12] })} />
          <Marker position={[routeData.endCoords.lat, routeData.endCoords.lng]} icon={L.divIcon({ className: 'custom-marker', html: '<div style="background-color: #4682b4; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white;"></div>', iconSize: [12, 12] })} />
        </>
      )}
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={onCreated}
          draw={{
            rectangle: false,
            polygon: true,
            circle: false,
            marker: false,
            polyline: false,
            circlemarker: false,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
};

export default MapComponent;