import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { Research } from '@/lib/types/indexeddb';
  
  const store = 'researches' as const;
  
  export async function createResearch(research: Research) {
    return createItem(store, research);
  }
  
  export async function getResearch(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllResearchs() {
    return getAllItems(store);
  }
  
  export async function updateResearch(id: string, data: Partial<Research>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteResearch(id: string) {
    return deleteItem(store, id);
  }
  