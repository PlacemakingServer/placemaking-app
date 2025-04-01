import { useEffect } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';

export default function LocationMarker({ location, setLocation }) {
  const map = useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });

  useEffect(() => {
    if (location) {
      setTimeout(() => {
        map.flyTo([location.lat, location.lng], 16);
      }, 100);
    }
  }, [location, map]);

  return location ? (
    <Marker position={location}>
      <Popup>
        Latitude: {location.lat.toFixed(4)}, Longitude: {location.lng.toFixed(4)}
      </Popup>
    </Marker>
  ) : null;
}
