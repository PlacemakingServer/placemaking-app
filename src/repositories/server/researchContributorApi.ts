import { ResearchContributor } from '@/lib/types/indexeddb';

const baseUrl = '/api/contributors'; 

export async function getResearchContributors(research_id: string): Promise<ResearchContributor[]> {
  const res = await fetch(`${baseUrl}?research_id=${research_id}`);
  if (!res.ok) throw new Error('Erro ao buscar colaboradores da pesquisa');
  return res.json();
}

export async function createResearchContributor(data: ResearchContributor): Promise<ResearchContributor> {
  const res = await fetch(`${baseUrl}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar colaborador da pesquisa');
  return res.json();
}

export async function deleteResearchContributor(research_id: string, user_id: string): Promise<{ message: string }> {
  const res = await fetch(`${baseUrl}/delete`, {
    method: 'DELETE',
    body: JSON.stringify({ user_id, research_id }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Erro ao deletar colaborador da pesquisa');
  return res.json();
}
