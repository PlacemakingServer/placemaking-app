// src/repositories/server/surveyAnswerApi.ts
import { SurveyAnswer } from '@/lib/types/indexeddb';

const baseUrl = '/api/survey-answers';

export async function getSurveyAnswers(): Promise<SurveyAnswer[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error('Erro ao buscar respostas de coleta');
  return res.json();
}

export async function createSurveyAnswer(data: SurveyAnswer): Promise<SurveyAnswer> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar resposta');
  return res.json();
}
