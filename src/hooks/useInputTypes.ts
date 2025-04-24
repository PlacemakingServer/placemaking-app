// src/hooks/useInputTypes.ts
import { useEffect, useState } from 'react';
import { InputType } from '@/lib/types/indexeddb';
import { getInputTypes } from '@/repositories/server/inputTypeApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useInputTypes() {
  const [types, setTypes] = useState<InputType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const isOnline = typeof window !== 'undefined' && navigator.onLine;
        const data = isOnline ? await getInputTypes() : await getAllItems('input_types');

        setTypes(data);
      } catch (err) {
        setError('Erro ao carregar tipos de input');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { types, loading, error };
}