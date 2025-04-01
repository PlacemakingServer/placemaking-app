// components/map/MapPreview.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/maps/marker-icon.png",
  iconUrl: "/maps/marker-icon.png",
  shadowUrl: "/maps/marker-shadow.png",
});

export default function MapPreview({
  lat,
  lng,
  width = "100%",
  height = "200px",
  zoom = 16,
}) {
  if (!lat || !lng) return null;

  return (
    <div
      style={{ width, height }}
      className="rounded-md overflow-hidden shadow-sm"
    >
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; 
                           <a href="https://www.openstreetmap.org/copyright">
                           OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>Localização selecionada</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
