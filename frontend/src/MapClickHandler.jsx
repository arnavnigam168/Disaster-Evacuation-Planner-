import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapClickHandler = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      onMapClick(e.latlng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

export default MapClickHandler;
