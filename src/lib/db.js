// lib/db.js
import { openDB } from 'idb';
export const DB_NAME = 'placemaking-db';
export const DB_VERSION = 1;
import { v4 as uuidv4 } from 'uuid'; 

const storeSchema = [
  'auth',
  'users',
  'fields',
  'researches',
  'survey_time_ranges',
  'survey_regions',
  'survey_group',
  'survey_contributors',
  'survey_answers',
  'static_surveys',
  'form_surveys',
  'dynamic_surveys',
  'research_contributors',
  'input_types',
  'field_options',
  'unsynced_items'
];

export async function initPlacemakingDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      for (const storeName of storeSchema) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      }
    },
  });
}
export async function saveAuth(auth) {
  const db = await initPlacemakingDB();
  await db.put('auth', { ...auth, id: 'current' });
}

export async function getAuth() {
  const db = await initPlacemakingDB();
  return db.get('auth', 'current');
}

export async function deleteAuth() {
  const db = await initPlacemakingDB();
  return db.delete('auth', 'current');
}



// SALVAR ITEM NÃO SINCRONIZADO
export async function saveUnsyncedItem(type, payload) {
  const db = await initPlacemakingDB();
  const id = uuidv4();
  await db.put('unsynced_items', { id, type, payload });
}

// PEGAR TODOS ITENS NÃO SINCRONIZADOS
export async function getUnsyncedItems() {
  const db = await initPlacemakingDB();
  return db.getAll('unsynced_items');
}

// DELETAR ITEM JÁ SINCRONIZADO
export async function deleteUnsyncedItem(id) {
  const db = await initPlacemakingDB();
  return db.delete('unsynced_items', id);
}
