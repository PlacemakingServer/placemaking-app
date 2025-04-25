import { useEffect, useState } from 'react';
import { Research } from '@/lib/types/indexeddb';
import {
  createResearch as createRemoteResearch,
  updateResearch as updateRemoteResearch,
  deleteResearch as deleteRemoteResearch,
} from '@/repositories/server/researchApi';
import {
  createResearch as createLocalResearch,
  getResearch as getLocalResearch,
  getAllResearchs as getAllLocalResearchs,
  updateResearch as updateLocalResearch,
  deleteResearch as deleteLocalResearch,
} from '@/repositories/indexeddb/researchRepository';

export type LocalResearch = Research & {
  id?: string;
  _syncStatus?: 'pending' | 'synced' | 'error';
};

function toLocalResearch(data: Research, status: 'pending' | 'synced' | 'error'): LocalResearch {
  return {
    ...data,
    _syncStatus: status,
  };
}

export function useResearches() {
  const [researches, setResearches] = useState<LocalResearch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const isOnline = typeof window !== 'undefined' && navigator.onLine;
        if (isOnline) {
          const remoteResearches = await getAllLocalResearchs();
          setResearches(remoteResearches);
        } else {
          const localResearches = await getAllLocalResearchs();
          setResearches(localResearches);
        }
      } catch {
        setError('Erro ao carregar pesquisas');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addResearch = async (research: Research) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const localResearch = toLocalResearch(research, isOnline ? 'synced' : 'pending');

    setResearches(prev => [...prev, localResearch]);

    try {
      await createLocalResearch(localResearch);
      if (isOnline){
       return await createRemoteResearch(research);
      }

    } catch {
      const errorResearch = toLocalResearch(research, 'error');
      setError('Erro ao salvar a pesquisa');
      return  await createLocalResearch(errorResearch);
    }
  };

  const getResearchById = async (id: string): Promise<LocalResearch | null> => {
    try {
      return await getLocalResearch(id);
    } catch {
      setError('Pesquisa não encontrada');
      return null;
    }
  };

  const updateResearch = async (id: string, updatedData: Partial<LocalResearch>) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;

    const updatePayload = {
      ...updatedData,
      _syncStatus: isOnline ? 'synced' : 'pending',
    } as Partial<LocalResearch>;
    

    await updateLocalResearch(id, updatePayload);
    setResearches(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updatePayload } : r))
    );

    if (isOnline) {
      try {
        await updateRemoteResearch({ ...(updatedData as Research), id });
      } catch {
        await updateLocalResearch(id, { _syncStatus: 'error' });
        setError('Erro ao sincronizar atualização com o servidor');
      }
    }
  };

  const removeResearch = async (id: string) => {
    try {
      await deleteLocalResearch(id);
      setResearches(prev => prev.filter(r => r.id !== id));

      const isOnline = typeof window !== 'undefined' && navigator.onLine;
      if (isOnline) await deleteRemoteResearch(id);
    } catch {
      setError('Erro ao deletar pesquisa');
    }
  };

  return {
    researches,
    loading,
    error,
    addResearch,
    getResearchById,
    updateResearch,
    removeResearch,
  };
}
