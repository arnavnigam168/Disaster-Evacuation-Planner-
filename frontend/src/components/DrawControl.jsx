import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';

// Minimal DrawControl that attaches leaflet-draw controls to the map and routes events
export default function DrawControl({ featureGroupRef, onCreated, onEdited, onDeleted, drawOptions = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Use provided FeatureGroup or create a temporary one
    const featureGroup = (featureGroupRef && featureGroupRef.current) ? featureGroupRef.current : new L.FeatureGroup();

    // If we created a temporary featureGroup, add it to the map so drawing works
    let addedTempGroup = false;
    if (!(featureGroupRef && featureGroupRef.current)) {
      map.addLayer(featureGroup);
      addedTempGroup = true;
    }

    const options = {
      position: 'topright',
      edit: { featureGroup },
      draw: drawOptions,
    };

    const drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);

    const handleCreated = (e) => onCreated && onCreated(e);
    const handleEdited = (e) => onEdited && onEdited(e);
    const handleDeleted = (e) => onDeleted && onDeleted(e);

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
      if (addedTempGroup) {
        map.removeLayer(featureGroup);
      }
    };
  }, [map, featureGroupRef, onCreated, onEdited, onDeleted, drawOptions]);

  return null;
}
