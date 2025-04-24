// src/repositories/server/fieldOptionApi.ts
import { FieldOption } from '@/lib/types/indexeddb';

const baseUrl = '/api/field-options'; // ⚠️ Este endpoint ainda NÃO está implementado em /pages/api

export async function getFieldOptions(field_id: string): Promise<FieldOption[]> {
  const res = await fetch(`${baseUrl}?field_id=${field_id}`);
  if (!res.ok) throw new Error('Erro ao buscar opções do campo');
  return res.json();
}

export async function createFieldOption(data: FieldOption): Promise<FieldOption> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar opção do campo');
  return res.json();
}
