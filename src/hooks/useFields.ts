import { useEffect, useState } from "react";
import { Field } from "@/lib/types/indexeddb";
import {
  getFields as getRemoteFields,
  createField as createRemoteField,
  updateField as updateRemoteField,
  deleteField as deleteRemoteField,
} from "@/repositories/server/fieldApi";
import {
  createField as createLocalField,
  getAllFields as getAllLocalFields,
  updateField as updateLocalField,
  deleteField as deleteLocalField,
} from "@/repositories/indexeddb/fieldRepository";
import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export function useFields(survey_id: string, survey_type: string) {
  const [fields, setFields] = useState<Field[]>([]);
  const [unSyncedFields, setUnSyncedFields] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedFields();
  }, []);

  useEffect(() => {
    if (survey_id && survey_type) fetchFields();
  }, [survey_id, survey_type]);

  const fetchUnsyncedFields = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const pending = unsynced
        .filter((item) => item.store === "fields")
        .map((item) => item.payload as Field);
      setUnSyncedFields(pending);
    } catch (error) {
      console.error("[App] Erro ao carregar campos pendentes:", error);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchFields = async () => {
    setLoadingFields(true);
    try {
      const remoteFields = await getRemoteFields(survey_id, survey_type);
      setFields(remoteFields);
      await Promise.allSettled(
        remoteFields.map((f) => createLocalField(f))
      );
    } catch (err) {
      console.warn("[App] Falha ao buscar campos do servidor. Usando IndexedDB local.", err);
      try {
        const localFields = await getAllLocalFields();
        setFields(localFields);
      } catch (errLocal) {
        console.error("[App] Falha ao carregar campos locais:", errLocal);
        setError("Erro ao carregar campos locais");
      }
    } finally {
      setLoadingFields(false);
    }
  };

  const addField = async (field: Omit<Field, "id">): Promise<Field> => {
    const newField: Field = { ...field, id: uuidv4(), survey_id };
    setFields((prev) => [...prev, newField]);

    try {
      const created = await createRemoteField(survey_id, survey_type, newField);
      await createLocalField(created);
      return created;
    } catch (error) {
      console.error("[App] Erro ao criar campo remotamente:", error);
      setError("Falha ao salvar no servidor. Salvo localmente.");
      await saveUnsyncedItem("fields", newField);
      setUnSyncedFields((prev) => [...prev, newField]);
      await createLocalField(newField);
      return newField;
    }
  };

  const updateField = async (fieldId: string, updatedData: Partial<Field>) => {
    const updated: Field = { ...updatedData, id: fieldId, survey_id } as Field;
    await updateLocalField(fieldId, updated);

    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...updatedData } : f))
    );

    try {
      await updateRemoteField(fieldId, survey_id, survey_type, updatedData);
    } catch (error) {
      console.error("[App] Erro ao atualizar campo remotamente:", error);
      setError("Falha ao sincronizar atualização.");
      await saveUnsyncedItem("fields", updated);
      setUnSyncedFields((prev) => [...prev, updated]);
    }
  };

  const deleteField = async (fieldId: string) => {
    await deleteLocalField(fieldId);
    setFields((prev) => prev.filter((f) => f.id !== fieldId));

    try {
      await deleteRemoteField(fieldId, survey_id, survey_type);
    } catch (error) {
      console.error("[App] Erro ao deletar campo remotamente:", error);
      setError("Falha ao sincronizar exclusão.");
      await saveUnsyncedItem("fields", { id: fieldId, survey_id });
    }
  };

  return {
    fields,
    unSyncedFields,
    loading: loadingFields || loadingUnsynced,
    loadingFields,
    loadingUnsynced,
    error,
    addField,
    updateField,
    deleteField,
  };
}
