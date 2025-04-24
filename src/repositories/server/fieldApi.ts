import { Field } from '@/lib/types/indexeddb';

const baseUrl = '/api/fields';

export async function getFields(survey_id: string, survey_type: string): Promise<Field[]> {
  const url = `${baseUrl}?survey_id=${survey_id}&survey_type=${survey_type}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar campos');
  return res.json();
}

export async function createField(data: Field): Promise<Field> {
  const res = await fetch(`${baseUrl}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar campo');
  return res.json();
}

export async function updateField(data: Field): Promise<Field> {
  const res = await fetch(`${baseUrl}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar campo');
  return res.json();
}

export async function deleteField(params: { field_id: string, survey_id: string, survey_type: string }): Promise<{ message: string }> {
  const res = await fetch(`${baseUrl}/delete?` + new URLSearchParams(params), {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar campo');
  return res.json();
}