// src/hooks/useSurveyContributors.ts
import { useEffect, useState } from 'react';
import { SurveyContributor } from '@/lib/types/indexeddb';
import { createSurveyContributor } from '@/repositories/server/surveyContributorApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useSurveyContributors() {
  type LocalSurveyContributor = SurveyContributor & { _syncStatus?: 'pending' | 'synced' | 'error' };
  const [contributors, setContributors] = useState<LocalSurveyContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems('survey_contributors');
        setContributors(data);
      } catch (err) {
        setError('Erro ao carregar colaboradores');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addSurveyContributor = async (contributor: SurveyContributor) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newContributor: LocalSurveyContributor = { ...contributor, _syncStatus: isOnline ? 'synced' : 'pending' };
    setContributors(prev => [...prev, newContributor]);

    try {
      await createItem('survey_contributors', newContributor);
      if (isOnline) await createSurveyContributor(contributor);
    } catch {
      const errorContributor: LocalSurveyContributor = { ...contributor, _syncStatus: 'error' };
      await createItem('survey_contributors', errorContributor);
    }
  };

  return { contributors, loading, error, addSurveyContributor };
}
