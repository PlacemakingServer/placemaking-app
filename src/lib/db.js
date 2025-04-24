// lib/db.js
import { openDB } from 'idb';

export const DB_NAME = 'placemaking-db';
export const DB_VERSION = 1;

const storeSchema = [
  'auth',
  'users',
  'activity_answers',
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
  'field_options'
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

// AUTH MANAGEMENT
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