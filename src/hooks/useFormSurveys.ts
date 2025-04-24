import { useEffect, useState } from 'react';
import { FormSurvey } from '@/lib/types/indexeddb';
import { createFormSurvey } from '@/repositories/server/formSurveyApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useFormSurveys() {
  type LocalFormSurvey = FormSurvey & { _syncStatus?: 'pending' | 'synced' | 'error' };
  const [surveys, setSurveys] = useState<LocalFormSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems('form_surveys');
        setSurveys(data);
      } catch (err) {
        setError('Erro ao carregar form surveys');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addFormSurvey = async (survey: FormSurvey) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newSurvey: LocalFormSurvey = { ...survey, _syncStatus: isOnline ? 'synced' : 'pending' };
    setSurveys(prev => [...prev, newSurvey]);

    try {
      await createItem('form_surveys', newSurvey);
      if (isOnline) await createFormSurvey(survey);
    } catch {
      const errorSurvey: LocalFormSurvey = { ...survey, _syncStatus: 'error' };
      await createItem('form_surveys', errorSurvey);
    }
  };

  return { surveys, loading, error, addFormSurvey };
}
