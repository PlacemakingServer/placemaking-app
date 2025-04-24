// src/repositories/server/staticSurveyApi.ts
import { StaticSurvey } from '@/lib/types/indexeddb';

const baseUrl = '/api/surveys/static'; // ⚠️ Este endpoint ainda NÃO está implementado em /pages/api

export async function getStaticSurveys(): Promise<StaticSurvey[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error('Erro ao buscar surveys estáticos');
  return res.json();
}

export async function createStaticSurvey(data: StaticSurvey): Promise<StaticSurvey> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar survey estático');
  return res.json();
}
