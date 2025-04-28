"use client";

import { useResearchContributors } from "@/hooks/useResearchContributors";
import MultiSelect from "@/components/ui/Multiselect/Multiselect";
import UserCardCompact from "@/components/ui/UserCardCompact";
import Switch from "@/components/ui/Switch";
import { useState, useMemo } from "react";

export default function Contributors({ researchId, allUsers = [] }) {
  const {
    contributors,
    addResearchContributor,
    removeResearchContributor,
    loading: loadingContributors,
  } = useResearchContributors(researchId);

  const [showCollaborators, setShowCollaborators] = useState(false);

  const selected = useMemo(() => {
    return contributors.map((c) => ({
      value: c.user_id,
      label: allUsers.find((u) => u.value === c.user_id)?.label || "Usuário",
    }));
  }, [contributors, allUsers]);

  const handleSelectChange = async (newSelected) => {
    const newIds = new Set(newSelected.map((u) => u.value));
    const currentIds = new Set(contributors.map((c) => c.user_id));

    const toAdd = [...newIds].filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !newIds.has(id));

    await Promise.all([
      ...toAdd.map((userId) =>
        addResearchContributor({
          id: "",
          research_id: researchId,
          user_id: userId,
          instruction: "Pesquisador",
        })
      ),
      ...toRemove.map((userId) => {
        const contributor = contributors.find((c) => c.user_id === userId);
        if (contributor) {
          return removeResearchContributor({
            research_id: contributor.research_id,
            user_id: contributor.user_id,
            contributor_id: contributor.id,
          });
        }
      }),
    ]);
  };

  const handleRemove = async (userId) => {
    const contributor = contributors.find((c) => c.user_id === userId);
    console.log("contributor", contributor);
    if (contributor) {
      await removeResearchContributor({
        research_id: contributor.research_id,
        user_id: contributor.user_id,
        contributor_id: contributor.id,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Colaboradores</h2>
        <Switch
          type="arrow"
          checked={showCollaborators}
          onChange={setShowCollaborators}
        />
      </div>

      {showCollaborators && (
        <>
          <MultiSelect
            options={allUsers}
            value={selected}
            onChange={handleSelectChange}
            placeholder="Selecione colaboradores"
            isLoading={loadingContributors}
          />
          <p className="text-xs text-gray-500">
            Você pode escolher múltiplos colaboradores para participar.
          </p>

          <div className="mt-6 border-t pt-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Colaboradores Atuais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[14rem] overflow-y-auto">
              {contributors.map((contributor) => {
                const user = allUsers.find(
                  (u) => u.value === contributor.user_id
                );
                return (
                  <UserCardCompact
                    key={`${contributor.research_id}-${contributor.user_id}`}
                    user={{
                      id: user?.value || "",
                      name: user?.label || "Usuário",
                      email: user?.email || "",
                      role: user?.role || "",
                      status: user?.status || "",
                    }}
                    showRemoveButton={true}
                    borderColor="border-blue-500"
                    onRemove={() => handleRemove(contributor.user_id)}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
