// src/hooks/useUsers.ts
import { useEffect, useState } from "react";
import { User } from "@/lib/types/indexeddb";
import { createUser, getUsers } from "@/repositories/server/userApi";
import {
  createItem,
  getAllItems,
} from "@/repositories/indexeddb/indexedDBService";

export function useUsers() {
  type LocalUser = User & { _syncStatus?: "pending" | "synced" | "error" };
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const isOnline = typeof window !== "undefined" && navigator.onLine;
        if (isOnline) {
          const remoteUsers = await getUsers();
          setUsers(remoteUsers);
        } else {
          const localUsers = await getAllItems("users");
          setUsers(localUsers);
        }
      } catch (err) {
        setError("Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addUser = async (user: User) => {
    const isOnline = typeof window !== "undefined" && navigator.onLine;
    const newUser: LocalUser = {
      ...user,
      _syncStatus: isOnline ? "synced" : "pending",
    };

    setUsers((prev) => [...prev, newUser]);

    try {
      await createItem("users", newUser);
      if (isOnline) {
        await createUser(user);
      }
    } catch {
      const errorUser: LocalUser = { ...user, _syncStatus: "error" };
      await createItem("users", errorUser);
      setError("Erro ao salvar usuário");
    }
  };

  return { users, loading, error, addUser };
}
