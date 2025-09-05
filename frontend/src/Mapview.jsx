import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";

function Routing({ start, end, setRouteStats }) {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
      routeWhileDragging: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "blue", weight: 5 }],
      },
    })
      .on("routesfound", function (e) {
        const route = e.routes[0];
        const distance = (route.summary.totalDistance / 1000).toFixed(1); // km
        const duration = (route.summary.totalTime / 3600).toFixed(1); // hours
        setRouteStats({ distance, duration });
      })
      .addTo(map);

    map.fitBounds([
      [start.lat, start.lng],
      [end.lat, end.lng],
    ]);

    return () => map.removeControl(routingControl);
  }, [start, end, map, setRouteStats]);

  return null;
}

export default function MapView({ start, end, setRouteStats }) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]} // India center
      zoom={5}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {start && end && (
        <Routing start={start} end={end} setRouteStats={setRouteStats} />
      )}
    </MapContainer>
  );
}
