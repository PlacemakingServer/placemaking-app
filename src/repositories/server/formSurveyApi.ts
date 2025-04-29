// src/repositories/server/formSurveyApi.ts
import { FormSurvey } from '@/lib/types/indexeddb';
const baseUrl = '/api/surveys'; 
export async function getFormSurvey(research_id: string, survey_type: string): Promise<FormSurvey> {
  const url = `${baseUrl}?research_id=${encodeURIComponent(research_id)}&survey_type=${encodeURIComponent(survey_type)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar surveys de formulário');
  return res.json();
}

export async function createFormSurvey(data: FormSurvey): Promise<FormSurvey> {
  const res = await fetch(`${baseUrl}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar survey de formulário');
  return res.json();
}

export async function updateFormSurvey(data: FormSurvey): Promise<FormSurvey> {
  const res = await fetch(`${baseUrl}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar survey de formulário');
  return res.json();
}

export async function deleteFormSurvey(data: FormSurvey): Promise<void> {
  const res = await fetch(`${baseUrl}/delete`, {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao deletar survey de formulário');
}


