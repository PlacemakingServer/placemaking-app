import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { ResearchContributor } from '@/lib/types/indexeddb';
  
  const store = 'research_contributors' as const;
  
  export async function createResearchContributor(data: ResearchContributor) {
    return createItem(store, data);
  }
  
  export async function getResearchContributor(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllResearchContributors() {
    return getAllItems(store);
  }
  
  export async function updateResearchContributor(id: string, data: Partial<ResearchContributor>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteResearchContributor(id: string) {
    return deleteItem(store, id);
  }
  