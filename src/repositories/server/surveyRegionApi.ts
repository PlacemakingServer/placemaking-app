// src/repositories/server/surveyRegionApi.ts
import { SurveyRegion } from '@/lib/types/indexeddb';

const baseUrl = '/api/survey-regions';

export async function getSurveyRegions(): Promise<SurveyRegion[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error('Erro ao buscar regiões da coleta');
  return res.json();
}

export async function createSurveyRegion(data: SurveyRegion): Promise<SurveyRegion> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar região da coleta');
  return res.json();
}
