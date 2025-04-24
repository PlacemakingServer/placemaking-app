import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { SurveyTimeRange } from '@/lib/types/indexeddb';
  
  const store = 'survey_time_ranges' as const;
  
  export async function createSurveyTimeRange(data: SurveyTimeRange) {
    return createItem(store, data);
  }
  
  export async function getSurveyTimeRange(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllSurveyTimeRanges() {
    return getAllItems(store);
  }
  
  export async function updateSurveyTimeRange(id: string, data: Partial<SurveyTimeRange>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteSurveyTimeRange(id: string) {
    return deleteItem(store, id);
  }
  