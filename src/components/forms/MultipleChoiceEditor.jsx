// components/forms/MultipleChoiceEditor.jsx
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import Button from "@/components/ui/Button_og";
import FormField from "@/components/forms/FormField";
import { motion, AnimatePresence } from "framer-motion";

export default function MultipleChoiceEditor({ options = [], setOptions }) {
  const [draft, setDraft] = useState({ option_text: "", option_df_value: "" });

  const handleAdd = () => {
    if (!draft.option_text.trim() || !draft.option_df_value.trim()) return;
    setOptions((prev) => [...prev, draft]);
    setDraft({ option_text: "", option_df_value: "" });
  };

  const handleRemove = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 p-5 rounded-xl bg-gray-100"
    >
      <h4 className="text-base font-semibold text-gray-800">
        Opções da pergunta:
      </h4>

      {/* Campos de entrada */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-1/5">
          <FormField
            legend="Letra da opção"
            type="text"
            value={draft.option_text}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, option_text: e.target.value }))
            }
            placeholder="a."
          />
        </div>

        <div className="flex-1">
          <FormField
            legend="Valor da opção"
            type="text"
            value={draft.option_df_value}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, option_df_value: e.target.value }))
            }
            placeholder="Ex: Casa, Apartamento, etc."
          />
        </div>

        <div className="flex items-end">
          <Button
            variant="azul_escuro"
            onClick={handleAdd}
            className="flex items-center gap-2 h-[42px]"
          >
            <Plus size={18} /> Adicionar
          </Button>
        </div>
      </div>

      {/* Lista de opções adicionadas */}
      <div className="space-y-2">
        <AnimatePresence>
          {options.map((opt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between bg-white border rounded-lg p-3 shadow-sm"
            >
              <div className="text-sm text-gray-700 font-medium">
                <span className="text-gray-500 mr-1">{opt.option_text}</span>
                {opt.option_df_value}
              </div>
              <button
                onClick={() => handleRemove(idx)}
                className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
              >
                <Trash2 size={16} /> Remover
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
