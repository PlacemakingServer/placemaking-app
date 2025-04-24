// src/repositories/server/dynamicSurveyApi.ts
import { DynamicSurvey } from '@/lib/types/indexeddb';

const baseUrl = '/api/surveys/dynamic'; // ⚠️ Este endpoint ainda NÃO está implementado em /pages/api

export async function getDynamicSurveys(): Promise<DynamicSurvey[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error('Erro ao buscar surveys dinâmicos');
  return res.json();
}

export async function createDynamicSurvey(data: DynamicSurvey): Promise<DynamicSurvey> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar survey dinâmico');
  return res.json();
}
