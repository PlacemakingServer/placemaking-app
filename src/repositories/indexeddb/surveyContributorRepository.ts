import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { SurveyContributor } from '@/lib/types/indexeddb';
  
  const store = 'survey_contributors' as const;
  
  export async function createSurveyContributor(data: SurveyContributor) {
    return createItem(store, data);
  }
  
  export async function getSurveyContributor(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllSurveyContributors() {
    return getAllItems(store);
  }
  
  export async function updateSurveyContributor(id: string, data: Partial<SurveyContributor>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteSurveyContributor(id: string) {
    return deleteItem(store, id);
  }
  