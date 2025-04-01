// /components/OfflineMapButton.js
import React, { useState } from "react";
import MapLeafletNoSSR from "@/components/map/MapLeafletNoSSR";

export default function OfflineMapButton({ onLocationSelect }) {
  const [showMap, setShowMap] = useState(false);

  function openMap() {
    setShowMap(true);
  }

  function closeMap() {
    setShowMap(false);
  }

  async function handleSaveLocation(coords) {
    const { lat, lng } = coords;

    try {
      const locationRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const locationData = await locationRes.json();

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      console.log("Dados da localização:", locationData);
      console.log("Dados do clima:", weatherData);

      const result = {
        lat,
        lng,
        location: locationData.display_name || "Localização não identificada",
        weather_celsius: weatherData.current_weather?.temperature ?? null,
        weather_fahrenheit:
          weatherData.current_weather?.temperature !== undefined
            ? (weatherData.current_weather.temperature * 9) / 5 + 32
            : null,
      };

      onLocationSelect?.(result);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      alert("Erro ao buscar informações da localização.");
    }

    setShowMap(false);
  }

  return (
    <div>
      {!showMap && (
        <button
          onClick={openMap}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Abrir mapa
        </button>
      )}

      {showMap && (
        <MapLeafletNoSSR
          lat={-23.5505}
          lng={-46.6333}
          zoom={13}
          onClose={closeMap}
          onSaveLocation={handleSaveLocation}
        />
      )}
    </div>
  );
}
