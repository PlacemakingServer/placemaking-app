import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import FormField from "@/components/forms/FormField";
import Button from "@/components/ui/Button_og";
import MapPreview from "@/components/map/MapPreviewNoSSR";
import Switch from "@/components/ui/Switch";
import Contributors from "@/components/research/Contributors"; 
import { useRouter } from "next/router";

const OfflineMapButton = dynamic(
  () => import("@/components/OfflineMapButton"),
  { ssr: false }
);

export default function ResearchForm({
  initialData = {},
  onSubmit,
  isEdit = false,
  users = [],
}) {
  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    release_date: "",
    end_date: "",
    lat: "",
    long: "",
    location_title: "",
    status: undefined,
    created_by: "",
    ...initialData,
  });

  const [showBasicInfo, setShowBasicInfo] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const router = useRouter();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLocationSelect = (data) => {
    setForm((prev) => ({
      ...prev,
      lat: data.lat,
      long: data.lng,
      location_title: data.location || ""
    }));
  };

  const handleChangeStatus = () => {
    const action = form.status ? "desativar" : "ativar";
    if (window.confirm(`Tem certeza que deseja ${action} a pesquisa?`)) {
      const newStatus = !form.status;
      setForm((prev) => ({
        ...prev,
        status: newStatus,
      }));
      const payload = { ...form, status: newStatus };
      onSubmit?.(payload);
      router.push(`/researches`);
    }
  };

  const handleSubmit = () => {
    if (window.confirm("Tem certeza que deseja salvar as alterações?")) {
      const payload = { ...form };
      onSubmit?.(payload);
    }
  };

  useEffect(() => {
    const idx = Math.floor(Math.random() * 5);
    setImageUrl(`/img/cards/img-${idx}.jpg`);
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-2xl shadow-md">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-t-lg"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-black/50 px-6 py-8 sm:px-8 sm:py-10 rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow">
                {isEdit ? "Editar Pesquisa" : "Criar Pesquisa"}
              </h1>
              <p className="text-sm text-gray-200 mt-1">
                {isEdit
                  ? "Atualize os campos abaixo para editar a pesquisa."
                  : "Preencha os campos abaixo para iniciar uma nova pesquisa."}
              </p>
            </div>

            {isEdit && (
              <Button
                variant={form.status ? "warning" : "verde"}
                onClick={handleChangeStatus}
                className="active:scale-95 mt-2 sm:mt-0"
              >
                {form.status ? "Desativar Pesquisa" : "Ativar Pesquisa"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        <SectionToggle title="Informações Básicas" isChecked={showBasicInfo} onChange={setShowBasicInfo} />
        {showBasicInfo && (
          <div className="space-y-4">
            <FormField legend="Título" type="text" value={form.title} onChange={handleChange("title")} />
            <FormField legend="Descrição" type="textarea" value={form.description} onChange={handleChange("description")} />
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        <SectionToggle title="Período da Pesquisa" isChecked={showDates} onChange={setShowDates} />
        {showDates && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField legend="Data de Início" type="date" value={form.release_date || ""} onChange={handleChange("release_date")} />
            <FormField legend="Data de Fim" type="date" value={form.end_date || ""} onChange={handleChange("end_date")} />
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        <SectionToggle title="Localização" isChecked={showLocation} onChange={setShowLocation} />
        {showLocation && (
          <>
            <div className="p-4 rounded-lg space-y-4 bg-gray-50 border">
              <p className="text-sm text-gray-600">Defina manualmente ou pelo mapa interativo.</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField legend="Latitude" type="text" value={form.lat} onChange={handleChange("lat")} disabled />
                <FormField legend="Longitude" type="text" value={form.long} onChange={handleChange("long")} disabled />
              </div>
              <FormField legend="Localização (Título)" type="text" value={form.location_title} onChange={handleChange("location_title")} />
              <div className="flex flex-col items-center border-t pt-4 gap-2">
                <OfflineMapButton onLocationSelect={handleLocationSelect} />
                <p className="text-xs text-gray-500 text-center">
                  Para obter a localização automaticamente, clique em{" "}
                  <strong>“Abrir mapa”</strong>.
                </p>
              </div>
              <div className="flex justify-center">
                <MapPreview
                  key={`${form.lat}-${form.long}`}
                  lat={form.lat}
                  lng={form.long}
                  className="w-full h-48 sm:h-64 rounded-lg shadow-md"
                />
                </div>  
            </div>
          </>
        )}

        {isEdit && (
          <>
            <hr className="my-6 border-gray-200" />
            <Contributors researchId={form.id} allUsers={users} />
          </>
        )}
        <div className="flex justify-center pt-4 gap-6">
          <Button type="submit" variant="dark" className="text-lg py-3 active:scale-95" onClick={handleSubmit}>
            {isEdit ? "Salvar Alterações" : "Criar Pesquisa"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionToggle({ title, isChecked, onChange }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <Switch type="arrow" checked={isChecked} onChange={onChange} />
    </div>
  );
}
