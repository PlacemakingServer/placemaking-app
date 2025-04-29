// src/hooks/useSurveyContributors.ts

import { useEffect, useState } from 'react';
import { SurveyContributor } from '@/lib/types/indexeddb';
import {
  createSurveyContributor as createRemoteSurveyContributor,
  getSurveyContributors as getAllRemoteSurveyContributors,
  deleteSurveyContributor as deleteRemoteSurveyContributor,
} from '@/repositories/server/surveyContributorApi';
import {
  createItem,
  getAllItems,
  deleteItem,
} from '@/repositories/indexeddb/indexedDBService';
import { saveUnsyncedItem, getUnsyncedItems } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

type LocalSurveyContributor = SurveyContributor & {
  _syncStatus?: 'pending' | 'synced' | 'error';
};

export function useSurveyContributors(surveyId?: string) {
  const [contributors, setContributors] = useState<LocalSurveyContributor[]>([]);
  const [unSyncedContributors, setUnSyncedContributors] = useState<LocalSurveyContributor[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedContributors();
  }, []);

  useEffect(() => {
    if (surveyId) {
      fetchContributors(surveyId);
    } else {
      setContributors([]);
      setLoadingContributors(false);
    }
  }, [surveyId]);

  const fetchUnsyncedContributors = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const pending = unsynced
        .filter((item) => item.store === 'survey_contributors')
        .map((item) => item.payload as LocalSurveyContributor);
      setUnSyncedContributors(pending);
    } catch (err) {
      console.error('[App] Erro ao carregar colaboradores pendentes:', err);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchContributors = async (id: string) => {
    setLoadingContributors(true);
    try {
      const remoteContributors = await getAllRemoteSurveyContributors(id);
      setContributors(remoteContributors.map(c => ({ ...c, _syncStatus: 'synced' })));

      await Promise.allSettled(
        remoteContributors.map(c => createItem('survey_contributors', c))
      );
    } catch (err) {
      console.warn('[App] Falha ao buscar colaboradores do servidor. Usando IndexedDB local.', err);
      try {
        const localContributors = await getAllItems('survey_contributors');
        const filtered = localContributors.filter(c => c.survey_id === id);
        setContributors(filtered);
      } catch (errLocal) {
        console.error('[App] Falha ao carregar colaboradores locais:', errLocal);
        setError('Erro ao carregar colaboradores locais');
      }
    } finally {
      setLoadingContributors(false);
    }
  };

  const addSurveyContributor = async (contributor: SurveyContributor): Promise<SurveyContributor> => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newContributor: LocalSurveyContributor = {
      ...contributor,
      id: contributor.id || uuidv4(),
      _syncStatus: isOnline ? 'synced' : 'pending',
    };

    setContributors(prev => [...prev, newContributor]);

    try {
      const created = await createRemoteSurveyContributor(contributor);
      await createItem('survey_contributors', created);
      return created;
    } catch (err) {
      console.error('[App] Erro ao criar colaborador remotamente:', err);
      setError('Falha ao salvar no servidor. Salvo localmente para sincronizar depois.');
      await saveUnsyncedItem('survey_contributors', newContributor);
      setUnSyncedContributors(prev => [...prev, newContributor]);
      return newContributor;
    }
  };

  const removeSurveyContributor = async (params: {
    survey_id: string;
    contributor_id: string;
  }) => {
    const { survey_id, contributor_id } = params;
    try {
      await deleteItem('survey_contributors', contributor_id);
      setContributors(prev => prev.filter(c => c.id !== contributor_id));

      try {
        await deleteRemoteSurveyContributor(survey_id, contributor_id);
      } catch (err) {
        console.error('[App] Erro ao deletar colaborador remotamente:', err);
        setError('Falha ao sincronizar remoção.');
        await saveUnsyncedItem('survey_contributors', {
          survey_id,
          delete: true,
        } as any);
        setUnSyncedContributors(prev => [
          ...prev,
          { survey_id, delete: true } as any,
        ]);
      }
    } catch (err) {
      console.error('[App] Erro ao deletar colaborador local:', err);
      setError('Erro ao deletar colaborador local');
    }
  };

  return {
    contributors,
    unSyncedContributors,
    loading: loadingContributors || loadingUnsynced,
    loadingContributors,
    loadingUnsynced,
    error,
    addSurveyContributor,
    removeSurveyContributor,
  };
}
