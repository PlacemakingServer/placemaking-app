import { useState, useEffect, useRef } from "react";
import FormField from "@/components/forms/FormField";
import Switch from "@/components/ui/Switch";
import Button from "@/components/ui/Button";
import FormBuilder from "@/components/forms/FormBuilder";
import dynamic from "next/dynamic";
import MapPreview from "@/components/map/MapPreviewNoSSR";

const OfflineMapButton = dynamic(
  () => import("@/components/OfflineMapButton"),
  {
    ssr: false,
  }
);

export default function CollectionFormSection({
  initialData = {},
  survey_type,
  research_id,
  handleCancelCreateSurvey,
  handleCreateSurvey,
}) {
  const [enabled, setEnabled] = useState(false);
  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    survey_type: survey_type,
    research_id: research_id,
    ...initialData,
  });
  const [isEdit, setIsEdit] = useState(false);
  const initialDataRef = useRef(JSON.stringify(initialData));
  const [showLocationInfo, setShowLocationInfo] = useState(true);
  const [enableFormBulder, setEnableFormBuilder] = useState(false);
  const [showSurveyInformation, setShowSurveyInformation] = useState(true);

  const handleLocationSelect = (data) => {
    setForm((prev) => ({
      ...prev,
      lat: data.lat,
      long: data.lng,
      location_title: data.location || "",
      weather_celsius: data.weather_celsius ?? null,
      weather_fahrenheit: data.weather_fahrenheit ?? null,
    }));
  };

  useEffect(() => {
    const hasInitialData = initialData && initialData.id;
    const serializedInitial = JSON.stringify(initialData);

    if (initialDataRef.current !== serializedInitial) {
      initialDataRef.current = serializedInitial;
      setForm((prev) => ({ ...prev, ...initialData }));
    }
    if (hasInitialData) {
      setEnabled(false);
    }
    setIsEdit(hasInitialData);
    setEnableFormBuilder(hasInitialData);
  }, [initialData]);

  useEffect(() => {
    if (!enabled) {
      setEnableFormBuilder(false);
    } else {
      setEnableFormBuilder(true);
    }
  }, [enabled]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    const data = await handleCreateSurvey(form);
    if (data && data.id) {
      setIsEdit(true);
      setEnabled(true);
      setForm((prev) => ({
        ...prev,
        ...data,
      }));

      if (data.structure) {
        setFormStructure(data.structure);
      }

      setEnableFormBuilder(true);
    }
  };

  return (
    <div className="border rounded-xl p-6 bg-white shadow max-w-4xl mx-auto w-full space-y-6">
      <div className="w-full flex flex-row items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <h2 className="text-xl font-bold text-gray-800">
          {isEdit ? `Entrevista: ${form.title}` : "Nova - Entrevista"}
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <Switch checked={enabled} onChange={setEnabled} />
        </div>
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p>
          <strong>ID da Pesquisa:</strong> {research_id || "—"}
        </p>
        <p>
          <strong>ID do Tipo de Coleta:</strong> {survey_type || "—"}
        </p>
      </div>

      {enabled && (
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Informações da Coleta
              </h2>
              <p className="text-sm text-gray-600">
                Insira as informações da coleta, como título, descrição e
                localização.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={showSurveyInformation}
                onChange={setShowSurveyInformation}
              />
            </div>
          </div>

          {showSurveyInformation && (
            <div className="space-y-4">
              <FormField
                legend="Título do Formulário"
                type="text"
                value={form.title}
                onChange={handleChange("title")}
              />

              <FormField
                legend="Descrição"
                type="textarea"
                value={form.description}
                onChange={handleChange("description")}
              />

              <div className="p-4 rounded-lg space-y-4 bg-gray-50 border">
                <p className="text-sm text-gray-600">
                  Defina uma localização para essa coleta pelo mapa interativo.
                </p>
                <div className="grid grid-cols-2 gap-4">
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
                />

                <div className="flex flex-col items-center border-t pt-4 gap-2">
                  <OfflineMapButton onLocationSelect={handleLocationSelect} />
                  <p className="text-xs text-gray-500 text-center">
                    Para obter a localização automaticamente, clique em{" "}
                    <strong>“Abrir mapa”</strong>.
                  </p>
                </div>

                {!!form.lat && !!form.long && (
                  <>
                    <div className="flex items-center justify-between border-b pb-2 mt-4">
                      <p className="text-sm text-gray-700 font-medium">
                        Exibir Informações da localização
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
                  </>
                )}
              </div>

              {enabled && (
                <div className="pt-4 flex justify-center">
                  <Button variant="verde" onClick={handleSave}>
                    {isEdit ? "Salvar Alterações" : "Criar Coleta"}
                  </Button>
                  {!isEdit && (
                    <Button
                      variant="vermelho"
                      className="ml-4"
                      onClick={() => handleCancelCreateSurvey()}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <hr className="border-gray-200 pl-6 pr-6" />
      {enableFormBulder && (
        <div>
          <FormBuilder
            survey_id={form.id}
            survey_type={form.survey_type}
            onChange={(updated) => setFormStructure(updated)}
          />
        </div>
      )}
    </div>
  );
}
