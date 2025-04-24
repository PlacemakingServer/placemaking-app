// src/hooks/useStaticSurveys.ts
import { useEffect, useState } from 'react';
import { StaticSurvey } from '@/lib/types/indexeddb';
import { createStaticSurvey } from '@/repositories/server/staticSurveyApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useStaticSurveys() {
  type LocalStaticSurvey = StaticSurvey & { _syncStatus?: 'pending' | 'synced' | 'error' };
  const [surveys, setSurveys] = useState<LocalStaticSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems('static_surveys');
        setSurveys(data);
      } catch (err) {
        setError('Erro ao carregar static surveys');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addStaticSurvey = async (survey: StaticSurvey) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newSurvey: LocalStaticSurvey = { ...survey, _syncStatus: isOnline ? 'synced' : 'pending' };
    setSurveys(prev => [...prev, newSurvey]);

    try {
      await createItem('static_surveys', newSurvey);
      if (isOnline) await createStaticSurvey(survey);
    } catch {
      const errorSurvey: LocalStaticSurvey = { ...survey, _syncStatus: 'error' };
      await createItem('static_surveys', errorSurvey);
    }
  };

  return { surveys, loading, error, addStaticSurvey };
}
