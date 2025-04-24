import {
  createItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
} from "./indexedDBService";
import type { User } from "@/lib/types/indexeddb";

const store = "users" as const;

export async function createUser(user: User) {
  return createItem(store, user);
}

export async function getUser(id: string) {
  return getItem(store, id);
}

export async function getAllUsers() {
  return getAllItems(store);
}

export async function updateUser(id: string, data: Partial<User>) {
  return updateItem(store, id, data);
}

export async function deleteUser(id: string) {
  return deleteItem(store, id);
}
