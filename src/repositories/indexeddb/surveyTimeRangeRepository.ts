// src/repositories/indexeddb/surveyTimeRangeRepository.ts

import { SurveyTimeRange } from '@/lib/types/indexeddb';
import { getAllItems, createItem, deleteItem } from './indexedDBService';

export async function getAllSurveyTimeRanges(): Promise<SurveyTimeRange[]> {
  return await getAllItems('survey_time_ranges');
}

export async function createSurveyTimeRange(range: SurveyTimeRange) {
  return await createItem('survey_time_ranges', range);
}

export async function deleteSurveyTimeRange(id: string) {
  return await deleteItem('survey_time_ranges', id);
}
