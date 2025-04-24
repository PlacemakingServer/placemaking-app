// src/repositories/server/formSurveyApi.ts
import { FormSurvey } from '@/lib/types/indexeddb';

const baseUrl = '/api/surveys/form'; // ⚠️ Este endpoint ainda NÃO está implementado em /pages/api

export async function getFormSurveys(): Promise<FormSurvey[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error('Erro ao buscar surveys de formulário');
  return res.json();
}

export async function createFormSurvey(data: FormSurvey): Promise<FormSurvey> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar survey de formulário');
  return res.json();
}
