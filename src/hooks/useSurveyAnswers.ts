// src/hooks/useSurveyAnswers.ts
import { useEffect, useState } from 'react';
import { SurveyAnswer } from '@/lib/types/indexeddb';
import { getSurveyAnswers, createSurveyAnswer } from '@/repositories/server/surveyAnswerApi';
import { createItem, getAllItems } from '@/repositories/indexeddb/indexedDBService';

export function useSurveyAnswers() {
  type LocalSurveyAnswer = SurveyAnswer & { _syncStatus?: 'pending' | 'synced' | 'error' };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<LocalSurveyAnswer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const isOnline = typeof window !== 'undefined' && navigator.onLine;
        const data = isOnline ? await getSurveyAnswers() : await getAllItems('survey_answers');
        setAnswers(data);
      } catch (err) {
        setError('Erro ao carregar respostas da coleta');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addSurveyAnswer = async (answer: SurveyAnswer) => {
    const isOnline = typeof window !== 'undefined' && navigator.onLine;
    const newAnswer: LocalSurveyAnswer = { ...answer, _syncStatus: isOnline ? 'synced' : 'pending' };

    setAnswers(prev => [...prev, newAnswer]);

    try {
      await createItem('survey_answers', newAnswer);
      if (isOnline) await createSurveyAnswer(answer);
    } catch {
      const errorAnswer: LocalSurveyAnswer = { ...answer, _syncStatus: 'error' };
      await createItem('survey_answers', errorAnswer);
    }
  };

  return {
    answers,
    loading,
    error,
    addSurveyAnswer,
  };
}