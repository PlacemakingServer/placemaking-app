// src/repositories/server/inputTypeApi.ts
import { InputType } from '@/lib/types/indexeddb';

const baseUrl = '/api/input-types';

export async function getInputTypes(): Promise<InputType[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error('Erro ao buscar tipos de input');
  return res.json();
}
