// src/hooks/useFields.ts
import { useEffect, useState } from "react";
import { Field } from "@/lib/types/indexeddb";
import { createField } from "@/repositories/server/fieldApi";
import {
  createItem,
  getAllItems,
} from "@/repositories/indexeddb/indexedDBService";

export function useFields() {
  type LocalField = Omit<Field, "id"> & {
    id?: string;
    _syncStatus?: "pending" | "synced" | "error";
  };
  const [fields, setFields] = useState<LocalField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllItems("fields");
        setFields(data);
      } catch (err) {
        setError("Erro ao carregar campos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addField = async (field: Field) => {
    const isOnline = typeof window !== "undefined" && navigator.onLine;
    const newField: LocalField = {
      ...field,
      _syncStatus: isOnline ? "synced" : "pending",
    };
    setFields((prev) => [...prev, newField]);

    try {
      await createItem("fields", newField);
      if (isOnline) await createField(field);
    } catch {
      const errorField: LocalField = { ...field, _syncStatus: "error" };
      await createItem("fields", errorField);
    }
  };

  return { fields, loading, error, addField };
}
