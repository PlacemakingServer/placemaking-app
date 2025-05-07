// lib/db.js
import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';

export const DB_NAME    = 'placemaking-db';
export const DB_VERSION = 2;                // 1 → 2  (novo store map_tiles)

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
  'unsynced_items',
  'map_tiles',            // NOVO
];

let dbPromise = null;
export function initPlacemakingDB() {
  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      for (const name of storeSchema) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      }
    },
  });
  return dbPromise;
}

/* ---------- AUTH helpers ---------- */
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

/* ---------- UNSYNCED helpers ---------- */
export async function saveUnsyncedItem(type, payload) {
  const db = await initPlacemakingDB();
  await db.put('unsynced_items', { id: uuidv4(), type, payload });
}
export async function getUnsyncedItems() {
  const db = await initPlacemakingDB();
  return db.getAll('unsynced_items');
}
export async function deleteUnsyncedItem(id) {
  const db = await initPlacemakingDB();
  return db.delete('unsynced_items', id);
}
