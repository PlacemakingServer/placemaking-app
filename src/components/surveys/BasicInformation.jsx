import React from "react";
import FormField from "@/components/forms/FormField";
import Switch from "@/components/ui/Switch";
import { Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";



export default function BasicInformation({
  form,
  setForm,
  showSurveyInformation,
  setShowSurveyInformation,
}) {
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="rounded-lg space-y-4">
      <div className="flex items-center justify-between px-4 py-3 bg-transparent">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Informações da Coleta
            </h2>
            <Tooltip.Provider delayDuration={100}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button>
                    <Info
                      size={16}
                      className="text-gray-400 hover:text-gray-600 transition"
                    />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    className="z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-md shadow-lg max-w-xs"
                    sideOffset={6}
                  >
                    Adicione um título e descrição para identificar esta coleta.
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <p className="text-sm text-gray-600 leading-snug">
            Informações como título e descrição para identificar essa coleta.
          </p>
        </div>
        <Switch
          checked={showSurveyInformation}
          onChange={setShowSurveyInformation}
          type="arrow"
        />
      </div>

      {showSurveyInformation && (
        <div className="bg-transparent px-4 py-5 mt-2 space-y-5">
          <div className="flex flex-col gap-4">
            <FormField
              legend="Título do Formulário"
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              placeholder="Ex: Coleta de Entrevistas - Praça Roosevelt"
            />
            <FormField
              legend="Descrição"
              type="textarea"
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Breve descrição sobre o objetivo da coleta..."
            />
          </div>

          <p className="text-xs text-gray-500 text-right">
            * Essas informações serão exibidas aos pesquisadores durante a coleta.
          </p>
        </div>
      )}
    </div>
  );
}
