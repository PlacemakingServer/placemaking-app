"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import FormField from "@/components/forms/FormField";
import Switch from "@/components/ui/Switch";
import MapPreview from "@/components/map/MapPreviewNoSSR";

const OfflineMapButton = dynamic(
  () => import("@/components/OfflineMapButton"),
  { ssr: false }
);

export default function LocationForm({
  form,
  setForm,
  showLocationForm,
  setShowLocationForm,
}) {
  const [showFormInputLocation, setShowFormInputLocation] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLocationSelect = (data) => {
    setForm((prev) => ({
      ...prev,
      lat: data.lat,
      long: data.lng,
      location_title: data.location || "",
      weather_celsius: data.weather_celsius ?? null,
      weather_fahrenheit: data.weather_fahrenheit ?? null,
    }));
    setShowFormInputLocation(true);
  };

  return (
    <div className="rounded-lg space-y-4">
      {/* Header com tooltip */}
      <div className="flex items-center justify-between bg-transparent transition-all px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Informações de Localização
            </h2>
            <Tooltip.Provider delayDuration={100}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button>
                    <MapPin
                      size={16}
                      className="text-gray-400 hover:text-gray-600 transition"
                    />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    className="z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-md shadow-lg max-w-xs"
                    sideOffset={6}
                  >
                    Use o mapa para capturar a latitude, longitude e o clima da localização.
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <p className="text-sm text-gray-600 leading-snug">
            Defina a posição geográfica exata e visualize o local no mapa.
          </p>
        </div>
        <Switch
          type="arrow"
          checked={showLocationForm}
          onChange={setShowLocationForm}
        />
      </div>

      {showLocationForm && (
        <div className="bg-transparent px-4 py-5 mt-2 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              legend="Latitude"
              type="text"
              value={form.lat}
              onChange={handleChange("lat")}
              disabled
            />
            <FormField
              legend="Longitude"
              type="text"
              value={form.long}
              onChange={handleChange("long")}
              disabled
            />
          </div>

          <FormField
            legend="Localização (Título)"
            type="text"
            value={form.location_title}
            onChange={handleChange("location_title")}
            placeholder="Ex: Praça Roosevelt, SP"
          />

          {!!form.lat && !!form.long && (
            <div className="border rounded-md p-4 bg-gray-50 space-y-4">
              <div className="text-sm text-gray-700">
                <strong className="block mb-1">Resumo da Localização:</strong>
                <p>{form.location_title}</p>
                <p>Lat: {Number(form.lat).toFixed(6)}</p>
                <p>Long: {Number(form.long).toFixed(6)}</p>
                {form.weather_celsius && form.weather_fahrenheit && (
                  <p>
                    Clima: {form.weather_celsius}°C /{" "}
                    {Number(form.weather_fahrenheit).toFixed(1)}°F
                  </p>
                )}
              </div>
              <MapPreview
                lat={Number(form.lat)}
                lng={Number(form.long)}
                height="200px"
                width="100%"
              />
            </div>
          )}

          <div className="flex flex-col items-center pt-2 gap-2">
            <OfflineMapButton onLocationSelect={handleLocationSelect} />
            <p className="text-xs text-gray-500 text-center">
              Para obter a localização automaticamente, clique em{" "}
              <strong>“Abrir mapa”</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
