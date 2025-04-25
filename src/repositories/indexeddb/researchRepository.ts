import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { Research } from '@/lib/types/indexeddb';
  import { LocalResearch } from '@/hooks/useResearches'; 

  const store = 'researches' as const;
  
  export async function createResearch(research: Research) {
    console.log('Creating research local:', research);
    return createItem(store, research);
  }
  
  export async function getResearch(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllResearchs() {
    return getAllItems(store);
  }
  
  export async function updateResearch(id: string, data: Partial<LocalResearch>) {
    return updateItem('researches', id, data);
  }
  
  export async function deleteResearch(id: string) {
    return deleteItem(store, id);
  }
  