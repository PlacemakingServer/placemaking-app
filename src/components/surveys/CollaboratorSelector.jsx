import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Switch from "@/components/ui/Switch";
import MultiSelect from "@/components/ui/Multiselect/Multiselect";
import UserCardCompact from "@/components/ui/UserCardCompact";
import { HelpCircle } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function CollaboratorSelector({
  form,
  setForm,
  isEdit,
  availableCollaborators = [],
}) {
  const [useAllFromResearch, setUseAllFromResearch] = useState(true);

  const refreshCollaboratorsDiff = (newSelected) => {
    const original = form.originalCollaborators || [];

    const originalIds = new Set(original.map((c) => c.value));
    const newIds = new Set(newSelected.map((c) => c.value));

    const toAdd = newSelected.filter((c) => !originalIds.has(c.value));
    const toRemove = original.filter((c) => !newIds.has(c.value));

    setForm((prev) => ({
      ...prev,
      selectedCollaborators: newSelected,
      collaboratorsToAdd: toAdd,
      collaboratorsToRemove: toRemove,
    }));
  };

  const handleSelectChange = (newSelected) => {
    if (!isEdit) {
      setForm((prev) => ({
        ...prev,
        selectedCollaborators: newSelected,
      }));
    } else {
      refreshCollaboratorsDiff(newSelected);
    }
  };

  const handleRemoveAdd = (user) => {
    const newSelected = form.selectedCollaborators.filter(
      (u) => u.value !== user.value
    );
    refreshCollaboratorsDiff(newSelected);
  };

  const handleUndoRemove = (user) => {
    const newSelected = [...form.selectedCollaborators, user];
    refreshCollaboratorsDiff(newSelected);
  };

  const handleToggleAll = (checked) => {
    setUseAllFromResearch(checked);
    if (checked) {
      setForm((prev) => ({
        ...prev,
        selectedCollaborators: [],
        collaboratorsToAdd: [],
        collaboratorsToRemove: [],
        use_all_contributors: true,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        use_all_contributors: false,
      }));
    }
  };

  return (
    <div className="rounded-lg space-y-4">
      <div className="flex items-center justify-between bg-transparent px-4 py-3 transition-all">
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
                    Defina manualmente os colaboradores ou use todos os que já fazem parte da pesquisa.
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <p className="text-sm text-gray-600 leading-snug">
            Escolha entre todos os da pesquisa ou selecione individualmente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={useAllFromResearch}
            onChange={handleToggleAll}
            type="checkbox"
          />
          <span className="text-sm text-gray-700 whitespace-nowrap">Todos da Pesquisa</span>
        </div>
      </div>

      <AnimatePresence>
        {!useAllFromResearch && (
          <motion.div
            key="manual-collaborator-select"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 bg-transparent px-4 py-5"
          >
            <MultiSelect
              options={availableCollaborators}
              value={form.selectedCollaborators || []}
              onChange={handleSelectChange}
              placeholder="Selecione colaboradores"
            />
            <p className="text-xs text-gray-500">
              Você pode escolher múltiplos colaboradores para essa coleta.
            </p>

            {isEdit && form.collaboratorsToAdd?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Colaboradores que serão adicionados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {form.collaboratorsToAdd.map((usr) => (
                    <UserCardCompact
                      key={usr.value}
                      user={{
                        id: usr.value,
                        name: usr.label,
                        role: usr.role,
                        status: usr.status,
                        email: usr.email,
                      }}
                      borderColor="border-green-500"
                      showRemoveButton={true}
                      onRemove={() => handleRemoveAdd(usr)}
                    />
                  ))}
                </div>
              </div>
            )}

            {isEdit && form.collaboratorsToRemove?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Colaboradores que serão removidos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {form.collaboratorsToRemove.map((user) => (
                    <UserCardCompact
                      key={user.value}
                      user={{
                        id: user.value,
                        name: user.label,
                        role: user.role,
                        status: user.status,
                        email: user.email,
                      }}
                      borderColor="border-red-500"
                      showRemoveButton={true}
                      onRemove={() => handleUndoRemove(user)}
                    />
                  ))}
                </div>
              </div>
            )}

            {form.selectedCollaborators?.length > 0 && (
              <div className="mt-6 border-t pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Colaboradores Selecionados (Estado Final)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[14rem] overflow-y-auto">
                  {form.selectedCollaborators.map((user) => (
                    <UserCardCompact
                      key={user.value}
                      user={{
                        id: user.id,
                        name: user.label,
                        role: user.role,
                        status: user.status,
                        email: user.email,
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
