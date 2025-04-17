import { useState, useEffect, useRef } from "react";
import FormField from "@/components/forms/FormField";
import Button from "@/components/ui/Button_og";
import Switch from "@/components/ui/Switch";

/**
 * DynamicCollectionSection
 * Componente reutilizável para criar ou editar uma coleta dinâmica.
 * Props:
 * - initialData: dados iniciais da coleta (em edição)
 * - onSubmit: função chamada ao salvar
 * - isEdit: booleano, se é modo de edição
 */
export default function DynamicCollectionSection({
  initialData = {},
  onSubmit,
  isEdit = false,
}) {
  const [enabled, setEnabled] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    logic_enabled: false,
    conditions: "",
    ...initialData,
  });

  const initialDataRef = useRef(JSON.stringify(initialData));

  useEffect(() => {
    if (!isEdit) return;

    const newInitial = JSON.stringify(initialData);

    // Só atualiza se o conteúdo for diferente
    if (initialDataRef.current !== newInitial) {
      initialDataRef.current = newInitial;
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData, isEdit]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      type: "dynamic",
    };
    onSubmit?.(payload);
  };

  const handleDiscard = () => {
    setForm({ ...initialData });
  };

  return (
    <div className="border rounded-xl p-6 bg-white shadow max-w-4xl mx-auto w-full space-y-6">
      {/* Header com toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Editar Coleta Dinâmica" : "Nova Coleta Dinâmica"}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ativar coleta</span>
          <Switch checked={enabled} onChange={setEnabled} />
        </div>
      </div>

      {enabled && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              legend="Título da Coleta"
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              placeholder="Ex: Preferências de transporte"
            />

            <FormField
              legend="Descrição"
              type="text"
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Explique o objetivo da coleta dinâmica"
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium text-gray-700">
              Habilitar lógica condicional
            </span>
            <Switch
              checked={form.logic_enabled}
              onChange={(checked) =>
                setForm((prev) => ({ ...prev, logic_enabled: checked }))
              }
            />
          </div>

          {form.logic_enabled && (
            <FormField
              legend="Condições Lógicas"
              type="text"
              value={form.conditions}
              onChange={handleChange("conditions")}
              placeholder="Ex: mostrar campo X se idade > 18"
            />
          )}

          <div className="flex justify-end gap-4 pt-6">
            {isEdit && (
              <Button
                variant="transparent_vermelho"
                onClick={handleDiscard}
                className="active:scale-95"
              >
                Descartar Alterações
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleSubmit}
              className="active:scale-95"
            >
              {isEdit ? "Salvar Coleta" : "Criar Coleta"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
