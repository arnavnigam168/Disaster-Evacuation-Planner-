import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import booleanPointOnLine from '@turf/boolean-point-on-line';
import buffer from '@turf/buffer';
import { point as turfPoint, polygon as turfPolygon, featureCollection, lineString } from '@turf/helpers';
import distance from '@turf/distance';

// Uses Turf.js for robust geometry operations. We create a buffered polygon
// (safety margin) and then test route points against the buffered polygon.

export function routeIntersectsDrawnItems(routeCoords, drawnItems, bufferMeters = 50) {
  if (!drawnItems) return false;
  let intersects = false;
  const tRoutePoints = routeCoords.map(c => turfPoint([c[1], c[0]]));

  drawnItems.eachLayer(layer => {
    if (intersects) return;
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      const latlngs = layer.getLatLngs();
      const ring = latlngs && latlngs[0] ? latlngs[0].map(ll => [ll.lng, ll.lat]) : [];
      if (!ring.length) return;
      const poly = turfPolygon([ring]);
      const polyBuf = buffer(poly, bufferMeters, { units: 'meters' });
      for (const p of tRoutePoints) {
        if (booleanPointInPolygon(p, polyBuf)) { intersects = true; break; }
      }
    } else if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      const centerPt = turfPoint([center.lng, center.lat]);
      const circBuf = buffer(centerPt, layer.getRadius() + bufferMeters, { units: 'meters' });
      for (const p of tRoutePoints) {
        if (booleanPointInPolygon(p, circBuf)) { intersects = true; break; }
      }
    }
  });
  return intersects;
}

// Improved waypoint candidate generation: produce points just outside the buffered
// polygon by sampling polygon vertices and pushing them outward along the
// vertex-normal direction. This increases the chance that an OSRM route via
// the candidate will go around the hazard.
export function sampleWaypointCandidates(drawnItems, sampleStep = 4, maxCandidates = 24, offsetMeters = 120) {
  const candidates = [];
  if (!drawnItems) return candidates;
  drawnItems.eachLayer(layer => {
    if (candidates.length >= maxCandidates) return;
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      const latlngs = layer.getLatLngs();
      const ring = latlngs && latlngs[0] ? latlngs[0] : [];
      for (let i = 0; i < ring.length && candidates.length < maxCandidates; i += sampleStep) {
        const prev = ring[(i - 1 + ring.length) % ring.length];
        const curr = ring[i];
        const next = ring[(i + 1) % ring.length];
        // compute outward normal via neighboring points
        const ax = curr.lng - prev.lng; const ay = curr.lat - prev.lat;
        const bx = next.lng - curr.lng; const by = next.lat - curr.lat;
        // approximate normal by averaging edge normals
        const nx = -(ay + by);
        const ny = (ax + bx);
        // normalize
        const len = Math.sqrt(nx * nx + ny * ny) || 1;
        const ux = nx / len; const uy = ny / len;
        // convert offset meters to degrees roughly (lon adjustment by cos(lat))
        const metersToDeg = (m) => m / 111320;
        const offLat = curr.lat + uy * metersToDeg(offsetMeters);
        const offLng = curr.lng + ux * metersToDeg(offsetMeters) / Math.max(Math.cos(curr.lat * Math.PI / 180), 0.00001);
        candidates.push([offLng, offLat]);
      }
    } else if (layer instanceof L.Circle) {
      const c = layer.getLatLng();
      // push east by radius + offset
      const metersToDeg = (m) => m / 111320;
      const offsetLng = c.lng + metersToDeg(layer.getRadius() + offsetMeters) / Math.max(Math.cos(c.lat * Math.PI / 180), 0.00001);
      candidates.push([offsetLng, c.lat]);
    }
  });
  return candidates.slice(0, maxCandidates);
}
