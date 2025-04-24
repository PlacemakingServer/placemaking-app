import {
  createItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
} from './indexedDBService';
import type { StaticSurvey } from '@/lib/types/indexeddb';

const store = 'static_surveys' as const;

export async function createStaticSurvey(data: StaticSurvey) {
  return createItem(store, data);
}

export async function getStaticSurvey(id: string) {
  return getItem(store, id);
}

export async function getAllStaticSurveys() {
  return getAllItems(store);
}

export async function updateStaticSurvey(id: string, data: Partial<StaticSurvey>) {
  return updateItem(store, id, data);
}

export async function deleteStaticSurvey(id: string) {
  return deleteItem(store, id);
}