// src/repositories/server/surveyRegionApi.ts
import { SurveyRegion } from '@/lib/types/indexeddb';

const baseUrl = '/api/survey-regions';

// Busca todas as regiões de uma survey específica
export async function getSurveyRegions(survey_id: string): Promise<SurveyRegion[]> {
  const res = await fetch(`${baseUrl}?survey_id=${encodeURIComponent(survey_id)}`);
  if (!res.ok) throw new Error('Erro ao buscar regiões da coleta');
  return res.json();
}

// Cria uma nova região
export async function createSurveyRegion(data: SurveyRegion): Promise<SurveyRegion> {
  const res = await fetch(`${baseUrl}?survey_id=${encodeURIComponent(data.survey_id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar região da coleta');
  return res.json();
}

// Deleta uma região
export async function deleteSurveyRegion(id: string, survey_id: string): Promise<void> {
  const res = await fetch(`${baseUrl}?survey_id=${encodeURIComponent(survey_id)}&id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar região da coleta');
}
