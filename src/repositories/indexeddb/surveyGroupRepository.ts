import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { SurveyGroup } from '@/lib/types/indexeddb';
  
  const store = 'survey_group' as const;
  
  export async function createSurveyGroup(data: SurveyGroup) {
    return createItem(store, data);
  }
  
  export async function getSurveyGroup(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllSurveyGroups() {
    return getAllItems(store);
  }
  
  export async function updateSurveyGroup(id: string, data: Partial<SurveyGroup>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteSurveyGroup(id: string) {
    return deleteItem(store, id);
  }
  