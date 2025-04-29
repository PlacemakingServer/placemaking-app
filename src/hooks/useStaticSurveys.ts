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

export function useStaticSurveys(
  research_id?: string,
  especifico: boolean = true,
  survey_type: string = "Estática"
) {
  const [surveyData, setSurveyData] = useState<StaticSurvey | null>(null);
  const [unSyncedSurveys, setUnSyncedSurveys] = useState<StaticSurvey[]>([]);
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
        .filter((item) => item.store === "static_surveys")
        .map((item) => item.payload as StaticSurvey);
      setUnSyncedSurveys(surveysPending);
    } catch (error) {
      console.error("[App] Erro ao carregar static surveys pendentes:", error);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchSurveyByResearch = async (researchId: string, type: string) => {
    setLoadingSurveys(true);
    try {
      const remote = await getRemoteStaticSurvey(researchId, type);
      const survey = remote?.[0] || null;
      setSurveyData(survey);
      if (survey) await createLocalStaticSurvey(survey);
    } catch (err) {
      console.warn("[App] Falha ao buscar do servidor, tentando local:", err);
      try {
        const local = await getLocalStaticSurvey(researchId);
        setSurveyData(local || null);
      } catch (errLocal) {
        console.error("[App] Falha ao buscar local:", errLocal);
        setError("Erro ao carregar static survey local");
      }
    } finally {
      setLoadingSurveys(false);
    }
  };

  const addStaticSurvey = async (survey: StaticSurvey): Promise<StaticSurvey> => {
    const newSurveyId = uuidv4();
    const localSurvey = { ...survey, id: newSurveyId };
    setSurveyData(localSurvey);

    try {
      const created = await createRemoteStaticSurvey(survey);
      await createLocalStaticSurvey(created);
      return created;
    } catch (error) {
      console.error("[App] Erro ao criar remotamente:", error);
      await saveUnsyncedItem("static_surveys", localSurvey);
      setUnSyncedSurveys((prev) => [...prev, localSurvey]);
      return localSurvey;
    }
  };

  const updateStaticSurvey = async (id: string, updatedData: StaticSurvey) => {
    await updateLocalStaticSurvey(id, updatedData);
    setSurveyData((prev) => (prev ? { ...prev, ...updatedData } : updatedData));

    try {
      await updateRemoteStaticSurvey({ ...updatedData, id });
    } catch (error) {
      await saveUnsyncedItem("static_surveys", { ...updatedData, id });
      setUnSyncedSurveys((prev) => [...prev, { ...updatedData, id }]);
    }
  };

  const deleteStaticSurvey = async (id: string) => {
    setSurveyData(null);

    try {
      await deleteLocalStaticSurvey(id);
      await deleteRemoteStaticSurvey({ id } as StaticSurvey);
    } catch (error) {
      console.error("[App] Erro ao deletar static survey:", error);
      await saveUnsyncedItem("static_surveys", { id, delete: true } as any);
    }
  };

  return {
    survey: surveyData,
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
