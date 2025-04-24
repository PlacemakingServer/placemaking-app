import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { InputType } from '@/lib/types/indexeddb';
  
  const store = 'input_types' as const;
  
  export async function createInputType(data: InputType) {
    return createItem(store, data);
  }
  
  export async function getInputType(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllInputTypes() {
    return getAllItems(store);
  }
  
  export async function updateInputType(id: string, data: Partial<InputType>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteInputType(id: string) {
    return deleteItem(store, id);
  }
  