import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Switch from "@/components/ui/Switch";
import MultiSelect from "@/components/ui/Multiselect/Multiselect";
import UserCardCompact from "@/components/ui/UserCardCompact";
import { HelpCircle } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useSurveyContributors } from "@/hooks/useSurveyContributors";

export default function CollaboratorSelector({
  availableCollaborators = [],
  survey_id
}) {
  const {
    contributors,
    addSurveyContributor,
    removeSurveyContributor,
    loading,
  } = useSurveyContributors(survey_id);

  const [useAllFromResearch, setUseAllFromResearch] = useState(true);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  useEffect(() => {

    const transformed = contributors.map((c) => ({
      value: c.contributor_id,
      label: c.name,
      email: c.email,
      role: c.role,
      status: c.status,
    }));
    setSelectedCollaborators(transformed);
  }, [contributors]);

  const handleToggleAll = (checked) => {
    setUseAllFromResearch(checked);
    if (!checked) {
      setSelectedCollaborators([]);
    }
  };

  useEffect(() => {
    console.log("availableCollaborators", availableCollaborators);
  }, [availableCollaborators]);

  const handleSelectChange = async (newSelected) => {
    const newIds = new Set(newSelected.map((c) => c.value));
    const oldIds = new Set(selectedCollaborators.map((c) => c.value));

    const toAdd = newSelected.filter((c) => !oldIds.has(c.value));
    const toRemove = selectedCollaborators.filter((c) => !newIds.has(c.value));

    for (const user of toAdd) {
      await addSurveyContributor({
        contributor_id: user.value,
        survey_id,
      });
    }

    for (const user of toRemove) {
      await removeSurveyContributor({
        survey_id,
        contributor_id: user.value,
      });
    }

    setSelectedCollaborators(newSelected);
  };

  return (
    <div className="rounded-lg space-y-4">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Colaboradores da Coleta
            </h2>
            <Tooltip.Provider delayDuration={100}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button>
                    <HelpCircle size={16} className="text-gray-400 hover:text-gray-600 transition" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    className="z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-md shadow-lg max-w-xs"
                    sideOffset={6}
                  >
                    Defina manualmente os colaboradores ou use todos os que já fazem parte da pesquisa.
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <p className="text-sm text-gray-600 leading-snug">
            Escolha entre todos da pesquisa ou selecione manualmente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 whitespace-nowrap">Todos da Pesquisa</span>
          <Switch checked={useAllFromResearch} onChange={handleToggleAll} type="checkbox" />
        </div>
      </div>

      <AnimatePresence>
        {!useAllFromResearch && (
          <motion.div
            key="manual-selection"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 px-4 py-5"
          >
            <MultiSelect
              options={availableCollaborators}
              value={selectedCollaborators}
              onChange={handleSelectChange}
              placeholder="Selecione colaboradores"
            />

            {loading && <p className="text-sm text-gray-500">Carregando colaboradores...</p>}

            {selectedCollaborators.length > 0 && (
              <div className="mt-6 border-t pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Colaboradores Selecionados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[14rem] overflow-y-auto">
                  {selectedCollaborators.map((user) => (
                    <UserCardCompact
                      key={user.value}
                      user={{
                        id: user.value,
                        name: user.label,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
