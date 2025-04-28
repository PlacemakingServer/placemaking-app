// /components/map/MapLeafletComponent.js
import React, { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Button from "@/components/ui/Button_og";
import SearchControl from "@/components/map/SearchControl";
import LocationMarker from "@/components/map/LocationMarker";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/maps/marker-icon.png",
  iconUrl: "/maps/marker-icon.png",
  shadowUrl: "/maps/marker-shadow.png",
});

const { BaseLayer } = LayersControl;

export default function MapLeafletComponent({
  lat = -23.5505,
  lng = -46.6333,
  zoom = 13,
  onClose,
  onSaveLocation,
}) {
  const [location, setLocation] = useState(null);
  const mapRef = useRef();

  const handleSaveLocation = () => {
    if (location) {
      onSaveLocation?.(location); // Envia a posição exata do pin para o pai
    } else {
      alert("Nenhuma localização selecionada.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-w-5xl mx-4 bg-transparent rounded-lg shadow-lg overflow-hidden">
        <SearchControl
          onNavigate={(coords) => {
            setLocation({ lat: coords[0], lng: coords[1] });
          }}
        />

        <div className="w-full h-[70vh] md:h-[80vh] rounded-lg overflow-hidden">
          <MapContainer
            center={[lat, lng]}
            zoom={zoom}
            scrollWheelZoom={true}
            className="w-full h-full"
            zoomControl={false}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
          >
            <ZoomControl position="bottomleft" />
            <LayersControl position="bottomright">
              <BaseLayer name="Default">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
                    OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <BaseLayer checked name="Carto Voyager">
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; 
                    <a href="https://www.openstreetmap.org/copyright">
                    OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
              </BaseLayer>
            </LayersControl>

            <LocationMarker location={location} setLocation={setLocation} />
          </MapContainer>
        </div>

        <div className="bg-transparent p-4 flex justify-center gap-4">
          <Button
            onClick={handleSaveLocation}
            className="px-4 py-2 transition flex justify-evenly items-center gap-2"
            variant="azul_escuro"
          >
            <span className="material-symbols-outlined text-xl">place</span>
            <span>Salvar</span>
          </Button>

          <Button
            onClick={onClose}
            className="px-4 py-2 transition flex justify-evenly items-center gap-2"
            variant="vermelho"
          >
            <span className="material-symbols-outlined text-xl">close</span>
            <span>Fechar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
