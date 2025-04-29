// src/repositories/server/DynamicSurveyApi.ts
import { DynamicSurvey } from '@/lib/types/indexeddb';
const baseUrl = '/api/surveys'; 
export async function getDynamicSurvey(research_id: string, survey_type: string): Promise<DynamicSurvey[]> {
  const url = `${baseUrl}?research_id=${encodeURIComponent(research_id)}&survey_type=${encodeURIComponent(survey_type)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar surveys de Dynamiculário');
  return res.json();
}

export async function createDynamicSurvey(data: DynamicSurvey): Promise<DynamicSurvey> {
  const res = await fetch(`${baseUrl}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar survey de Dynamiculário');
  return res.json();
}

export async function updateDynamicSurvey(data: DynamicSurvey): Promise<DynamicSurvey> {
  const res = await fetch(`${baseUrl}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar survey de Dynamiculário');
  return res.json();
}

export async function deleteDynamicSurvey(data: DynamicSurvey): Promise<void> {
  const res = await fetch(`${baseUrl}/delete`, {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao deletar survey de Dynamiculário');
}


