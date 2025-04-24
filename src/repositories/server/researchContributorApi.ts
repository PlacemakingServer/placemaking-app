// src/repositories/server/researchContributorApi.ts
import { ResearchContributor } from '@/lib/types/indexeddb';

const baseUrl = '/api/research_contributors'; // ⚠️ Este endpoint ainda NÃO está implementado em /pages/api

export async function getResearchContributors(research_id: string): Promise<ResearchContributor[]> {
  const res = await fetch(`${baseUrl}?research_id=${research_id}`);
  if (!res.ok) throw new Error('Erro ao buscar colaboradores da pesquisa');
  return res.json();
}

export async function createResearchContributor(data: ResearchContributor): Promise<ResearchContributor> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar colaborador da pesquisa');
  return res.json();
}
