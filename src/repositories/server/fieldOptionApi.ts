import { FieldOption } from '@/lib/types/indexeddb';

const baseUrl = '/api/field_options';

export async function getFieldOptions(field_id: string): Promise<FieldOption[]> {
  const res = await fetch(`${baseUrl}?field_id=${field_id}`);
  if (!res.ok) throw new Error('Erro ao buscar opções do campo');
  const data = await res.json();
  return data.options || [];
}

export async function createFieldOption(field_id: string, data: Partial<FieldOption>): Promise<FieldOption> {
  const res = await fetch(`${baseUrl}?field_id=${field_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar opção do campo');
  const response = await res.json();
  return response.option;
}

export async function updateFieldOption(
  field_id: string,
  option_id: string,
  data: Partial<FieldOption>
): Promise<FieldOption> {
  const res = await fetch(`${baseUrl}?field_id=${field_id}&option_id=${option_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar opção do campo');
  const response = await res.json();
  return response.option;
}

export async function deleteFieldOption(field_id: string, option_id: string): Promise<{ message: string }> {
  const res = await fetch(`${baseUrl}?field_id=${field_id}&option_id=${option_id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Erro ao deletar opção do campo');
  return res.json();
}
