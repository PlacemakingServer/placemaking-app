import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { FormSurvey } from '@/lib/types/indexeddb';
  
  const store = 'form_surveys' as const;
  
  export async function createFormSurvey(data: FormSurvey) {
    return createItem(store, data);
  }
  
  export async function getFormSurvey(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllFormSurveys() {
    return getAllItems(store);
  }
  
  export async function updateFormSurvey(id: string, data: Partial<FormSurvey>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteFormSurvey(id: string) {
    return deleteItem(store, id);
  }