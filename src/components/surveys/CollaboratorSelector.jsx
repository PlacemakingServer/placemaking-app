import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Switch from "@/components/ui/Switch";
import MultiSelect from "@/components/ui/Multiselect/Multiselect";
import UserCardCompact from "@/components/ui/UserCardCompact";
import { HelpCircle } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useSurveyContributors } from "@/hooks/useSurveyContributors";

export default function CollaboratorSelector({
  availableCollaborators = [],
  survey_id,
  survey_type,
}) {
  if (!Array.isArray(availableCollaborators) || !survey_id || !survey_type) return null;

  const {
    contributors,
    addSurveyContributor,
    removeSurveyContributor,
    loading,
  } = useSurveyContributors(survey_id);

  // Inicializa como true apenas se não houver colaboradores
  const [useAllFromResearch, setUseAllFromResearch] = useState(() => contributors.length === 0);
  const [processingIds, setProcessingIds] = useState(new Set());

  // Atualiza o estado inicial do switch se surgirem colaboradores
  useEffect(() => {
    if (contributors.length > 0 && useAllFromResearch) {
      setUseAllFromResearch(false);
    }
  }, [contributors]);

  const selectedCollaborators = useMemo(() => {
    return contributors.map((c) => {
      const user = availableCollaborators.find((u) => u.value === c.user_id);
      return {
        value: c.user_id,
        label: user?.label || c.user_id,
        email: user?.email || "—",
        role: user?.role || "—",
        status: user?.status || "—",
      };
    });
  }, [contributors, availableCollaborators]);

  const handleToggleAll = async (checked) => {
    if (checked && contributors.length > 0) {
      const idsToRemove = contributors.map((c) => c.user_id);
      setProcessingIds(new Set(idsToRemove));
      await Promise.all(
        idsToRemove.map((id) =>
          removeSurveyContributor({ survey_id, contributor_id: id })
        )
      );
      setProcessingIds(new Set());
    }
    setUseAllFromResearch(checked);
  };

  const handleSelectChange = async (newSelected) => {
    const newIds = new Set(newSelected.map((c) => c.value));
    const currentIds = new Set(contributors.map((c) => c.user_id));

    const toAdd = [...newIds].filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !newIds.has(id));

    setProcessingIds(new Set([...toAdd, ...toRemove]));

    await Promise.all([
      ...toAdd.map((userId) =>
        addSurveyContributor({
          user_id: userId,
          survey_id,
          survey_type,
          instruction: "Pesquisador",
        })
      ),
      ...toRemove.map((userId) =>
        removeSurveyContributor({ survey_id, contributor_id: userId })
      ),
    ]);

    setProcessingIds(new Set());
  };

  const handleRemove = async (userId) => {
    if (processingIds.has(userId)) return;
    setProcessingIds((prev) => new Set(prev).add(userId));
    await removeSurveyContributor({ survey_id, contributor_id: userId });
    setProcessingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
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
                    <HelpCircle
                      className="text-gray-400 hover:text-gray-600 transition"
                      size={16}
                    />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    className="z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-md shadow-lg max-w-xs"
                    sideOffset={6}
                  >
                    Defina manualmente os colaboradores ou use todos os que já
                    fazem parte da pesquisa.
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
          <Switch
            checked={useAllFromResearch}
            onChange={handleToggleAll}
            type="checkbox"
            disabled={processingIds.size > 0}
          />
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
              closeMenuOnSelect
            />

            {loading && (
              <p className="text-sm text-gray-500">Carregando colaboradores...</p>
            )}

            {selectedCollaborators.length > 0 && (
              <div className="mt-6 border-t pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Colaboradores Selecionados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[14rem] overflow-y-auto">
                  {selectedCollaborators.map((user) => (
                    <UserCardCompact
                      key={`${survey_id}-${user.value}`}
                      user={{
                        id: user.value,
                        name: user.label,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                      }}
                      showRemoveButton
                      borderColor="border-blue-500"
                      onRemove={() => handleRemove(user.value)}
                      disabled={processingIds.has(user.value)}
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