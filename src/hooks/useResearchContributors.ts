import { useEffect, useState } from 'react';
import { ResearchContributor } from '@/lib/types/indexeddb';
import { 
  createResearchContributor as createRemoteResearchContributor, 
  getResearchContributors as getAllRemoteResearchContributors,
  deleteResearchContributor as deleteRemoteResearchContributor,
} from '@/repositories/server/researchContributorApi';
import { createItem, getAllItems, deleteItem } from '@/repositories/indexeddb/indexedDBService';
import { saveUnsyncedItem, getUnsyncedItems } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'domain';

type LocalResearchContributor = ResearchContributor & { _syncStatus?: 'pending' | 'synced' | 'error' };

export function useResearchContributors(researchId?: string) {
  const [contributors, setContributors] = useState<LocalResearchContributor[]>([]);
  const [unSyncedContributors, setUnSyncedContributors] = useState<LocalResearchContributor[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedContributors();
  }, []);

  useEffect(() => {
    if (researchId) {
      fetchContributors(researchId);
    } else {
      setContributors([]);
      setLoadingContributors(false);
    }
  }, [researchId]);

  const fetchUnsyncedContributors = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const pending = unsynced
        .filter((item) => item.store === "research_contributors")
        .map((item) => item.payload as LocalResearchContributor);
      setUnSyncedContributors(pending);
    } catch (err) {
      console.error("[App] Erro ao carregar colaboradores pendentes:", err);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchContributors = async (id: string) => {
    setLoadingContributors(true);
    try {
      const remoteContributors = await getAllRemoteResearchContributors(id);
      setContributors(remoteContributors.map(c => ({ ...c, _syncStatus: 'synced' })));
      await Promise.allSettled(
        remoteContributors.map(c => createItem('research_contributors', c))
      );
    } catch (err) {
      console.warn("[App] Falha ao buscar colaboradores do servidor. Usando IndexedDB local.", err);
      try {
        const localContributors = await getAllItems('research_contributors');
        setContributors(localContributors);
      } catch (errLocal) {
        console.error("[App] Falha ao carregar colaboradores locais:", errLocal);
        setError("Erro ao carregar colaboradores locais");
      }
    } finally {
      setLoadingContributors(false);
    }
  };

  const addResearchContributor = async (contributor: ResearchContributor): Promise<ResearchContributor> => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newContributor: LocalResearchContributor = {
      ...contributor,
      id: contributor.id || uuidv4(),
      _syncStatus: isOnline ? 'synced' : 'pending',
    };

    setContributors(prev => [...prev, newContributor]);
    try {
      const created = await createRemoteResearchContributor(contributor);
      await createItem('research_contributors', created);
      return created;
    } catch (err) {
      console.error("[App] Erro ao criar colaborador remotamente:", err);
      setError("Falha ao salvar no servidor. Salvo localmente para sincronizar depois.");
      await saveUnsyncedItem('research_contributors', newContributor);
      setUnSyncedContributors(prev => [...prev, newContributor]);
      return newContributor;
    }
  };

  const removeResearchContributor = async (params: { research_id: string; user_id: string; contributor_id: string }) => {
    const { research_id, user_id, contributor_id } = params;
    try {
      await deleteItem('research_contributors', contributor_id);
      setContributors(prev => prev.filter(c => c.id !== contributor_id));

      try {
        await deleteRemoteResearchContributor(research_id, user_id);
      } catch (err) {
        console.error("[App] Erro ao deletar colaborador remotamente:", err);
        setError("Falha ao sincronizar remoção.");
        await saveUnsyncedItem('research_contributors', { research_id, user_id, delete: true } as any);
        setUnSyncedContributors(prev => [...prev, { research_id, user_id, delete: true } as any]);
      }
    } catch (err) {
      console.error("[App] Erro ao deletar colaborador local:", err);
      setError("Erro ao deletar colaborador local");
    }
  };

  return {
    contributors,
    unSyncedContributors,
    loading: loadingContributors || loadingUnsynced,
    loadingContributors,
    loadingUnsynced,
    error,
    addResearchContributor,
    removeResearchContributor,
  };
}
