import { SurveyContributor } from '@/lib/types/indexeddb';

const baseUrl = '/api/survey_contributors';

export async function getSurveyContributors(survey_id: string): Promise<SurveyContributor[]> {
  const new_url = `${baseUrl}?survey_id=${encodeURIComponent(survey_id)}`;
  const res = await fetch(new_url);
  if (!res.ok) throw new Error('Erro ao buscar colaboradores da coleta');
  return res.json();
}

export async function createSurveyContributor(data: SurveyContributor): Promise<SurveyContributor> {
  const res = await fetch(`${baseUrl}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar colaborador da coleta');
  return res.json();
}

export async function deleteSurveyContributor(survey_id: string, contributor_id: string): Promise<{ message: string }> {
  const res = await fetch(`${baseUrl}/delete?survey_id=${encodeURIComponent(survey_id)}&contributor_id=${encodeURIComponent(contributor_id)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Erro ao deletar colaborador');
  return res.json();
}
