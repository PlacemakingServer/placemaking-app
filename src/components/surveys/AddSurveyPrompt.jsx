import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import DropdownSelect from "@/components/ui/Multiselect/DropdownSelect";
import Switch from "@/components/ui/Switch"; 
import { set } from "zod";

export default function AddSurveyPrompt({ onContinue }) {
  const surveyOptions = [
    { value: "estatica", label: "Coleta Estática" },
    { value: "dinamica", label: "Coleta Dinâmica" },
    { value: "formulario", label: "Coleta de Entrevistas" },
  ];

  const [showSelect, setShowSelect] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const handleSubmit = () => {
    if (!selectedSurvey) return;
    setShowSelect(false);
    setSelectedSurvey(null);
    onContinue(selectedSurvey);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl space-y-8 shadow-md"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100 text-center sm:text-left">
          Deseja adicionar uma coleta para esta pesquisa?
        </h3>

        <Switch checked={showSelect} onChange={setShowSelect} />
      </div>

      <AnimatePresence>
        {showSelect && (
          <motion.div
            key="select-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row md:items-end gap-4 justify-center"
          >
            <div className="w-full md:w-2/3">
              <DropdownSelect
                label="Tipo de Coleta"
                options={surveyOptions}
                selected={selectedSurvey}
                onChange={setSelectedSurvey}
                placeholder="Selecione o tipo"
              />
            </div>

            <div className="w-full md:w-auto">
              <Button
                className="w-full md:w-fit px-6 py-2"
                variant="dark"
                onClick={handleSubmit}
                disabled={!selectedSurvey}
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
