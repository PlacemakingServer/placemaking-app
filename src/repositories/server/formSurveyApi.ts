// src/repositories/server/formSurveyApi.ts
import { FormSurvey } from '@/lib/types/indexeddb';

const baseUrl = '/api/surveys'; // ⚠️ Este endpoint ainda NÃO está implementado em /pages/api

export async function getFormSurveys(): Promise<FormSurvey[]> {
  const res = await fetch(baseUrl);
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
  const res = await fetch(`${baseUrl}/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar survey de formulário');
  return res.json();
}

export async function deleteFormSurvey(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar survey de formulário');
}
export async function getFormSurveyByResearchId(research_id: string): Promise<FormSurvey[]> {
  const res = await fetch(`${baseUrl}/research/${research_id}`);
  if (!res.ok) throw new Error('Erro ao buscar surveys de formulário');
  return res.json();
}
