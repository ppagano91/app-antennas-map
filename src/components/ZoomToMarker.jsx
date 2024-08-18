import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from 'leaflet';

const ZoomToMarker = ({ position, polygonPoints }) => {
    const map = useMap();
  
    useEffect(() => {
      if (position) {
        const bounds = L.latLngBounds(polygonPoints);
        map.flyToBounds(bounds, { padding: [50, 50] });
      }
    }, [position, polygonPoints, map]);
  
    return null;
  };

export default ZoomToMarker