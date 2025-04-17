import { useState, useEffect, useRef } from "react";
import Switch from "@/components/ui/Switch";
import FormField from "@/components/forms/FormField";
import Button from "@/components/ui/Button_og";

/**
 * StaticCollectionSection
 * Usado para criação ou edição de coleta via arquivos estáticos (PDFs, Imagens etc).
 *
 * Props:
 *  - initialData: dados iniciais da coleta (se for edição)
 *  - onSubmit: função chamada ao enviar
 *  - isEdit: booleano para distinguir entre criação e edição
 */
export default function StaticCollectionSection({
  initialData = {},
  onSubmit,
  isEdit = false,
}) {
  const [enabled, setEnabled] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    ...initialData,
  });

  const initialDataRef = useRef(JSON.stringify(initialData));

  useEffect(() => {
    if (!isEdit) return;

    const newInitial = JSON.stringify(initialData);

    if (initialDataRef.current !== newInitial) {
      initialDataRef.current = newInitial;
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData, isEdit]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    const payload = {
      title: form.title,
      description: form.description,
      fileUrl: form.fileUrl,
      type: "static",
    };
    onSubmit?.(payload);
  };

  return (
    <div className="border rounded-xl p-6 bg-white shadow max-w-4xl mx-auto w-full space-y-6">
      {/* Header com toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Editar Coleta Estática" : "Nova Coleta Estática"}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ativar coleta</span>
          <Switch checked={enabled} onChange={setEnabled} />
        </div>
      </div>

      {enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            legend="Título do Arquivo"
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

          <FormField
            className="md:col-span-2"
            legend="Link para Download ou Visualização"
            type="text"
            value={form.fileUrl}
            onChange={handleChange("fileUrl")}
            placeholder="https://..."
          />
        </div>
      )}

      {enabled && (
        <div className="pt-4 flex justify-end">
          <Button variant="secondary" onClick={handleSubmit}>
            {isEdit ? "Salvar Alterações" : "Adicionar Coleta Estática"}
          </Button>
        </div>
      )}
    </div>
  );
}
