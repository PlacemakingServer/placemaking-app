// src/hooks/useSurveyGroups.ts
import { useEffect, useState } from 'react';
import { SurveyGroup } from '@/lib/types/indexeddb';
import { createSurveyGroup } from '@/repositories/server/surveyGroupApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useSurveyGroups() {
  type LocalSurveyGroup = SurveyGroup & { _syncStatus?: 'pending' | 'synced' | 'error' };
  const [groups, setGroups] = useState<LocalSurveyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems('survey_group');
        setGroups(data);
      } catch (err) {
        setError('Erro ao carregar grupos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addSurveyGroup = async (group: SurveyGroup) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newGroup: LocalSurveyGroup = { ...group, _syncStatus: isOnline ? 'synced' : 'pending' };
    setGroups(prev => [...prev, newGroup]);

    try {
      await createItem('survey_group', newGroup);
      if (isOnline) await createSurveyGroup(group);
    } catch {
      const errorGroup: LocalSurveyGroup = { ...group, _syncStatus: 'error' };
      await createItem('survey_group', errorGroup);
    }
  };

  return { groups, loading, error, addSurveyGroup };
}