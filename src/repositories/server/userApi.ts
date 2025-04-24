// src/repositories/server/userApi.ts

import { User } from '@/lib/types/indexeddb';

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Erro ao buscar usuários');
  const data = await res.json();
  return data;
}

export async function getUserById(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar usuário');
  const { user } = await res.json();
  return user;
}

export async function createUser(data: Partial<User>): Promise<User> {
  const res = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar usuário');
  return res.json();
}

export async function updateUser(data: Partial<User>): Promise<User> {
  const res = await fetch('/api/users/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar usuário');
  return res.json();
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  const res = await fetch('/api/users/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Erro ao deletar usuário');
  return res.json();
}