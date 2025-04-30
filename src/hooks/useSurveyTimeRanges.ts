// src/hooks/useSurveyTimeRanges.ts
import { useEffect, useState } from 'react';
import { SurveyTimeRange } from '@/lib/types/indexeddb';
import {
  getSurveyTimeRanges as getRemoteSurveyTimeRanges,
  createSurveyTimeRange as createRemoteSurveyTimeRange,
  deleteSurveyTimeRange as deleteRemoteSurveyTimeRange,
} from '@/repositories/server/surveyTimeRangeApi';

import {
  getAllSurveyTimeRanges as getAllLocalSurveyTimeRanges,
  createSurveyTimeRange as createLocalSurveyTimeRange,
  deleteSurveyTimeRange as deleteLocalSurveyTimeRange,
} from '@/repositories/indexeddb/surveyTimeRangeRepository';

import { saveUnsyncedItem, getUnsyncedItems } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export function useSurveyTimeRanges(survey_id: string) {
  const [ranges, setRanges] = useState<SurveyTimeRange[]>([]);
  const [unSyncedRanges, setUnSyncedRanges] = useState<SurveyTimeRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!survey_id) return;
    fetchUnsyncedRanges();
    fetchRanges();
  }, [survey_id]);

  const fetchUnsyncedRanges = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const pending = unsynced
        .filter((item) => item.store === 'survey_time_ranges')
        .map((item) => item.payload as SurveyTimeRange)
        .filter((r) => r.survey_id === survey_id);

      setUnSyncedRanges(pending);
    } catch (err) {
      console.error('[App] Erro ao carregar time ranges pendentes:', err);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchRanges = async () => {
    setLoading(true);
    try {
      const remote = await getRemoteSurveyTimeRanges(survey_id);
      setRanges(remote);
      await Promise.allSettled(remote.map((r) => createLocalSurveyTimeRange(r)));
    } catch (err) {
      console.warn('[App] Erro remoto. Buscando local:', err);
      try {
        const local = await getAllLocalSurveyTimeRanges();
        const filtered = local.filter((r) => r.survey_id === survey_id);
        setRanges(filtered);
      } catch (errLocal) {
        console.error('[App] Erro local:', errLocal);
        setError('Erro ao carregar faixas de horário');
      }
    } finally {
      setLoading(false);
    }
  };

  const addSurveyTimeRange = async (
    range: Omit<SurveyTimeRange, 'id'>
  ): Promise<SurveyTimeRange> => {
    try {
      const created = await createRemoteSurveyTimeRange(
        range.survey_id,
       range.survey_type,
        range
      );
      await createLocalSurveyTimeRange(created);
      setRanges((prev) => [...prev, created]);
      return created;
    } catch (err) {
      const fallback = { ...range, id: uuidv4() };
      await saveUnsyncedItem('survey_time_ranges', fallback);
      setUnSyncedRanges((prev) => [...prev, fallback]);
      return fallback;
    }
  };

  const deleteSurveyTimeRange = async (id: string) => {
    setRanges((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteRemoteSurveyTimeRange(survey_id, id);
    } catch (err) {
      console.warn('[App] Falha ao deletar remotamente:', err);
      await saveUnsyncedItem('survey_time_ranges', { id, survey_id } as SurveyTimeRange);
      setUnSyncedRanges((prev) => [...prev, { id, survey_id } as SurveyTimeRange]);
    }

    try {
      await deleteLocalSurveyTimeRange(id);
    } catch (err) {
      console.warn('[App] Falha ao deletar localmente:', err);
    }
  };

  return {
    ranges,
    unSyncedRanges,
    loading: loading || loadingUnsynced,
    error,
    addSurveyTimeRange,
    deleteSurveyTimeRange,
  };
}
