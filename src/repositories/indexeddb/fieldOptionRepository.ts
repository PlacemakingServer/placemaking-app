import {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
  } from './indexedDBService';
  import type { FieldOption } from '@/lib/types/indexeddb';
  
  const store = 'field_options' as const;
  
  export async function createFieldOption(data: FieldOption) {
    return createItem(store, data);
  }
  
  export async function getFieldOption(id: string) {
    return getItem(store, id);
  }
  
  export async function getAllFieldOptions() {
    return getAllItems(store);
  }
  
  export async function updateFieldOption(id: string, data: Partial<FieldOption>) {
    return updateItem(store, id, data);
  }
  
  export async function deleteFieldOption(id: string) {
    return deleteItem(store, id);
  }
  