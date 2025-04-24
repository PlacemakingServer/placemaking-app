// src/repositories/server/surveyGroupApi.ts
import { SurveyGroup } from '@/lib/types/indexeddb';

const baseUrl = '/api/survey-groups';

export async function getSurveyGroups(): Promise<SurveyGroup[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error('Erro ao buscar grupos da coleta');
  return res.json();
}

export async function createSurveyGroup(data: SurveyGroup): Promise<SurveyGroup> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar grupo');
  return res.json();
}
