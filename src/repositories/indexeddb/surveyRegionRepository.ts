import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { SurveyRegion } from '@/lib/types/indexeddb';
  
  const store = 'survey_regions' as const;
  
  export async function createSurveyRegion(data: SurveyRegion) {
    return createItem(store, data);
  }
  
  export async function getSurveyRegion(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllSurveyRegions() {
    return getAllItems(store);
  }
  
  export async function updateSurveyRegion(id: string, data: Partial<SurveyRegion>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteSurveyRegion(id: string) {
    return deleteItem(store, id);
  }
  