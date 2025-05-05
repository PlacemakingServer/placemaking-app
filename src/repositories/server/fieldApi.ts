// repositories/server/fieldApi.ts
import { Field } from '@/lib/types/indexeddb';

const baseUrl = '/api/fields';

export async function getFields(survey_id: string, survey_type: string): Promise<Field[]> {
  const url = `${baseUrl}?survey_id=${survey_id}&survey_type=${survey_type}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar campos');
  const data = await res.json();
  return data || [];
}

export async function createField(
  survey_id: string,
  survey_type: string,
  payload: Partial<Field>
): Promise<Field> {
  const url = `${baseUrl}?survey_id=${survey_id}&survey_type=${survey_type}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao criar campo');
  const data = await res.json();
  return data;
}

export async function updateField(
  field_id: string,
  survey_id: string,
  survey_type: string,
  payload: Partial<Field>
): Promise<Field> {
  const url = `${baseUrl}?field_id=${field_id}&survey_id=${survey_id}&survey_type=${survey_type}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao atualizar campo');
  const data = await res.json();
  return data.field;
}

export async function deleteField(
  field_id: string,
  survey_id: string,
  survey_type: string
): Promise<{ message: string }> {
  const url = `${baseUrl}?field_id=${field_id}&survey_id=${survey_id}&survey_type=${survey_type}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Erro ao deletar campo');
  return res.json();
}

