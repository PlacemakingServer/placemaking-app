import { useState, useEffect, useRef } from "react";
import FormField from "@/components/forms/FormField";
import Switch from "@/components/ui/Switch";
import Button from "@/components/ui/Button";
import FormBuilder from "@/components/forms/FormBuilder";

/**
 * FormCollectionSection
 * Seção de coleta via formulário, usada para criar ou editar.
 * Props:
 * - initialData: dados iniciais da coleta (opcional)
 * - onSubmit: função chamada ao salvar
 * - isEdit: booleano que define se está em modo de edição
 * - activity_type_id: id do tipo de atividade (exibido)
 * - research_id: id da pesquisa (exibido)
 */
export default function CollectionFormSection({
  initialData = {},
  onSubmit,
  isEdit = false,
  activity_type_id,
  research_id,
}) {
  const [enabled, setEnabled] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    activity_time: "",
    link: "",
    ...initialData,
  });
  const [formStructure, setFormStructure] = useState([]);

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

  const handleSave = () => {
    const payload = {
      ...form,
      activity_type_id,
      research_id,
      type: "form",
      structure: formStructure, // estrutura criada no FormBuilder
    };
    onSubmit?.(payload);
  };

  return (
    <div className="border rounded-xl p-6 bg-white shadow max-w-4xl mx-auto w-full space-y-6">
      {/* Cabeçalho com switch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Coleta Formulário" : "Nova Coleta - Formulário"}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ativar coleta</span>
          <Switch checked={enabled} onChange={setEnabled} />
        </div>
      </div>

      {/* Informações fixas */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>
          <strong>ID da Pesquisa:</strong> {research_id || "—"}
        </p>
        <p>
          <strong>ID do Tipo de Coleta:</strong> {activity_type_id || "—"}
        </p>
      </div>

      {/* Formulário */}
      {enabled && (
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

          <div className="max-w-[14rem]">
            <FormField
              legend="Tempo estimado (minutos)"
              type="number"
              value={form.activity_time}
              onChange={handleChange("activity_time")}
              helperText="Opcional"
            />
          </div>

          {enabled && (
            <div className="pt-4 flex justify-center">
              <Button variant="verde" onClick={handleSave}>
                {isEdit ? "Salvar Alterações" : "Criar Coleta"}
              </Button>
            </div>
          )}
        </div>
      )}

      {enabled && (
        <div className="pt-6">
          <FormBuilder
            initialStructure={formStructure}
            onChange={(updated) => setFormStructure(updated)}
          />
        </div>
      )}
    </div>
  );
}
