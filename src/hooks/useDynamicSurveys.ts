// src/hooks/useDynamicSurveys.ts
import { useEffect, useState } from 'react';
import { DynamicSurvey } from '@/lib/types/indexeddb';
import { createDynamicSurvey } from '@/repositories/server/dynamicSurveyApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useDynamicSurveys(research_id: string) {
  type LocalDynamicSurvey = DynamicSurvey & { _syncStatus?: 'pending' | 'synced' | 'error' };
  const [surveys, setSurveys] = useState<LocalDynamicSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems('dynamic_surveys');
        setSurveys(data);
      } catch (err) {
        setError('Erro ao carregar dynamic surveys');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addDynamicSurvey = async (survey: DynamicSurvey) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newSurvey: LocalDynamicSurvey = { ...survey, _syncStatus: isOnline ? 'synced' : 'pending' };
    setSurveys(prev => [...prev, newSurvey]);

    try {
      await createItem('dynamic_surveys', newSurvey);
      if (isOnline) await createDynamicSurvey(survey);
    } catch {
      const errorSurvey: LocalDynamicSurvey = { ...survey, _syncStatus: 'error' };
      await createItem('dynamic_surveys', errorSurvey);
    }
  };

  return { surveys, loading, error, addDynamicSurvey };
}