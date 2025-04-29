// src/repositories/server/StaticSurveyApi.ts
import { StaticSurvey } from '@/lib/types/indexeddb';
const baseUrl = '/api/surveys'; 
export async function getStaticSurveys(research_id: string, survey_type: string): Promise<StaticSurvey[]> {
  const url = `${baseUrl}?research_id=${encodeURIComponent(research_id)}&survey_type=${encodeURIComponent(survey_type)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar surveys de Staticulário');
  return res.json();
}

export async function createStaticSurvey(data: StaticSurvey): Promise<StaticSurvey> {
  const res = await fetch(`${baseUrl}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar survey de Staticulário');
  return res.json();
}

export async function updateStaticSurvey(data: StaticSurvey): Promise<StaticSurvey> {
  const res = await fetch(`${baseUrl}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar survey de Staticulário');
  return res.json();
}

export async function deleteStaticSurvey(data: StaticSurvey): Promise<void> {
  const res = await fetch(`${baseUrl}/delete`, {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao deletar survey de Staticulário');
}



export async function getStaticSurveyByResearchId(
  research_id: string,
  survey_type: string
): Promise<StaticSurvey[]> {
  const url = `${baseUrl}?research_id=${encodeURIComponent(research_id)}&survey_type=${encodeURIComponent(survey_type)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar surveys de Staticulário');

  return res.json();
}
