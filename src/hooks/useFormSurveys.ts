// src/hooks/useFormSurveys.ts
import { useEffect, useState } from "react";
import { FormSurvey } from "@/lib/types/indexeddb";
import {
  deleteFormSurvey as deleteRemoteFormSurvey,
  createFormSurvey as createRemoteFormSurvey,
  getFormSurvey as getRemoteFormSurvey,
  updateFormSurvey as updateRemoteFormSurvey,
} from "@/repositories/server/formSurveyApi";

import {
  createFormSurvey as createLocalFormSurvey,
  getAllFormSurveys as getAllLocalFormSurveys,
  getFormSurvey as getLocalFormSurvey,
  updateFormSurvey as updateLocalFormSurvey,
  deleteFormSurvey as deleteLocalFormSurvey,
} from "@/repositories/indexeddb/formSurveyRepository";

import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export function useFormSurveys(
  research_id?: string,
  especifico: boolean = true,
  survey_type: string = "Formulário"
) {
  const [surveyData, setSurveyData] = useState<FormSurvey | null>(null);
  const [unSyncedSurveys, setUnSyncedSurveys] = useState<FormSurvey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState<boolean>(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedSurveys();
  }, []);

  useEffect(() => {
    if (especifico && research_id) {
      fetchSurveyByResearchAndType(research_id, survey_type);
    } else {
      setSurveyData(null);
      setLoadingSurveys(false);
    }
  }, [especifico, research_id, survey_type]);

  const fetchUnsyncedSurveys = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const surveysPending = unsynced
        .filter((item) => item.store === "form_surveys")
        .map((item) => item.payload as FormSurvey);
      setUnSyncedSurveys(surveysPending);
    } catch (error) {
      console.error("[App] Erro ao carregar surveys pendentes:", error);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchSurveyByResearchAndType = async (researchId: string, type: string) => {
    setLoadingSurveys(true);
    try {
      const remote = await getRemoteFormSurvey(researchId, type);
      const survey = remote?.[0] || null;
      setSurveyData(survey);

      if (survey) {
        await createLocalFormSurvey(survey);
      }
    } catch (err) {
      console.warn("[App] Falha ao buscar do servidor, tentando local:", err);
      try {
        const local = await getLocalFormSurvey(researchId);
        setSurveyData(local || null);
      } catch (errLocal) {
        console.error("[App] Falha ao buscar local:", errLocal);
        setError("Erro ao carregar coleta local");
      }
    } finally {
      setLoadingSurveys(false);
    }
  };

  const addFormSurvey = async (survey: FormSurvey): Promise<FormSurvey> => {
    const newSurveyId = uuidv4();
    const localSurvey: FormSurvey = { ...survey, id: newSurveyId };

    setSurveyData(localSurvey);

    try {

      const created = await createRemoteFormSurvey(survey);

      await createLocalFormSurvey(created);
      return created;
    } catch (error) {
      console.error("[App] Erro ao criar remotamente:", error);
      setError("Falha ao salvar no servidor. Salvo localmente.");
      await saveUnsyncedItem("form_surveys", localSurvey);
      setUnSyncedSurveys((prev) => [...prev, localSurvey]);
      return localSurvey;
    }
  };

  const updateFormSurvey = async (id: string, updatedData: FormSurvey) => {
    await updateLocalFormSurvey(id, updatedData);
    setSurveyData((prev) => prev ? { ...prev, ...updatedData } : updatedData);

    try {
      await updateRemoteFormSurvey({ ...updatedData, id });
    } catch (error) {
      console.error("[App] Falha ao sincronizar update:", error);
      setError("Atualização pendente de sincronização.");
      await saveUnsyncedItem("form_surveys", { ...updatedData, id });
      setUnSyncedSurveys((prev) => [...prev, { ...updatedData, id }]);
    }
  };

  const deleteFormSurvey = async (id: string) => {
    setSurveyData(null);
  
    try {
      await deleteLocalFormSurvey(id);
      await deleteRemoteFormSurvey({ id } as FormSurvey);
    } catch (error) {
      console.error("[App] Erro ao deletar form survey:", error);
      await saveUnsyncedItem("form_surveys", { id, delete: true } as any);
    }
  };
  

  return {
    survey: surveyData,
    unSyncedSurveys,
    loading: loadingSurveys || loadingUnsynced,
    loadingSurveys,
    loadingUnsynced,
    error,
    addFormSurvey,
    updateFormSurvey,
    deleteFormSurvey
  };
}
