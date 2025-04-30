// src/hooks/useSurveyContributors.ts
import { useEffect, useState } from "react";
import { SurveyContributor } from "@/lib/types/indexeddb";
import {
  createSurveyContributor as createRemoteSurveyContributor,
  deleteSurveyContributor as deleteRemoteSurveyContributor,
  getSurveyContributors as getRemoteSurveyContributors,
} from "@/repositories/server/surveyContributorApi";
import {
  createItem as createLocalContributor,
  deleteItem as deleteLocalContributor,
  getAllItems as getAllLocalContributors,
} from "@/repositories/indexeddb/indexedDBService";
import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export function useSurveyContributors(survey_id: string) {
  const [contributors, setContributors] = useState<SurveyContributor[]>([]);
  const [unSyncedContributors, setUnSyncedContributors] = useState<SurveyContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!survey_id) return;
    fetchUnsyncedContributors();
    fetchContributors();
  }, [survey_id]);

  const fetchUnsyncedContributors = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const pending = unsynced
        .filter((item) => item.store === "survey_contributors")
        .map((item) => item.payload as SurveyContributor)
        .filter((c) => c.survey_id === survey_id);

      setUnSyncedContributors(pending);
    } catch (err) {
      console.error("[App] Erro ao carregar colaboradores pendentes:", err);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchContributors = async () => {
    setLoading(true);
    try {
      const remote = await getRemoteSurveyContributors(survey_id);
      setContributors(remote);
      await Promise.allSettled(remote.map((c) => createLocalContributor("survey_contributors", c)));
    } catch (err) {
      console.warn("[App] Erro remoto. Buscando local:", err);
      try {
        const local = await getAllLocalContributors("survey_contributors");
        const filtered = local.filter((c) => c.survey_id === survey_id);
        setContributors(filtered);
      } catch (errLocal) {
        console.error("[App] Erro local:", errLocal);
        setError("Erro ao carregar colaboradores locais");
      }
    } finally {
      setLoading(false);
    }
  };

  const addSurveyContributor = async (contributor: SurveyContributor): Promise<SurveyContributor> => {
    try {
      const created = await createRemoteSurveyContributor(contributor);
      await createLocalContributor("survey_contributors", created);
      setContributors((prev) =>
        prev.some((c) => c.user_id === created.user_id)
          ? prev
          : [...prev, created]
      );
      return created;
    } catch (error) {
      const fallback = { ...contributor, id: uuidv4() };
      console.error("[App] Erro ao criar colaborador:", error);
      await saveUnsyncedItem("survey_contributors", fallback);
      setUnSyncedContributors((prev) => [...prev, fallback]);
      return fallback;
    }
  };

  const removeSurveyContributor = async (params: { survey_id: string; contributor_id: string }) => {
    const { survey_id, contributor_id } = params;
    setContributors((prev) => prev.filter((c) => c.user_id !== contributor_id));

    try {
      await deleteRemoteSurveyContributor(survey_id, contributor_id);
    } catch (error) {
      console.error("[App] Erro ao deletar remotamente:", error);
      await saveUnsyncedItem("survey_contributors", { survey_id, contributor_id, delete: true } as any);
      setUnSyncedContributors((prev) => [...prev, { survey_id, contributor_id, delete: true } as any]);
    }

    try {
      await deleteLocalContributor("survey_contributors", contributor_id);
    } catch (error) {
      console.warn("[App] Falha ao deletar localmente:", error);
    }
  };

  return {
    contributors,
    unSyncedContributors,
    loading: loading || loadingUnsynced,
    error,
    addSurveyContributor,
    removeSurveyContributor,
  };
}
