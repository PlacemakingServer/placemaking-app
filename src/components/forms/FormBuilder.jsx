// FormBuilder.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/forms/FormField";
import { motion, AnimatePresence } from "framer-motion";
import MultiSelect from "@/components/ui/Multiselect/Multiselect";
import SelectedFormFields from "@/components/forms/SelectedFormFields";
import FieldOptionEditor from "@/components/forms/FieldOptionEditor";
import Switch from "@/components/ui/Switch";
import { useInputTypes } from "@/hooks/useInputTypes";
import { useFields } from "@/hooks/useFields";

/* Helpers ───────────────────────────────────────────── */
const emptyQuestion = () => ({ title: "", inputType: null });

const enrichWithTypes = (fields, types) =>
  fields
    .sort((a, b) => a.position - b.position)
    .map((f) => {
      const t = types.find((it) => it.id === f.input_type_id);
      return t ? { ...f, input_type_name: t.name, stored_as: t.stored_as } : f;
    });

const toSelectOption = (t) => ({
  value: t.id,
  label: t.name,
  stored_as: t.stored_as,
});

const makePayload = (q, survey_id, position) => ({
  title: q.title,
  description: q.title,
  input_type_id: q.inputType.value,
  input_type: q.inputType.value,
  position, // <- importante
  survey_id,
});

/* Component ─────────────────────────────────────────── */
export default function FormBuilder({ survey_id, survey_type, onSubmit }) {
  // Remotos
  const { types: inputTypes, loading: loadingTypes } = useInputTypes();
  const { fields, addField, updateField, deleteField } = useFields(
    survey_id,
    survey_type
  );

  const allowedInputTypeNames = [
    "Contador",
    "Texto",
    "Número Inteiro",
    "Data",
    "Múltipla Escolha",
  ];

  // Locais
  const [formFields, setFormFields] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [question, setQuestion] = useState(emptyQuestion());
  const [currentFieldId, setCurrentFieldId] = useState(null);

  // sincroniza lista
  const enriched = useMemo(
    () => enrichWithTypes(fields, inputTypes),
    [fields, inputTypes]
  );
  useEffect(() => setFormFields(enriched), [enriched]);

  /* util ---------------------------------------------------------- */
  const resetBuilder = () => {
    setQuestion(emptyQuestion());
    setEditingIndex(null);
    setCurrentFieldId(null);
  };

  /* CRUD field ---------------------------------------------------- */
  const handleSaveQuestion = useCallback(async () => {
    if (!question.title || !question.inputType) return;
    const position = fields.length;
    const payload = makePayload(question, survey_id, position);

    try {
      if (editingIndex === null) {
        const created = await addField(payload);
        setCurrentFieldId(created.id);
      } else {
        const target = formFields[editingIndex];
        const updated = { ...target, ...payload, position: target.position };
        await updateField(updated.id, updated);
        setCurrentFieldId(updated.id);
      }
      resetBuilder();
    } catch (err) {
      console.error("[FormBuilder] Falha ao salvar field:", err);
    }
  }, [question, editingIndex, formFields, survey_id]);

  const handleEditQuestion = (index) => {
    const f = formFields[index];
    if (!f) return;
    setEditingIndex(index);
    setCurrentFieldId(f.id);

    const t = inputTypes.find((it) => it.id === f.input_type_id);
    setQuestion({
      title: f.title,
      inputType: t ? toSelectOption(t) : toSelectOption(f),
    });
  };

  const handleRemoveQuestion = async (index) => {
    const f = formFields[index];
    if (!f) return;
    await deleteField(f.id);
    const rest = formFields.filter((_, i) => i !== index);
    await Promise.all(
      rest.map((fld, idx) => updateField(fld.id, { ...fld, position: idx }))
    );
    resetBuilder();
  };

  /* Reorder ------------------------------------------------------- */
  const handleReorder = async (newOrder) => {
    setFormFields(newOrder);

    await Promise.all(
      newOrder.map((f, idx) => {
        updateField(f.id, { ...f, position: idx });
      })
    );
  };

  /* UI ------------------------------------------------------------ */
  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 rounded-xl">
      <Header show={showBuilder} toggle={() => setShowBuilder((s) => !s)} />

      {showBuilder && (
        <div className="space-y-4">
          <QuestionCard
            question={question}
            setQuestion={setQuestion}
            inputTypes={inputTypes}
            loadingTypes={loadingTypes}
            onSave={handleSaveQuestion}
            isEditing={editingIndex !== null}
            fieldId={currentFieldId}
          />

          <AnimatePresence>
            {formFields.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <SelectedFormFields
                  fields={formFields}
                  onEditQuestion={handleEditQuestion}
                  onRemoveQuestion={handleRemoveQuestion}
                  onReorder={handleReorder} // <- novo callback
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* Header & QuestionCard ficam iguais (omitidos por brevidade) */

/* Sub‑componentes ─────────────────────────────────────────────── */
function Header({ show, toggle }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Formulário</h2>
        <p className="text-sm text-gray-600">
          Adicione perguntas e selecione os tipos de resposta.
        </p>
      </div>
      <Switch checked={show} onChange={toggle} type="arrow" />
    </div>
  );
}

function QuestionCard({
  question,
  setQuestion,
  inputTypes,
  loadingTypes,
  onSave,
  isEditing,
  fieldId,
}) {
  const allowedInputTypeNames = [
    "Contador",
    "Texto",
    "Número Inteiro",
    "Data",
    "Múltipla Escolha",
  ];
  return (
    <div className="bg-gray-100 p-5 rounded-lg border space-y-4">
      <h3 className="text-md font-semibold text-gray-700">
        {isEditing ? "Editar Pergunta" : "Adicionar Pergunta"}
      </h3>

      <FormField
        legend="Enunciado da Pergunta"
        type="text"
        value={question.title}
        onChange={(e) =>
          setQuestion((prev) => ({ ...prev, title: e.target.value }))
        }
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Resposta
        </label>
        <MultiSelect
          options={inputTypes
            .filter((t) => allowedInputTypeNames.includes(t.name))
            .map(toSelectOption)}
          value={question.inputType}
          onChange={(sel) =>
            setQuestion((prev) => ({ ...prev, inputType: sel || null }))
          }
          placeholder="Selecione o tipo de resposta"
          isMulti={false}
          closeMenuOnSelect
          isDisabled={loadingTypes}
        />
      </div>

      {question.inputType?.stored_as === "array" && fieldId && (
        <FieldOptionEditor fieldId={fieldId} />
      )}

      <div className="flex justify-center">
        <Button variant="verde" onClick={onSave}>
          {isEditing ? "Salvar Edição" : "Criar Pergunta"}
        </Button>
      </div>
    </div>
  );
}
