// src/hooks/useStaticSurveys.ts
import { useEffect, useState } from "react";
import { StaticSurvey } from "@/lib/types/indexeddb";
import {
  createStaticSurvey as createRemoteStaticSurvey,
  getStaticSurvey as getRemoteStaticSurvey,
  updateStaticSurvey as updateRemoteStaticSurvey,
  deleteStaticSurvey as deleteRemoteStaticSurvey,
} from "@/repositories/server/staticSurveyApi";

import {
  createStaticSurvey as createLocalStaticSurvey,
  getStaticSurvey as getLocalStaticSurvey,
  updateStaticSurvey as updateLocalStaticSurvey,
  deleteStaticSurvey as deleteLocalStaticSurvey,
} from "@/repositories/indexeddb/staticSurveyRepository";

import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

/**
 * Hook de gerenciamento de coletas Estáticas
 * – Mantém a mesma assinatura e fluxo de useFormSurveys
 */
export function useStaticSurveys(
  research_id?: string,
  especifico: boolean = true,
  survey_type: string = "Estática"
) {
  const [staticSurvey, setStaticSurvey] = useState<StaticSurvey | null>(null);
  const [unSyncedSurveys, setUnSyncedSurveys] = useState<StaticSurvey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ───────────── sync pendentes ───────────── */
  useEffect(() => {
    (async () => {
      try {
        const unsynced = await getUnsyncedItems();
        const pending = unsynced
          .filter((i) => i.store === "static_surveys")
          .map((i) => i.payload as StaticSurvey);
        setUnSyncedSurveys(pending);
      } catch (err) {
        console.error("[App] Erro ao carregar pendentes:", err);
      } finally {
        setLoadingUnsynced(false);
      }
    })();
  }, []);

  /* ───────────── busca principal ───────────── */
  useEffect(() => {
    if (especifico && research_id) {
      fetchSurveyByResearchAndType(research_id, survey_type);
    } else {
      setStaticSurvey(null);
      setLoadingSurveys(false);
    }
  }, [especifico, research_id, survey_type]);

  const fetchSurveyByResearchAndType = async (
    researchId: string,
    type: string
  ) => {
    setLoadingSurveys(true);
    try {
      const remote = await getRemoteStaticSurvey(researchId, type);
      // A API pode retornar array; normalizamos para 1 registro
      const survey = Array.isArray(remote) ? remote[0] : remote;
      setStaticSurvey(survey || null);
      if (survey) await createLocalStaticSurvey(survey);
    } catch (err) {
      console.warn("[App] Falha servidor, tentando local:", err);
      try {
        const local = await getLocalStaticSurvey(researchId);
        setStaticSurvey(local || null);
      } catch (errLocal) {
        console.error("[App] Falha local:", errLocal);
        setError("Erro ao carregar coleta estática local");
      }
    } finally {
      setLoadingSurveys(false);
    }
  };

  /* ───────────── CRUD ───────────── */
  const addStaticSurvey = async (survey: StaticSurvey) => {
    const newSurvey: StaticSurvey = { ...survey, id: uuidv4() };
    setStaticSurvey(newSurvey);

    try {
      const created = await createRemoteStaticSurvey(survey);
      await createLocalStaticSurvey(created);
      return created;
    } catch (err) {
      console.error("[App] Falha ao criar remoto:", err);
      setError("Falha ao salvar no servidor. Salvo localmente.");
      await saveUnsyncedItem("static_surveys", newSurvey);
      setUnSyncedSurveys((prev) => [...prev, newSurvey]);
      return newSurvey;
    }
  };

  const updateStaticSurvey = async (id: string, updatedData: StaticSurvey) => {
    await updateLocalStaticSurvey(id, updatedData);
    setStaticSurvey((prev) => (prev ? { ...prev, ...updatedData } : updatedData));

    try {
      await updateRemoteStaticSurvey({ ...updatedData, id });
    } catch (err) {
      console.error("[App] Falha sync update:", err);
      setError("Atualização pendente de sincronização.");
      await saveUnsyncedItem("static_surveys", { ...updatedData, id });
      setUnSyncedSurveys((prev) => [...prev, { ...updatedData, id }]);
    }
  };

  const deleteStaticSurvey = async (survey: StaticSurvey) => {
    setStaticSurvey(null);
    try {
      await deleteLocalStaticSurvey(survey.id);
      await deleteRemoteStaticSurvey(survey);
    } catch (err) {
      console.error("[App] Falha ao deletar:", err);
      await saveUnsyncedItem("static_surveys", { ...survey, deleted: true });
    }
  };

  return {
    staticSurvey,
    unSyncedSurveys,
    loading: loadingSurveys || loadingUnsynced,
    loadingSurveys,
    loadingUnsynced,
    error,
    addStaticSurvey,
    updateStaticSurvey,
    deleteStaticSurvey,
  };
}
