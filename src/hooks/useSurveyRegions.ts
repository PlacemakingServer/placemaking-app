// src/hooks/useSurveyRegions.ts
import { useEffect, useState } from 'react';
import { SurveyRegion } from '@/lib/types/indexeddb';
import { createSurveyRegion } from '@/repositories/server/surveyRegionApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useSurveyRegions() {
  type LocalSurveyRegion = SurveyRegion & { _syncStatus?: 'pending' | 'synced' | 'error' };

  const [regions, setRegions] = useState<LocalSurveyRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems('survey_regions');
        setRegions(data);
      } catch (err) {
        setError('Erro ao carregar regiões');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addSurveyRegion = async (region: SurveyRegion) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newRegion: LocalSurveyRegion = {
      ...region,
      _syncStatus: isOnline ? 'synced' : 'pending',
    };
    setRegions((prev) => [...prev, newRegion]);

    try {
      await createItem('survey_regions', newRegion);
      if (isOnline) await createSurveyRegion(region);
    } catch {
      const errorRegion: LocalSurveyRegion = {
        ...region,
        _syncStatus: 'error',
      };
      await createItem('survey_regions', errorRegion);
    }
  };

  return {
    regions,
    loading,
    error,
    addSurveyRegion,
  };
}
