import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { DynamicSurvey } from '@/lib/types/indexeddb';
  
  const store = 'dynamic_surveys' as const;
  
  export async function createDynamicSurvey(data: DynamicSurvey) {
    return createItem(store, data);
  }
  
  export async function getDynamicSurvey(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllDynamicSurveys() {
    return getAllItems(store);
  }
  
  export async function updateDynamicSurvey(id: string, data: Partial<DynamicSurvey>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteDynamicSurvey(id: string) {
    return deleteItem(store, id);
  }