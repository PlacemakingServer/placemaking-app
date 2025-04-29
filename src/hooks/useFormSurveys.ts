import { useEffect, useState } from "react";
import { FormSurvey } from "@/lib/types/indexeddb";
import {
  createFormSurvey as createRemoteFormSurvey,
  updateFormSurvey as updateRemoteFormSurvey,
  deleteFormSurvey as deleteRemoteFormSurvey,
  getFormSurveys as getAllRemoteFormSurveys,
} from "@/repositories/server/formSurveyApi";
import {
  createFormSurvey as createLocalFormSurvey,
  getFormSurvey as getLocalFormSurvey,
  getAllFormSurveys as getAllLocalFormSurveys,
  updateFormSurvey as updateLocalFormSurvey,
  deleteFormSurvey as deleteLocalFormSurvey,
} from "@/repositories/indexeddb/formSurveyRepository";
import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export function useFormSurveys(especifico: boolean = false, research_id?: string, survey_type: string = "Formulário") {
  const [surveys, setSurveys] = useState<FormSurvey[]>([]);
  const [surveyData, setSurveyData] = useState<FormSurvey | null>(null);
  const [unSyncedSurveys, setUnSyncedSurveys] = useState<FormSurvey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState<boolean>(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedSurveys();
  }, []);

  useEffect(() => {
    if (especifico) {
      if (research_id) {
        fetchSurveyByResearchId(research_id, survey_type);
      } else {
        setSurveyData(null);
        setLoadingSurveys(false);
      }
    } else {
      fetchSurveys();
    }
  }, [especifico, research_id]);

  const fetchUnsyncedSurveys = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const surveysPending = unsynced
        .filter((item) => item.store === "form_surveys")
        .map((item) => item.payload as FormSurvey);
      setUnSyncedSurveys(surveysPending);
    } catch (error) {
      console.error("[App] Erro ao carregar form surveys pendentes:", error);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchSurveys = async () => {
    setLoadingSurveys(true);
    try {
      const remoteSurveys = await getAllRemoteFormSurveys(research_id, survey_type);
      setSurveys(remoteSurveys);
      await Promise.allSettled(
        remoteSurveys.map((survey) => createLocalFormSurvey(survey))
      );
    } catch (err) {
      console.warn("[App] Falha ao buscar form surveys do servidor. Usando IndexedDB local.", err);
      try {
        const localSurveys = await getAllLocalFormSurveys();
        setSurveys(localSurveys);
      } catch (errLocal) {
        console.error("[App] Falha ao carregar form surveys locais:", errLocal);
        setError("Erro ao carregar form surveys locais");
      }
    } finally {
      setLoadingSurveys(false);
    }
  };

  const fetchSurveyByResearchId = async (surveyId: string, surveyType: string) => {
    setLoadingSurveys(true);
    try {
      const local = await getLocalFormSurvey(surveyId);
      if (local) {
        setSurveyData(local);
      } else {
        throw new Error("Form survey não encontrado localmente");
      }
    } catch (err) {
      console.error("[App] Erro ao buscar form survey por ID:", err);
      setError("Form survey não encontrado localmente");
      setSurveyData(null);
    } finally {
      setLoadingSurveys(false);
    }
  };

  const addFormSurvey = async (survey: FormSurvey): Promise<FormSurvey> => {
    const newSurveyId = uuidv4();
    const localSurvey: FormSurvey = { ...survey, id: newSurveyId };

    setSurveys((prev) => [...prev, localSurvey]);

    try {
      const created = await createRemoteFormSurvey(survey);
      await createLocalFormSurvey(created);
      return created;
    } catch (error) {
      console.error("[App] Erro ao criar form survey remotamente:", error);
      setError("Falha ao salvar no servidor. Salvo localmente para sincronizar depois.");
      await saveUnsyncedItem("form_surveys", localSurvey);
      setUnSyncedSurveys((prev) => [...prev, localSurvey]);
      return localSurvey;
    }
  };

  const updateFormSurvey = async (id: string, updatedData: FormSurvey) => {
    await updateLocalFormSurvey(id, updatedData);

    setSurveys((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );

    try {
      await updateRemoteFormSurvey({ ...updatedData, id });
    } catch (error) {
      console.error("[App] Erro ao atualizar form survey:", error);
      setError("Falha ao sincronizar atualização.");
      await saveUnsyncedItem("form_surveys", { ...updatedData, id });
      setUnSyncedSurveys((prev) => [...prev, { ...updatedData, id }]);
    }
  };

  return {
    surveys,
    surveyData,
    unSyncedSurveys,
    loading: loadingSurveys || loadingUnsynced,
    loadingSurveys,
    loadingUnsynced,
    error,
    addFormSurvey,
    updateFormSurvey,
  };
}
