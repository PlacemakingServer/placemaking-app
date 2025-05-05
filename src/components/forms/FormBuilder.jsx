import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/forms/FormField";
import { motion, AnimatePresence } from "framer-motion";
import MultiSelect from "@/components/ui/Multiselect/Multiselect";
import SelectedFormFields from "@/components/forms/SelectedFormFields";
import MultipleChoiceEditor from "@/components/forms/MultipleChoiceEditor";
import Switch from "@/components/ui/Switch";
import { useInputTypes } from "@/hooks/useInputTypes";
import { useFields } from "@/hooks/useFields";

export default function FormBuilder({ survey_id, survey_type, onSubmit }) {
  const { types: inputTypes, loading } = useInputTypes();
  const {
    fields,
    addField,
    updateField,
    deleteField,
  } = useFields(survey_id, survey_type);

  const [formFields, setFormFields] = useState([]);
  const [newOptions, setNewOptions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    inputType: null,
  });

  useEffect(() => {
    const enriched = fields.map((field) => {
      const inputType = inputTypes.find((t) => t.id === field.input_type_id);
      return inputType
        ? { ...field, input_type_name: inputType.name, stored_as: inputType.stored_as }
        : field;
    });
    setFormFields(enriched);
  }, [fields, inputTypes]);

  const handleCreateOption = async (payload) => {
    try {
      const params = new URLSearchParams(payload);
      const res = await fetch(`/api/field_options/create?${params.toString()}`, { method: "POST" });
      if (!res.ok) throw new Error("Erro ao criar opção");
      return await res.json();
    } catch (err) {
      console.error("Erro ao criar opção:", err);
    }
  };

  const handleSaveQuestion = async () => {
    if (!newQuestion.title || !newQuestion.inputType) return;

    const fieldPayload = {
      title: newQuestion.title,
      description: newQuestion.title,
      input_type_id: newQuestion.inputType.value,
      input_type: newQuestion.inputType.value,
      survey_id,
    };

    // console.log("fieldPayload", fieldPayload);

    try {
      if (editingIndex === null) {
        const created = await addField(fieldPayload);

        if (newQuestion.inputType.stored_as === "array") {
          const createdOptions = await Promise.all(
            newOptions.map((opt) =>
              handleCreateOption({
                field_id: created.id,
                option_text: "-",
                option_value: opt.option_df_value,
              })
            )
          );
          created.options = createdOptions;
        }

        setFormFields((prev) => [...prev, created]);
      } else {
        const updated = {
          ...formFields[editingIndex],
          ...fieldPayload,
          input_type_id: newQuestion.inputType?.value ?? formFields[editingIndex].input_type_id,
        };
        
        console.log("updated----", updated);
        await updateField(updated.id, updated);
        
        const clone = [...formFields];
        clone[editingIndex] = updated;
        setFormFields(clone);
      }

      setNewQuestion({ title: "", inputType: null });
      setNewOptions([]);
      setEditingIndex(null);
    } catch (err) {
      console.error("Erro ao salvar a pergunta:", err);
    }
  };

  const handleRemoveQuestion = async (index) => {
    const toDelete = formFields[index];
    await deleteField(toDelete.id);
    const updated = [...formFields];
    updated.splice(index, 1);
    setFormFields(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewQuestion({ title: "", inputType: null });
    }
  };

  const handleEditQuestion = (index) => {
    const item = formFields[index];
    if (!item) return;
  
    const foundInputType = inputTypes.find((t) => t.id === item.input_type_id);
  
    setEditingIndex(index);
    setNewQuestion({
      title: item.title,
      inputType: foundInputType
        ? {
            value: foundInputType.id,
            label: foundInputType.name,
            stored_as: foundInputType.stored_as,
          }
        : {
            value: item.input_type_id,
            label: item.input_type_name,
            stored_as: item.stored_as,
          },
    });
    setNewOptions(item.options || []);
  };
  

  const handleSaveForm = () => {
    const payload = {
      survey_id,
      fields: formFields,
    };
    if (onSubmit) onSubmit(payload);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Formulário</h2>
          <p className="text-sm text-gray-600">
            Adicione perguntas e selecione os tipos de resposta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showFormBuilder} onChange={setShowFormBuilder} type="arrow" />
        </div>
      </div>

      {showFormBuilder && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-5 rounded-lg border space-y-4">
            <h3 className="text-md font-semibold text-gray-700">
              {editingIndex === null ? "Adicionar Pergunta" : "Editar Pergunta"}
            </h3>

            <FormField
              legend="Enunciado da Pergunta"
              type="text"
              value={newQuestion.title}
              onChange={(e) =>
                setNewQuestion((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Resposta
              </label>
              <MultiSelect
                options={inputTypes.map((t) => ({
                  value: t.id,
                  label: t.name,
                  stored_as: t.stored_as,
                }))}
                value={newQuestion.inputType}
                onChange={(selected) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    inputType: selected || null,
                  }))
                }
                placeholder="Selecione o tipo de resposta"
                isMulti={false}
                closeMenuOnSelect={true}
                isDisabled={loading}
              />
            </div>

            {newQuestion.inputType?.stored_as === "array" && (
              <MultipleChoiceEditor options={newOptions} setOptions={setNewOptions} />
            )}

            <div className="flex justify-center">
              <Button variant="verde" onClick={handleSaveQuestion}>
                {editingIndex === null ? "Criar Pergunta" : "Salvar Edição"}
              </Button>
            </div>
          </div>

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
                  setFields={setFormFields}
                  onEditQuestion={handleEditQuestion}
                  onRemoveQuestion={handleRemoveQuestion}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center pt-4 pb-2">
            <Button
              variant="secondary"
              onClick={handleSaveForm}
              className="text-base px-6 py-2"
            >
              Salvar Estrutura do Formulário
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
