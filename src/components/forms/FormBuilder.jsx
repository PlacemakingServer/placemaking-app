import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/forms/FormField";
import { motion, AnimatePresence } from "framer-motion";
import MultiSelect from "@/components/ui/Multiselect/Multiselect";
import SelectedFormFields from "@/components/forms/SelectedFormFields";
import MultipleChoiceEditor from "@/components/forms/MultipleChoiceEditor";

export default function FormBuilder({ onSubmit, activity_id }) {
  const [inputTypes, setInputTypes] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [newOptions, setNewOptions] = useState([]); // opções da múltipla escolha
  const [optionDraft, setOptionDraft] = useState({
    option_text: "",
    option_df_value: "",
  });

  // Index do item em edição (ou null se for um novo)
  const [editingIndex, setEditingIndex] = useState(null);

  // newQuestion: texto da pergunta e inputType selecionado
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    inputType: null,
  });

  // Carrega inputTypes (API fake)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/input_types");
        const data = await res.json();
        setInputTypes(data.input_types || []);
      } catch (err) {
        console.error("Erro ao buscar input types:", err);
      }
    })();
  }, []);

  // Quando clica em “Salvar” ou “Adicionar Pergunta”
  const handleSaveQuestion = () => {
    if (!newQuestion.title || !newQuestion.inputType) return;
    
    // Cria objeto do field
    const newField = {
      id: crypto.randomUUID(),
      title: newQuestion.title,
      input_type: newQuestion.inputType.value,
      input_type_name: newQuestion.inputType.label,
      activity_id: activity_id,
      options: newOptions,
    };

    if (editingIndex === null) {
      // Se não estamos editando, adicionamos
      setFormFields((prev) => [...prev, newField]);
    } else {
      // Se estamos editando, atualizamos o item no array
      const updated = [...formFields];
      newField.id = updated[editingIndex].id; // preserva ID
      updated[editingIndex] = newField;
      setFormFields(updated);
    }

    // Limpa campos e sai do modo edição
    setNewQuestion({ title: "", inputType: null });
    setEditingIndex(null);
  };

  // Remover pergunta
  const handleRemoveQuestion = (index) => {
    const updated = [...formFields];
    updated.splice(index, 1);
    setFormFields(updated);

    // Se eu estava editando o item removido, reset
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewQuestion({ title: "", inputType: null });
    }
  };

  // Editar pergunta
  const handleEditQuestion = (index) => {
    const item = formFields[index];
    if (!item) return;

    setEditingIndex(index);
    setNewQuestion({
      title: item.title,
      inputType: {
        value: item.input_type,
        label: item.input_type_name,
      },
    });
  };

  // Salvar estrutura final no submit
  const handleSaveForm = () => {
    const payload = {
      activity_id: activity_id,
      fields: formFields, // todas as perguntas adicionadas
    };
  
    console.log("📦 Estrutura final do formulário:", payload);
    
    // onSubmit?.(formFields);
  };
  

  return (
    <div className="space-y-8 max-w-4xl mx-auto mt-10 p-6 rounded-xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Construa o Formulário
        </h2>
        <p className="text-sm text-gray-600">
          Adicione perguntas e selecione os tipos de resposta.
        </p>
      </div>

      {/* Form de Nova Pergunta ou Edição */}
      <div className="bg-gray-100 p-5 rounded-lg border space-y-4">
        <h3 className="text-md font-semibold text-gray-700">
          {editingIndex === null ? "Adicionar Pergunta" : "Editar Pergunta"}
        </h3>

        {/* Campo de texto da pergunta */}
        <FormField
          legend="Enunciado da Pergunta"
          type="text"
          value={newQuestion.title}
          onChange={(e) =>
            setNewQuestion((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        {/* Tipo de resposta */}
        {/* Tipo de resposta */}
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
          />
        </div>

        {newQuestion.inputType?.stored_as === "array" && (
          <MultipleChoiceEditor
            options={newOptions}
            setOptions={setNewOptions}
          />
        )}

        {/* Botão de ação */}
        <div className="flex justify-center">
          <Button variant="verde" onClick={handleSaveQuestion}>
            {editingIndex === null ? "Criar Pergunta" : "Salvar Edição"}
          </Button>
        </div>
      </div>

      {/* Lista de perguntas */}
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

      {/* Botão final */}
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
  );
}
