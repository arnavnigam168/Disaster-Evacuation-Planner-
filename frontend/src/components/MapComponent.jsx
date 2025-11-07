import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, FeatureGroup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';

const MapComponent = ({ routeData, onPolygonDrawn, disasterType = 'general', showWeather = false, showTraffic = false }) => {
  const [map, setMap] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [altLines, setAltLines] = useState([]);
  const [hoverMarker, setHoverMarker] = useState(null);

  useEffect(() => {
    // Use routeGeoJSON from routeData if available (already fetched by App.jsx)
    if (routeData?.routeGeoJSON) {
      const parsedGeoJSON = routeData.routeGeoJSON;
      if (parsedGeoJSON.coordinates && Array.isArray(parsedGeoJSON.coordinates)) {
        const coords = parsedGeoJSON.coordinates.map(([lng, lat]) => [lat, lng]); // Swap for Leaflet
        setRouteCoords(coords);
        console.log('Route coordinates updated:', coords.length, 'points');
        if (map) {
          map.fitBounds(coords);
        }
      } else {
        console.warn('Invalid GeoJSON:', parsedGeoJSON);
        setRouteCoords([]);
      }
      // Load alternative geometries for preview
      if (Array.isArray(routeData?.altGeometries)) {
        const lines = routeData.altGeometries
          .map(g => (g?.coordinates ? g.coordinates.map(([lng, lat]) => [lat, lng]) : null))
          .filter(Boolean);
        setAltLines(lines);
      } else {
        setAltLines([]);
      }
    } else if (routeData?.startCoords && routeData?.endCoords) {
      // Fallback to straight line if no GeoJSON
      setRouteCoords([
        [routeData.startCoords.lat, routeData.startCoords.lng],
        [routeData.endCoords.lat, routeData.endCoords.lng],
      ]);
    }
  }, [map, routeData]);

  useEffect(() => {
    if (!map) return;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet-images/marker-icon-2x.png',
      iconUrl: '/leaflet-images/marker-icon.png',
      shadowUrl: '/leaflet-images/marker-shadow.png',
    });
  }, [map]);

  // Show hover marker when a step is hovered
  useEffect(() => {
    if (!map) return;
    if (routeData?.hoverPoint && routeData.hoverPoint.lat && routeData.hoverPoint.lng) {
      if (hoverMarker) {
        hoverMarker.setLatLng([routeData.hoverPoint.lat, routeData.hoverPoint.lng]);
      } else {
        const m = L.circleMarker([routeData.hoverPoint.lat, routeData.hoverPoint.lng], { radius: 6, color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.9 });
        m.addTo(map);
        setHoverMarker(m);
      }
      map.panTo([routeData.hoverPoint.lat, routeData.hoverPoint.lng], { animate: true });
    }
  }, [map, routeData?.hoverPoint]);

  // Restyle existing polygons when disasterType changes
  useEffect(() => {
    if (!map || !map.drawnItems) return;
    const colorMap = {
      general: { stroke: '#ff3333', fill: '#ff3333' },
      flood: { stroke: '#1e90ff', fill: '#1e90ff' },
      ocean: { stroke: '#1e90ff', fill: '#1e90ff' },
      fire: { stroke: '#ff7f0e', fill: '#ff7f0e' },
      industrial: { stroke: '#9c27b0', fill: '#9c27b0' },
    };
    const style = colorMap[disasterType] || colorMap.general;
    map.drawnItems.eachLayer((layer) => {
      if (layer.setStyle) {
        layer.setStyle({ color: style.stroke, fillColor: style.fill, fillOpacity: 0.3 });
      }
    });
  }, [map, disasterType]);

  const onCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const latLngs = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
      const colorMap = {
        general: { stroke: '#ff3333', fill: '#ff3333' },
        flood: { stroke: '#1e90ff', fill: '#1e90ff' },
        ocean: { stroke: '#1e90ff', fill: '#1e90ff' },
        fire: { stroke: '#ff7f0e', fill: '#ff7f0e' },
        industrial: { stroke: '#9c27b0', fill: '#9c27b0' },
      };
      const style = colorMap[disasterType] || colorMap.general;
      layer.setStyle({ color: style.stroke, fillColor: style.fill, fillOpacity: 0.3 });

      // Add to map.drawnItems which is initialized in whenCreated
      if (map && map.drawnItems) {
        map.drawnItems.addLayer(layer);
      }

      if (onPolygonDrawn && typeof onPolygonDrawn === 'function') {
        onPolygonDrawn(latLngs);
      }
    }
  };

  // Programmatic draw start (in case toolbar is hidden/offscreen)
  const handleStartPolygon = useCallback(() => {
    if (!map) return;
    const colorMap = {
      general: { stroke: '#ff3333', fill: '#ff3333' },
      flood: { stroke: '#1e90ff', fill: '#1e90ff' },
      ocean: { stroke: '#1e90ff', fill: '#1e90ff' },
      fire: { stroke: '#ff7f0e', fill: '#ff7f0e' },
      industrial: { stroke: '#9c27b0', fill: '#9c27b0' },
    };
    const style = colorMap[disasterType] || colorMap.general;
    const draw = new L.Draw.Polygon(map, { shapeOptions: { color: style.stroke, fillColor: style.fill, fillOpacity: 0.3 } });
    draw.enable();
  }, [map, disasterType]);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      className="leaflet-container"
      whenCreated={(mapInstance) => {
        setMap(mapInstance);
        // Initialize drawnItems on the map instance to avoid null reference
        mapInstance.drawnItems = new L.FeatureGroup();
        mapInstance.addLayer(mapInstance.drawnItems);
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Optional weather overlay using RainViewer tiles */}
      {showWeather && (
        <TileLayer
          url="https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/2/1_1.png"
          opacity={0.5}
          attribution='&copy; RainViewer'
        />
      )}

      {/* Optional traffic overlay (requires key). Supports MapTiler if VITE_MAPTILER_KEY is present */}
      {showTraffic && (import.meta.env.VITE_MAPTILER_KEY || (typeof window !== 'undefined' && localStorage.getItem('MAPTILER_KEY'))) && (
        <TileLayer
          url={`https://api.maptiler.com/tiles/traffic/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_KEY || (typeof window !== 'undefined' && localStorage.getItem('MAPTILER_KEY'))}`}
          opacity={0.6}
          attribution='&copy; MapTiler Traffic'
        />
      )}

      {routeData && (
        <>
          <Marker
            position={[routeData.startCoords?.lat || 20.5937, routeData.startCoords?.lng || 78.9629]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: #ff6347; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white;"></div>',
              iconSize: [12, 12],
            })}
          />
          <Marker
            position={[routeData.endCoords?.lat || 20.5937, routeData.endCoords?.lng || 78.9629]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: #4682b4; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white;"></div>',
              iconSize: [12, 12],
            })}
          />
        </>
      )}

      {routeCoords.length > 0 && (
        <Polyline
          positions={routeCoords}
          color={'#f59e0b'}
          weight={6}
          opacity={0.8}
        />
      )}

      {/* Alternative preview polylines */}
      {altLines.map((line, idx) => {
        const isHover = routeData?.hoverAltIndex === idx;
        return (
          <Polyline key={idx} positions={line} color={isHover ? '#94a3b8' : '#64748b'} weight={isHover ? 4 : 3} opacity={isHover ? 0.8 : 0.35} />
        );
      })}

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

      {/* Floating quick action to start drawing polygon */}
      <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 1200 }}>
        <button onClick={handleStartPolygon} className="btn-primary px-3 py-1">Draw Polygon</button>
      </div>
    </MapContainer>
  );
};

export default MapComponent;
