import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { Field } from '@/lib/types/indexeddb';
  
  const store = 'fields' as const;
  
  export async function createField(field: Field) {
    return createItem(store, field);
  }
  
  export async function getField(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllFields() {
    return getAllItems(store);
  }
  
  export async function updateField(id: string, data: Partial<Field>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteField(id: string) {
    return deleteItem(store, id);
  }
  