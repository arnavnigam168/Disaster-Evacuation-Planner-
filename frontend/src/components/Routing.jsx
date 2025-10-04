import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { routeIntersectsDrawnItems, sampleWaypointCandidates } from '../lib/avoidance';

// Simple routing using the public OSRM demo API via fetch. This replaces
// leaflet-routing-machine to avoid its internal errors and gives us control
// to implement polygon avoidance later.
const OSRM_SERVICE = 'https://router.project-osrm.org/route/v1';

const Routing = ({ start, end, onRouteFound, drawnItems }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // Layer group to hold route polyline + markers so we can clean up easily
    const routeLayer = L.layerGroup().addTo(map);

    const fetchRoute = async (waypoint) => {
      try {
        // If a waypoint is supplied (lng,lat) we'll request a route via that point.
        const coords = waypoint ? `${start.lng},${start.lat};${waypoint[0]},${waypoint[1]};${end.lng},${end.lat}` : `${start.lng},${start.lat};${end.lng},${end.lat}`;
        const url = `${OSRM_SERVICE}/driving/${coords}?overview=full&geometries=geojson&alternatives=false&steps=false`;
        console.debug('Routing ->', url);
        const res = await fetch(url);
        if (!res.ok) {
          console.error('OSRM response not ok', res.status);
          return;
        }
        const data = await res.json();
        if (!data || !data.routes || !data.routes.length) {
          console.warn('No routes returned from OSRM', data);
          return;
        }

  const route = data.routes[0];
  const coordsLatLng = route.geometry.coordinates.map(c => [c[1], c[0]]);

        // Draw polyline
        const poly = L.polyline(coordsLatLng, { color: '#6FA1EC', weight: 4 }).addTo(routeLayer);

        // Add start/end markers
        L.marker([start.lat, start.lng]).addTo(routeLayer);
        L.marker([end.lat, end.lng]).addTo(routeLayer);

        // Fit map to route
        try {
          map.fitBounds(poly.getBounds(), { padding: [50, 50] });
        } catch (fitErr) {
          // non-fatal
          console.warn('fitBounds failed', fitErr);
        }

        // Report summary back to parent (include raw seconds for better formatting on UI)
        if (onRouteFound) {
          onRouteFound({ distance: (route.distance / 1000).toFixed(2) + ' km', durationSeconds: Math.round(route.duration), coordinates: coordsLatLng });
        }

        // If drawnItems exist, do a quick intersection check and return that info via console
        // so callers can decide to attempt avoidance — but we'll also attempt a basic
        // avoidance here: sample candidate waypoints and retry until one yields a
        // non-intersecting route.
        if (drawnItems && routeIntersectsDrawnItems(coordsLatLng, drawnItems)) {
          console.info('Route intersects drawn polygons — attempting simple avoidance');
          const candidates = sampleWaypointCandidates(drawnItems);
          for (const c of candidates) {
            // perform a reroute via candidate waypoint
            console.debug('Trying waypoint candidate', c);
            // attempt fetchRoute recursively but only once per candidate to avoid deep recursion
            const tryRes = await fetch(`${OSRM_SERVICE}/driving/${start.lng},${start.lat};${c[0]},${c[1]};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=false&steps=false`);
            if (!tryRes.ok) continue;
            const tryData = await tryRes.json();
            if (!tryData || !tryData.routes || !tryData.routes.length) continue;
            const tryRoute = tryData.routes[0];
            const tryCoords = tryRoute.geometry.coordinates.map(cc => [cc[1], cc[0]]);
            if (!routeIntersectsDrawnItems(tryCoords, drawnItems)) {
              // Clear previous drawing and draw the new route instead
              routeLayer.clearLayers();
              const poly2 = L.polyline(tryCoords, { color: '#E69F6F', weight: 4 }).addTo(routeLayer);
              L.marker([start.lat, start.lng]).addTo(routeLayer);
              L.marker([end.lat, end.lng]).addTo(routeLayer);
              try { map.fitBounds(poly2.getBounds(), { padding: [50, 50] }); } catch (e) {}
              if (onRouteFound) onRouteFound({ distance: (tryRoute.distance / 1000).toFixed(2) + ' km', durationSeconds: Math.round(tryRoute.duration), coordinates: tryCoords });
              break;
            }
          }
        }
      } catch (err) {
        console.error('Routing error:', err);
      }
    };

    fetchRoute();

    return () => {
      try { map.removeLayer(routeLayer); } catch (e) { /* ignore */ }
    };
  }, [map, start, end, drawnItems]);

  return null;
};

export default Routing;
