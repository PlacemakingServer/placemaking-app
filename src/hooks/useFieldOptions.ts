import { useEffect, useState } from "react";
import { FieldOption } from "@/lib/types/indexeddb";
import {
  getFieldOptions as getRemoteOptions,
  createFieldOption as createRemoteOption,
  updateFieldOption as updateRemoteOption,
  deleteFieldOption as deleteRemoteOption,
} from "@/repositories/server/fieldOptionApi";
import {
  createFieldOption as createLocalOption,
  getAllFieldOptions as getAllLocalOptions,
  updateFieldOption as updateLocalOption,
  deleteFieldOption as deleteLocalOption,
} from "@/repositories/indexeddb/fieldOptionRepository";
import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export function useFieldOptions(field_id: string) {
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [unSyncedOptions, setUnSyncedOptions] = useState<FieldOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedOptions();
  }, []);

  useEffect(() => {
    if (field_id) fetchOptions();
  }, [field_id]);

  const fetchUnsyncedOptions = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const pending = unsynced
        .filter((item) => item.store === "field_options")
        .map((item) => item.payload as FieldOption);
      setUnSyncedOptions(pending);
    } catch (error) {
      console.error("[App] Erro ao carregar opções pendentes:", error);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const remoteOptions = await getRemoteOptions(field_id);
      setOptions(remoteOptions);
      await Promise.allSettled(remoteOptions.map((opt) => createLocalOption(opt)));
    } catch (err) {
      console.warn("[App] Falha ao buscar opções do servidor. Usando IndexedDB local.", err);
      try {
        const localOptions = await getAllLocalOptions();
        setOptions(localOptions.filter((o) => o.field_id === field_id));
      } catch (errLocal) {
        console.error("[App] Falha ao carregar opções locais:", errLocal);
        setError("Erro ao carregar opções locais");
      }
    } finally {
      setLoadingOptions(false);
    }
  };



  const addOption = async (
    option: Omit<FieldOption, "id">
  ): Promise<FieldOption> => {
    try {
      /* 1 ⎯ tenta criar no backend ----------------------------- */
      const created = await createRemoteOption(field_id, option);
  
      // persiste localmente com o id oficial
      await createLocalOption(created);
  
      // exibe na UI
      setOptions((prev) => [...prev, created]);
  
      return created;
    } catch (error) {
      console.error("[App] Erro ao criar opção remotamente:", error);
      setError("Falha ao salvar no servidor. Sincronizará depois.");
      const localOpt: FieldOption = {
        ...option,
        id: uuidv4(),
        field_id,
      };
      await createLocalOption(localOpt);
      await saveUnsyncedItem("field_options", localOpt);
      setOptions((prev) => [...prev, localOpt]);
      setUnSyncedOptions((prev) => [...prev, localOpt]);
      return localOpt;
    }
  };
  
  

  const updateOption = async (optionId: string, updatedData: Partial<FieldOption>) => {
    const updated: FieldOption = { ...updatedData, id: optionId, field_id } as FieldOption;
    await updateLocalOption(optionId, updated);

    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, ...updatedData } : o))
    );

    try {
      await updateRemoteOption(field_id, optionId, updatedData);
    } catch (error) {
      console.error("[App] Erro ao atualizar opção remotamente:", error);
      setError("Falha ao sincronizar atualização.");
      await saveUnsyncedItem("field_options", updated);
      setUnSyncedOptions((prev) => [...prev, updated]);
    }
  };

  const deleteOption = async (optionId: string) => {
    await deleteLocalOption(optionId);
    setOptions((prev) => prev.filter((o) => o.id !== optionId));

    try {
      await deleteRemoteOption(field_id, optionId);
    } catch (error) {
      console.error("[App] Erro ao deletar opção remotamente:", error);
      setError("Falha ao sincronizar exclusão.");
      await saveUnsyncedItem("field_options", { id: optionId, field_id });
    }
  };

  return {
    options,
    unSyncedOptions,
    loading: loadingOptions || loadingUnsynced,
    loadingOptions,
    loadingUnsynced,
    error,
    addOption,
    updateOption,
    deleteOption,
  };
}