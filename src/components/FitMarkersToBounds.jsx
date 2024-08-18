import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet"

const FitMarkersToBounds = ({ markers }) => {
    const map = useMap();
  
    useEffect(() => {
      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(marker => [marker.latitude, marker.longitude]));
        map.fitBounds(bounds);
      }
    }, [markers, map]);
  
    return null;
  };

export default FitMarkersToBounds