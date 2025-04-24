import { useEffect, useState } from 'react';
import { ResearchContributor } from '@/lib/types/indexeddb';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';
import { createResearchContributor } from '@/repositories/server/researchContributorApi';

export function useResearchContributors() {
  type LocalResearchContributor = ResearchContributor & { _syncStatus?: 'pending' | 'synced' | 'error' };
  const [contributors, setContributors] = useState<LocalResearchContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems('research_contributors');
        setContributors(data);
      } catch (err) {
        setError('Erro ao carregar colaboradores de pesquisa');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addResearchContributor = async (contributor: ResearchContributor) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newContributor: LocalResearchContributor = { ...contributor, _syncStatus: isOnline ? 'synced' : 'pending' };
    setContributors(prev => [...prev, newContributor]);

    try {
      await createItem('research_contributors', newContributor);
      if (isOnline) await createResearchContributor(contributor);
    } catch {
      const errorContributor: LocalResearchContributor = { ...contributor, _syncStatus: 'error' };
      await createItem('research_contributors', errorContributor);
    }
  };

  return { contributors, loading, error, addResearchContributor };
}
