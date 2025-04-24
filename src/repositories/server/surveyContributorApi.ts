import { SurveyContributor } from '@/lib/types/indexeddb';

const baseUrl = '/api/survey_contributors';

export async function getSurveyContributors(survey_id: string, survey_type: string): Promise<SurveyContributor[]> {
  const res = await fetch(baseUrl + '?survey_id=' + survey_id + '&survey_type=' + survey_type);
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

export async function deleteSurveyContributor(data: Pick<SurveyContributor, 'survey_id' | 'survey_type' | 'user_id'>): Promise<{ message: string }> {
  const res = await fetch(`${baseUrl}/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao deletar colaborador');
  return res.json();
}
