// components/research/ResearchForm.jsx
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import FormField from "@/components/forms/FormField";
import Button from "@/components/ui/Button";
import MapPreview from "@/components/map/MapPreviewNoSSR";
import Switch from "@/components/ui/Switch";
import MultiSelect from "@/components/ui/MultiSelect";
import UserCardCompact from "@/components/ui/UserCardCompact";

const OfflineMapButton = dynamic(() => import("@/components/OfflineMapButton"), {
  ssr: false,
});

export default function ResearchForm({
  initialData = {},      
  onSubmit,          
  isEdit = false,    
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    release_date: "",
    end_date: "",
    lat: "",
    long: "",
    location_title: "",
    ...initialData,
  });

  const [locationData, setLocationData] = useState(null);
  const [locationEditable, setLocationEditable] = useState(true);
  const [showBasicInfo, setShowBasicInfo] = useState(true);
  const [showDates, setShowDates] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(true);
  const [collaborators, setCollaborators] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        const formatted = data.users?.map((c) => ({
          value: c.id,
          label: c.name,
          role: c.role,
          status: c.status,
          email: c.email,
        }));
        setCollaborators(formatted);
      } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
      }
    };
    fetchCollaborators();
  }, []);

  const handleLocationSelect = (data) => {
    setForm((prev) => ({
      ...prev,
      lat: data.lat,
      long: data.lng,
      location_title: data.location,
    }));
    setLocationData(data);
    setLocationEditable(false);
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      collaborators: selectedCollaborators.map((c) => ({
        id: c.value,
        name: c.label,
        role: c.role,
        status: c.status,
        email: c.email,
      })),
    };
    onSubmit?.(payload);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {isEdit ? "Editar Pesquisa" : "Criar Pesquisa"}
      </h1>
      <p className="text-sm text-gray-600 mb-2">
        {isEdit
          ? "Atualize os campos abaixo para editar a pesquisa."
          : "Preencha os campos abaixo para iniciar uma nova pesquisa."}
      </p>

      {/* Seção: Informações básicas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Informações Básicas
          </h2>
          <Switch checked={showBasicInfo} onChange={setShowBasicInfo} />
        </div>
        {showBasicInfo && (
          <>
            <FormField
              legend="Título"
              type="text"
              value={form.title}
              onChange={handleChange("title")}
            />
            <FormField
              legend="Descrição"
              type="text"
              value={form.description}
              onChange={handleChange("description")}
            />
          </>
        )}
      </div>

      <hr className="my-6 border-gray-200" />

      {/* Seção: Datas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Período da Pesquisa
          </h2>
          <Switch checked={showDates} onChange={setShowDates} />
        </div>
        {showDates && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
              legend="Data de Início"
              type="date"
              value={form.release_date}
              onChange={handleChange("release_date")}
            />
            <FormField
              legend="Data de Fim"
              type="date"
              value={form.end_date}
              onChange={handleChange("end_date")}
            />
          </div>
        )}
      </div>

      <hr className="my-6 border-gray-200" />

      {/* Seção: Localização */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Localização</h2>
          <Switch checked={showLocation} onChange={setShowLocation} />
        </div>

        {showLocation && (
          <>
            <div className="p-4 rounded-lg space-y-4 bg-gray-50 border">
              <p className="text-sm text-gray-600">
                Defina manualmente ou pelo mapa interativo.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  legend="Latitude"
                  type="text"
                  value={form.lat}
                  bgColor="bg-gray"
                  onChange={handleChange("lat")}
                  disabled
                />
                <FormField
                  legend="Longitude"
                  type="text"
                  value={form.long}
                  bgColor="bg-gray"
                  onChange={handleChange("long")}
                  disabled
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <FormField
                    legend="Localização"
                    type="text"
                    value={form.location_title}
                    bgColor={locationEditable ? "bg-gray-50" : "bg-gray-100"}
                    onChange={handleChange("location_title")}
                    disabled={!locationEditable}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setLocationEditable((prev) => !prev)}
                  className={`h-[44px] px-3 border rounded-md transition flex items-center justify-center ${
                    locationEditable
                      ? "border-gray-300 bg-gray-200 text-black"
                      : "border-gray-300 bg-gray-200 text-gray-600 hover:text-black"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {locationEditable ? "done" : "edit"}
                  </span>
                </button>
              </div>

              <div className="flex flex-col items-center border-t pt-4 gap-2">
                <OfflineMapButton onLocationSelect={handleLocationSelect} />
                <p className="text-xs text-gray-500 text-center">
                  Para obter a localização automaticamente, clique em{" "}
                  <strong>“Abrir mapa”</strong>.
                </p>
              </div>
            </div>

            {locationData && (
              <>
                <div className="flex items-center justify-between border-b pb-2 mt-4">
                  <p className="text-sm text-gray-700 font-medium">
                    Exibir Informações da localização selecionada
                  </p>
                  <Switch
                    checked={showLocationInfo}
                    onChange={setShowLocationInfo}
                  />
                </div>

                {showLocationInfo && (
                  <div className="mt-4 text-sm text-gray-700 border rounded-md p-4 bg-gray-50 space-y-4">
                    <div>
                      <strong className="block mb-1">
                        Resumo da Localização:
                      </strong>
                      <p>{locationData.location}</p>
                      <p>Lat: {locationData.lat.toFixed(6)}</p>
                      <p>Long: {locationData.lng.toFixed(6)}</p>
                      <p>
                        Clima: {locationData.weather_celsius}°C /{" "}
                        {locationData.weather_fahrenheit?.toFixed(1)}°F
                      </p>
                    </div>

                    <MapPreview
                      lat={locationData.lat}
                      lng={locationData.lng}
                      height="200px"
                      width="100%"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <hr className="my-6 border-gray-200" />

      {/* Seção: Colaboradores */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Colaboradores</h2>
          <Switch checked={showCollaborators} onChange={setShowCollaborators} />
        </div>

        {showCollaborators && (
          <>
            <MultiSelect
              options={collaborators}
              value={selectedCollaborators}
              onChange={setSelectedCollaborators}
              placeholder="Selecione os colaboradores"
            />
            <p className="text-xs text-gray-500">
              Você pode escolher múltiplos colaboradores para participar da
              pesquisa.
            </p>

            {selectedCollaborators.length > 0 && (
              <div className="mt-4 border-t pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Usuários Selecionados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[14rem] overflow-y-auto">
                  {selectedCollaborators.map((user) => (
                    <UserCardCompact
                      key={user.value}
                      user={{
                        id: user.value,
                        name: user.label,
                        role: user.role,
                        status: user.status,
                        email: user.email,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="dark"
          className="w-full text-lg py-3 active:scale-95"
          onClick={handleSubmit}
        >
          {isEdit ? "Salvar Alterações" : "Criar Pesquisa"}
        </Button>
      </div>
    </div>
  );
}
