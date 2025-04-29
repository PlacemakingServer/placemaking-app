// src/hooks/useDynamicSurveys.ts
import { useEffect, useState } from "react";
import { DynamicSurvey } from "@/lib/types/indexeddb";
import {
  createDynamicSurvey as createRemoteDynamicSurvey,
  getDynamicSurvey as getRemoteDynamicSurvey,
  updateDynamicSurvey as updateRemoteDynamicSurvey,
  deleteDynamicSurvey as deleteRemoteDynamicSurvey,
} from "@/repositories/server/dynamicSurveyApi";

import {
  createDynamicSurvey as createLocalDynamicSurvey,
  getDynamicSurvey as getLocalDynamicSurvey,
  updateDynamicSurvey as updateLocalDynamicSurvey,
  deleteDynamicSurvey as deleteLocalDynamicSurvey,
} from "@/repositories/indexeddb/dynamicSurveyRepository";

import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export function useDynamicSurveys(
  research_id?: string,
  especifico: boolean = true,
  survey_type: string = "Dinâmica"
) {
  const [surveyData, setSurveyData] = useState<DynamicSurvey | null>(null);
  const [unSyncedSurveys, setUnSyncedSurveys] = useState<DynamicSurvey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedSurveys();
  }, []);

  useEffect(() => {
    if (especifico && research_id) {
      fetchSurveyByResearch(research_id, survey_type);
    } else {
      setSurveyData(null);
      setLoadingSurveys(false);
    }
  }, [especifico, research_id, survey_type]);

  const fetchUnsyncedSurveys = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const surveysPending = unsynced
        .filter((item) => item.store === "dynamic_surveys")
        .map((item) => item.payload as DynamicSurvey);
      setUnSyncedSurveys(surveysPending);
    } catch (error) {
      console.error("[App] Erro ao carregar dynamic surveys pendentes:", error);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchSurveyByResearch = async (researchId: string, type: string) => {
    setLoadingSurveys(true);
    try {
      const remote = await getRemoteDynamicSurvey(researchId, type);
      console.log("[App] Surveys do servidor:", remote);
      const survey = remote;
      setSurveyData(survey);

      if (survey) {
        await createLocalDynamicSurvey(survey);
      }
    } catch (err) {
      console.warn("[App] Falha ao buscar do servidor, tentando local:", err);
      try {
        const local = await getLocalDynamicSurvey(researchId);
        setSurveyData(local || null);
      } catch (errLocal) {
        console.error("[App] Falha ao buscar local:", errLocal);
        setError("Erro ao carregar dynamic survey local");
      }
    } finally {
      setLoadingSurveys(false);
    }
  };

  const addDynamicSurvey = async (survey: DynamicSurvey): Promise<DynamicSurvey> => {
    const newSurveyId = uuidv4();
    const localSurvey: DynamicSurvey = { ...survey, id: newSurveyId };

    setSurveyData(localSurvey);

    try {
      const created = await createRemoteDynamicSurvey(survey);
      await createLocalDynamicSurvey(created);
      return created;
    } catch (error) {
      console.error("[App] Erro ao criar remotamente:", error);
      setError("Falha ao salvar no servidor. Salvo localmente.");
      await saveUnsyncedItem("dynamic_surveys", localSurvey);
      setUnSyncedSurveys((prev) => [...prev, localSurvey]);
      return localSurvey;
    }
  };

  const updateDynamicSurvey = async (id: string, updatedData: DynamicSurvey) => {
    await updateLocalDynamicSurvey(id, updatedData);
    setSurveyData((prev) => (prev ? { ...prev, ...updatedData } : updatedData));

    try {
      await updateRemoteDynamicSurvey({ ...updatedData, id });
    } catch (error) {
      console.error("[App] Falha ao sincronizar update:", error);
      await saveUnsyncedItem("dynamic_surveys", { ...updatedData, id });
      setUnSyncedSurveys((prev) => [...prev, { ...updatedData, id }]);
    }
  };

  const deleteDynamicSurvey = async (id: string) => {
    setSurveyData(null);

    try {
      await deleteLocalDynamicSurvey(id);
      await deleteRemoteDynamicSurvey({ id } as DynamicSurvey);
    } catch (error) {
      console.error("[App] Erro ao deletar dynamic survey:", error);
      await saveUnsyncedItem("dynamic_surveys", { id, delete: true } as any);
    }
  };

  return {
    survey: surveyData,
    unSyncedSurveys,
    loading: loadingSurveys || loadingUnsynced,
    loadingSurveys,
    loadingUnsynced,
    error,
    addDynamicSurvey,
    updateDynamicSurvey,
    deleteDynamicSurvey,
  };
}
