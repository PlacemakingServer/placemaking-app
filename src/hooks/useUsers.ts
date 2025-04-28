import { useEffect, useState } from "react";
import { User } from "@/lib/types/indexeddb";
import { 
  createUser as createRemoteUser,
  updateUser as updateRemoteUser,
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
      // Atualiza o IndexedDB local
      await Promise.allSettled(remoteUsers.map((user) => createLocalUser(user)));
    } catch (err) {
      console.warn("[App] Falha ao buscar usuários do servidor. Usando IndexedDB local.", err);
      try {
        const localUsers = await getAllLocalUsers();
        setUsers(localUsers);
      } catch (errLocal) {
        console.error("[App] Falha ao carregar usuários locais:", errLocal);
        setError("Erro ao carregar usuários locais.");
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserById = async (userId: string) => {
    setLoadingUsers(true);
    try {
      // Primeiro tenta online
      const remote = await getRemoteUserById(userId);
      setUserData(remote);
      await createLocalUser(remote);
    } catch (err) {
      console.warn("[App] Falha ao buscar usuário no servidor, tentando IndexedDB...", err);
      try {
        const local = await getLocalUser(userId);
        if (local) {
          setUserData(local);
        } else {
          throw new Error("Usuário não encontrado localmente.");
        }
      } catch (errLocal) {
        console.error("[App] Erro ao buscar usuário local:", errLocal);
        setError("Usuário não encontrado localmente.");
        setUserData(null);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const addUser = async (user: User): Promise<User> => {
    const tempId = uuidv4();
    const localUser: User = { ...user, id: tempId };

    setUsers((prev) => [...prev, localUser]);

    try {
      const created = await createRemoteUser(user);
      await createLocalUser(created);
      setUsers((prev) =>
        prev.map((u) => (u.id === tempId ? created : u))
      );
      return created;
    } catch (error) {
      console.error("[App] Erro ao criar usuário remotamente:", error);
      setError("Falha ao criar usuário. Salvo localmente para sincronizar depois.");
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
      setError("Falha ao atualizar no servidor. Salvo localmente para sincronizar depois.");
      await saveUnsyncedItem("users", { ...updatedData, id });
      setUnSyncedUsers((prev) => [...prev, { ...updatedData, id }]);
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
    fetchUsers,
  };
}
