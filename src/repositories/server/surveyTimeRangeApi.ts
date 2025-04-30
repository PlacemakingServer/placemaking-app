// src/repositories/server/surveyTimeRangeApi.ts
import { SurveyTimeRange } from '@/lib/types/indexeddb';

const baseUrl = '/api/survey-time-ranges';

export async function getSurveyTimeRanges(surveyId: string): Promise<SurveyTimeRange[]> {
  const res = await fetch(`${baseUrl}?survey_id=${surveyId}`);
  if (!res.ok) throw new Error('Erro ao buscar faixas de horário');
  return res.json();
}

export async function createSurveyTimeRange(
  surveyId: string,
  surveyType: string,
  data: Omit<SurveyTimeRange, 'id'>
): Promise<SurveyTimeRange> {
  const res = await fetch(`${baseUrl}?survey_id=${surveyId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      survey_type: surveyType,
    }),
  });
  if (!res.ok) throw new Error('Erro ao criar faixa de horário');
  return res.json();
}

export async function deleteSurveyTimeRange(surveyId: string, id: string): Promise<void> {
  const res = await fetch(`${baseUrl}?survey_id=${surveyId}&id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar faixa de horário');
}
