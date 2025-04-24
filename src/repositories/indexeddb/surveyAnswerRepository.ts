import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { SurveyAnswer } from '@/lib/types/indexeddb';
  
  const store = 'survey_answers' as const;
  
  export async function createSurveyAnswer(answer: SurveyAnswer) {
    return createItem(store, answer);
  }
  
  export async function getSurveyAnswer(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllSurveyAnswers() {
    return getAllItems(store);
  }
  
  export async function updateSurveyAnswer(id: string, data: Partial<SurveyAnswer>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteSurveyAnswer(id: string) {
    return deleteItem(store, id);
  }
  