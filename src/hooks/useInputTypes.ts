import { useEffect, useState } from 'react';
import { InputType } from '@/lib/types/indexeddb';
import { getInputTypes } from '@/repositories/server/inputTypeApi';
import { createInputType, getAllInputTypes } from '@/repositories/indexeddb';
import { getUnsyncedItems } from "@/lib/db";

export function useInputTypes() {
  const [types, setTypes] = useState<InputType[]>([]);
  const [unSyncedInputTypes, setUnSyncedInputTypes] = useState<InputType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadUnsyncedInputTypes(),
        loadInputTypesWithFallback()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const loadUnsyncedInputTypes = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const pending = unsynced
        .filter((item) => item.store === "input_types")
        .map((item) => item.payload as InputType);
      setUnSyncedInputTypes(pending);
    } catch (err) {
      console.error("[useInputTypes] Falha ao carregar input_types não sincronizados:", err);
    }
  };

  const loadInputTypesWithFallback = async () => {
    try {
      const remote = await getInputTypes();
      // console.log("[useInputTypes] Dados remotos carregados:", remote);
      setTypes(remote);
      await Promise.allSettled(
        remote.map((type) => createInputType(type))
      );
    } catch (errRemote) {
      console.warn("[useInputTypes] Erro remoto. Tentando IndexedDB local:", errRemote);
      try {
        const local = await getAllInputTypes();
        setTypes(local);
      } catch (errLocal) {
        console.error("[useInputTypes] Falha ao carregar dados locais:", errLocal);
        setError("Erro ao carregar dados locais de input_types");
      }
    }
  };

  return { types, unSyncedInputTypes, loading, error };
}
