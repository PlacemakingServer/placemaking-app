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
  const [unsyncedFields, setUnsyncedFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedFields();
    fetchFields();
  }, [survey_id, survey_type]);

  const fetchUnsyncedFields = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const filtered = unsynced
        .filter((item) => item.store === "fields")
        .map((item) => item.payload as Field);
      setUnsyncedFields(filtered);
    } catch (err) {
      console.error("[Fields] Erro ao buscar pendentes:", err);
    }
  };

  const fetchFields = async () => {
    setLoading(true);
    try {
      const remoteFields = await getRemoteFields(survey_id, survey_type);
      setFields(remoteFields);
      await Promise.allSettled(remoteFields.map(createLocalField));
    } catch (err) {
      console.warn("[Fields] Falha ao buscar do servidor. Usando local.", err);
      try {
        const localFields = await getAllLocalFields();
        setFields(localFields);
      } catch (errLocal) {
        console.error("[Fields] Falha ao buscar local:", errLocal);
        setError("Erro ao buscar campos localmente");
      }
    } finally {
      setLoading(false);
    }
  };

  const addField = async (field: Omit<Field, "id">): Promise<Field> => {
    const newId = uuidv4();
    const localField: Field = { ...field, id: newId };
    setFields((prev) => [...prev, localField]);

    try {
      const created = await createRemoteField(survey_id, survey_type, field);
      await createLocalField(created);
      return created;
    } catch (err) {
      console.error("[Fields] Falha ao criar remotamente. Salvo local.", err);
      await saveUnsyncedItem("fields", localField);
      setUnsyncedFields((prev) => [...prev, localField]);
      await createLocalField(localField);
      return localField;
    }
  };

  const updateField = async (id: string, updates: Field) => {
    await updateLocalField(id, updates);
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));

    try {
      await updateRemoteField(id, survey_id, survey_type, updates);
    } catch (err) {
      console.error("[Fields] Erro ao atualizar campo:", err);
      await saveUnsyncedItem("fields", { ...updates, id });
      setUnsyncedFields((prev) => [...prev, { ...updates, id }]);
    }
  };

  const removeField = async (id: string) => {
    await deleteLocalField(id);
    setFields((prev) => prev.filter((f) => f.id !== id));

    try {
      await deleteRemoteField(id, survey_id, survey_type);
    } catch (err) {
      console.error("[Fields] Erro ao deletar campo:", err);
      await saveUnsyncedItem("fields", { id });
    }
  };

  return {
    fields,
    unsyncedFields,
    loading,
    error,
    addField,
    updateField,
    removeField,
  };
}
