// src/hooks/useSurveyRegions.ts
import { useEffect, useState } from "react";
import { SurveyRegion } from "@/lib/types/indexeddb";
import {
  createSurveyRegion as createRemoteSurveyRegion,
  deleteSurveyRegion as deleteRemoteSurveyRegion,
  getSurveyRegions as getRemoteSurveyRegions,
} from "@/repositories/server/surveyRegionApi";

import {
  createSurveyRegion as createLocalSurveyRegion,
  deleteSurveyRegion as deleteLocalSurveyRegion,
  getAllSurveyRegions as getAllLocalSurveyRegions,
} from "@/repositories/indexeddb/surveyRegionRepository";

import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export function useSurveyRegions(survey_id: string) {
  const [surveyRegions, setSurveyRegions] = useState<SurveyRegion[]>([]);
  const [unSyncedRegions, setUnSyncedRegions] = useState<SurveyRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!survey_id) return;
    fetchUnsyncedRegions();
    fetchRegions();
  }, [survey_id]);

  const fetchUnsyncedRegions = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const pending = unsynced
        .filter((item) => item.store === "survey_regions")
        .map((item) => item.payload as SurveyRegion)
        .filter((r) => r.survey_id === survey_id);

      setUnSyncedRegions(pending);
    } catch (error) {
      console.error("[App] Erro ao carregar regiões pendentes:", error);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const remoteRegions = await getRemoteSurveyRegions(survey_id);
      
      setSurveyRegions(remoteRegions);
      await Promise.allSettled(
        remoteRegions.map((r) => createLocalSurveyRegion(r))
      );
    } catch (err) {
      console.warn("[App] Erro remoto. Buscando local:", err);
      try {
        const localRegions = await getAllLocalSurveyRegions();
        const filtered = localRegions.filter((r) => r.survey_id === survey_id);
        setSurveyRegions(filtered);
      } catch (errLocal) {
        console.error("[App] Erro local:", errLocal);
        setError("Erro ao carregar regiões");
      }
    } finally {
      setLoading(false);
    }
  };

  const addSurveyRegion = async (region: SurveyRegion): Promise<SurveyRegion> => {
    try {
      const created = await createRemoteSurveyRegion(region);
      await createLocalSurveyRegion(created);
      setSurveyRegions((prev) => [...prev, created]);
      return created;
    } catch (error) {
      const newId = uuidv4();
      const localRegion: SurveyRegion = { ...region, id: newId };
      console.error("[App] Erro ao criar região:", error);
      await saveUnsyncedItem("survey_regions", localRegion);
      setUnSyncedRegions((prev) => [...prev, localRegion]);
      return localRegion;
    }
  };

  const deleteSurveyRegion = async (id: string) => {
    setSurveyRegions((prev) => prev.filter((r) => r.id !== id));

    try {
      await deleteRemoteSurveyRegion(id, survey_id);
    } catch (error) {
      console.error("[App] Falha ao deletar remotamente:", error);
      await saveUnsyncedItem("survey_regions", { id, survey_id } as SurveyRegion);
      setUnSyncedRegions((prev) => [...prev, { id, survey_id } as SurveyRegion]);
    }

    try {
      await deleteLocalSurveyRegion(id);
    } catch (error) {
      console.warn("[App] Falha ao deletar localmente:", error);
    }
  };

  return {
    surveyRegions,
    unSyncedRegions,
    loading: loading || loadingUnsynced,
    error,
    addSurveyRegion,
    deleteSurveyRegion,
  };
}
