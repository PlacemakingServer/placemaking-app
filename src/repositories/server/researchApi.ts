// src/repositories/server/researchApi.ts
import { Research } from '@/lib/types/indexeddb';

const baseUrl = '/api/researches';

export async function getResearches(): Promise<Research[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error('Erro ao buscar pesquisas');
  return res.json();
}

export async function getResearchById(id: string): Promise<Research> {
  const res = await fetch(`${baseUrl}/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar pesquisa');
  const { research } = await res.json();
  return research;
}

export async function createResearch(data: Research): Promise<Research> {
  const res = await fetch(`${baseUrl}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar pesquisa');
  return res.json();
}

export async function updateResearch(data: Research): Promise<Research> {
  const res = await fetch(`${baseUrl}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar pesquisa');
  return res.json();
}

export async function deleteResearch(id: string): Promise<{ message: string }> {
  const res = await fetch(`${baseUrl}/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Erro ao deletar pesquisa');
  return res.json();
}
