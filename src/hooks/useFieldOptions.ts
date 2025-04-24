// src/hooks/useFieldOptions.ts
import { useEffect, useState } from 'react';
import { FieldOption } from '@/lib/types/indexeddb';
import { getFieldOptions, createFieldOption } from '@/repositories/server/fieldOptionApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useFieldOptions(fieldId: string) {
  type LocalFieldOption = FieldOption & { _syncStatus?: 'pending' | 'synced' | 'error' };

  const [options, setOptions] = useState<LocalFieldOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const isOnline = typeof window !== 'undefined' && navigator.onLine;
        const data = isOnline ? await getFieldOptions(fieldId) : await getAllItems('field_options');
        setOptions(data.filter(opt => opt.field_id === fieldId));
      } catch (err) {
        setError('Erro ao carregar opções do campo');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fieldId]);

  const addFieldOption = async (option: FieldOption) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newOption: LocalFieldOption = { ...option, _syncStatus: isOnline ? 'synced' : 'pending' };
    setOptions(prev => [...prev, newOption]);

    try {
      await createItem('field_options', newOption);
      if (isOnline) await createFieldOption(option);
    } catch {
      const errorOption: LocalFieldOption = { ...option, _syncStatus: 'error' };
      await createItem('field_options', errorOption);
    }
  };

  return { options, loading, error, addFieldOption };
}
