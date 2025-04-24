// src/hooks/useSurveyTimeRanges.ts
import { useEffect, useState } from 'react';
import { SurveyTimeRange } from '@/lib/types/indexeddb';
import { createSurveyTimeRange } from '@/repositories/server/surveyTimeRangeApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useSurveyTimeRanges() {
  type LocalSurveyTimeRange = SurveyTimeRange & { _syncStatus?: 'pending' | 'synced' | 'error' };
  const [ranges, setRanges] = useState<LocalSurveyTimeRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems('survey_time_ranges');
        setRanges(data);
      } catch (err) {
        setError('Erro ao carregar faixas de horário');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addSurveyTimeRange = async (range: SurveyTimeRange) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newRange: LocalSurveyTimeRange = { ...range, _syncStatus: isOnline ? 'synced' : 'pending' };
    setRanges(prev => [...prev, newRange]);

    try {
      await createItem('survey_time_ranges', newRange);
      if (isOnline) await createSurveyTimeRange(range);
    } catch {
      const errorRange: LocalSurveyTimeRange = { ...range, _syncStatus: 'error' };
      await createItem('survey_time_ranges', errorRange);
    }
  };

  return { ranges, loading, error, addSurveyTimeRange };
}