// src/repositories/indexeddb/indexedDBService.ts
import { openDB, IDBPDatabase } from 'idb';
import type { StoreTypes } from '@/lib/types/indexeddb';

const DB_NAME = 'placemaking-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

export function getDB(): Promise<IDBPDatabase<any>> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const store of Object.keys(storeSchema)) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        }
        if (!db.objectStoreNames.contains('unsynced_data')) {
          db.createObjectStore('unsynced_data', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}


export const storeSchema: Record<keyof StoreTypes, { keyPath: keyof any }> = {
  users: { keyPath: 'id' },
  fields: { keyPath: 'id' },
  researches: { keyPath: 'id' },
  survey_time_ranges: { keyPath: 'id' },
  survey_regions: { keyPath: 'id' },
  survey_group: { keyPath: 'id' },
  survey_contributors: { keyPath: 'id' },
  survey_answers: { keyPath: 'id' },
  static_surveys: { keyPath: 'id' },
  form_surveys: { keyPath: 'id' },
  dynamic_surveys: { keyPath: 'id' },
  research_contributors: { keyPath: 'id' },
  input_types: { keyPath: 'id' },
  field_options: { keyPath: 'id' },
  unsynced_data: { keyPath: 'id' },
  map_tiles: { keyPath: 'id' },
};

export async function createItem<K extends keyof StoreTypes>(store: K, data: StoreTypes[K]): Promise<void> {
  const db = await getDB();
  await db.put(store, data);
}

export async function getItem<K extends keyof StoreTypes>(store: K, id: string): Promise<StoreTypes[K] | undefined> {
  const db = await getDB();
  return db.get(store, id);
}

export async function getAllItems<K extends keyof StoreTypes>(store: K): Promise<StoreTypes[K][]> {
  const db = await getDB();
  return db.getAll(store);
}

export async function updateItem<T = any>(store: string, id: string, data: Partial<T>): Promise<void> {
  const db = await getDB();
  const current = await db.get(store, id);
  if (current) {
    await db.put(store, { ...current, ...data });
  }
}

export async function deleteItem<K extends keyof StoreTypes>(store: K, id: string): Promise<void> {
  const db = await getDB();
  await db.delete(store, id);
}
