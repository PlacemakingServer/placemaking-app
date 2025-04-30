// src/repositories/server/surveyContributorApi.ts
import { SurveyContributor } from '@/lib/types/indexeddb';

const baseUrl = '/api/survey-contributors';

export async function getSurveyContributors(survey_id: string): Promise<SurveyContributor[]> {
  const url = `${baseUrl}?survey_id=${encodeURIComponent(survey_id)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar colaboradores da coleta');
  return res.json();
}

export async function createSurveyContributor(data: SurveyContributor): Promise<SurveyContributor> {

  console.log('Creating survey contributor:', data);
  const res = await fetch(`${baseUrl}?survey_id=${encodeURIComponent(data.survey_id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      survey_type: data.survey_type,
      user_id: data.user_id,
      instruction: data.instruction,
    }),
  });
  if (!res.ok) throw new Error('Erro ao criar colaborador da coleta');
  return res.json();
}

export async function deleteSurveyContributor(survey_id: string, contributor_id: string): Promise<{ message: string }> {
  const url = `${baseUrl}?survey_id=${encodeURIComponent(survey_id)}&contributor_id=${encodeURIComponent(contributor_id)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Erro ao deletar colaborador');
  return res.json();
}
