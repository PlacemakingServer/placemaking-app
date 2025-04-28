
import { useEffect, useState } from "react";
import { User } from "@/lib/types/indexeddb";
import { 
  createUser as createRemoteUser,
  updateUser as updateRemoteUser,
  deleteUser as deleteRemoteUser,
  getUsers as getAllRemoteUsers,
  getUserById as getRemoteUserById
} from "@/repositories/server/userApi";
import {
  createUser as createLocalUser,
  updateUser as updateLocalUser,
  deleteUser as deleteLocalUser,
  getAllUsers as getAllLocalUsers,
  getUser as getLocalUser
} from "@/repositories/indexeddb/userRepository"; 
import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export function useUsers(especifico: boolean = false, id?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [unSyncedUsers, setUnSyncedUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedUsers();
  }, []);

  useEffect(() => {
    if (especifico) {
      if (id) {
        fetchUserById(id);
      } else {
        setUserData(null);
        setLoadingUsers(false);
      }
    } else {
      fetchUsers();
    }
  }, [especifico, id]);

  const fetchUnsyncedUsers = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const usersPending = unsynced
        .filter((item) => item.store === "users")
        .map((item) => item.payload as User);
      setUnSyncedUsers(usersPending);
    } catch (error) {
      console.error("[App] Erro ao carregar usuários pendentes:", error);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const remoteUsers = await getAllRemoteUsers();
      setUsers(remoteUsers);
      await Promise.allSettled(remoteUsers.map((user) => createLocalUser(user)));
    } catch (err) {
      console.warn("[App] Falha ao buscar usuários do servidor. Usando IndexedDB local.", err);
      try {
        const localUsers = await getAllLocalUsers();
        setUsers(localUsers);
      } catch (errLocal) {
        console.error("[App] Falha ao carregar usuários locais:", errLocal);
        setError("Erro ao carregar usuários locais");
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserById = async (userId: string) => {
    setLoadingUsers(true);
    try {
      const local = await getLocalUser(userId);
      if (local) {
        setUserData(local);
      } else {
        throw new Error("Usuário não encontrado localmente");
      }
    } catch (err) {
      console.error("[App] Erro ao buscar usuário por ID:", err);
      setError("Usuário não encontrado localmente");
      setUserData(null);
    } finally {
      setLoadingUsers(false);
    }
  };

  const addUser = async (user: User): Promise<User> => {
    const newUserId = uuidv4();
    const localUser: User = { ...user, id: newUserId };

    setUsers((prev) => [...prev, localUser]);

    try {
      const created = await createRemoteUser(user);
      await createLocalUser(created);
      return created;
    } catch (error) {
      console.error("[App] Erro ao criar usuário remotamente:", error);
      setError("Falha ao salvar no servidor. Salvo localmente para sincronizar depois.");
      await saveUnsyncedItem("users", localUser);
      setUnSyncedUsers((prev) => [...prev, localUser]);
      return localUser;
    }
  };

  const updateUser = async (id: string, updatedData: User) => {
    await updateLocalUser(id, updatedData);

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedData } : u))
    );

    try {
      await updateRemoteUser({ ...updatedData, id });
    } catch (error) {
      console.error("[App] Erro ao atualizar usuário:", error);
      setError("Falha ao sincronizar atualização.");
      await saveUnsyncedItem("users", { ...updatedData, id });
      setUnSyncedUsers((prev) => [...prev, { ...updatedData, id }]);
    }
  };

  const removeUser = async (id: string) => {
    try {
      await deleteLocalUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));

      try {
        await deleteRemoteUser(id);
      } catch (error) {
        console.error("[App] Erro ao deletar usuário remotamente:", error);
        setError("Falha ao sincronizar remoção.");
        await saveUnsyncedItem("users", { id, delete: true } as any);
        setUnSyncedUsers((prev) => [...prev, { id, delete: true } as any]);
      }
    } catch {
      setError("Erro ao deletar usuário local");
    }
  };

  return {
    users,
    userData,
    unSyncedUsers,
    loading: loadingUsers || loadingUnsynced,
    loadingUsers,
    loadingUnsynced,
    error,
    addUser,
    updateUser,
    removeUser,
  };
}
