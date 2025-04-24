// src/repositories/server/surveyTimeRangeApi.ts
import { SurveyTimeRange } from '@/lib/types/indexeddb';

const baseUrl = '/api/survey-time-ranges';

export async function getSurveyTimeRanges(): Promise<SurveyTimeRange[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error('Erro ao buscar faixas de horário');
  return res.json();
}

export async function createSurveyTimeRange(data: SurveyTimeRange): Promise<SurveyTimeRange> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar faixa de horário');
  return res.json();
}
