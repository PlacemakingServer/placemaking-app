// src/hooks/useResearches.ts
import { useEffect, useState } from 'react';
import { Research } from '@/lib/types/indexeddb';
import { createResearch } from '@/repositories/server/researchApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useResearches() {
  type LocalResearch = Omit<Research, 'id'> & { id?: string; _syncStatus?: 'pending' | 'synced' | 'error' };
  const [researches, setResearches] = useState<LocalResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems('researches');
        setResearches(data);
      } catch (err) {
        setError('Erro ao carregar pesquisas');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addResearch = async (research: Research) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newResearch: LocalResearch = { ...research, _syncStatus: isOnline ? 'synced' : 'pending' };
    setResearches(prev => [...prev, newResearch]);

    try {
      await createItem('researches', newResearch);
      if (isOnline) await createResearch(research);
    } catch {
      const errorResearch: LocalResearch = { ...research, _syncStatus: 'error' };
      await createItem('researches', errorResearch);
    }
  };

  return { researches, loading, error, addResearch };
}
