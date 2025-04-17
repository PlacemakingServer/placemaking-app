'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useMessage } from "@/context/MessageContext";
import SurveyLoader from '@/components/surveys/SurveyLoader';

export default function ResearchAnswers() {
  const router = useRouter();
  // Garantir que router.query seja tratado corretamente, mesmo quando indefinido
  const { surveyId, surveyType, contributor_id } = router.query || {};

  // Hook de mensagens
  const { showMessage } = useMessage();

  const [survey, setSurvey] = useState(null);
  const [fields, setFields] = useState([]);
  const [optionsByField, setOptionsByField] = useState({});
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Gerar surveyGroupId apenas uma vez quando o componente é montado
  const [surveyGroupId] = useState(() => "");

  // Espera até que o router esteja pronto para inicializar
  useEffect(() => {
    if (!router.isReady) return;
    setInitialized(true);
  }, [router.isReady]);

  // Carrega a pesquisa quando os parâmetros estiverem disponíveis
  useEffect(() => {
    if (!initialized) return;
    
    // Se não temos os parâmetros necessários, redirecionamos para a página de seleção
    if (!surveyId || !surveyType || !contributor_id) {
      showMessage('Parâmetros de pesquisa incompletos. Redirecionando...', 'warning');
      router.push('/api/fields');
      return;
    }
    
    fetchSurvey();
  }, [initialized, surveyId, surveyType, contributor_id, router, showMessage]);

  // Busca os dados da pesquisa do backend
  const fetchSurvey = async () => {
    setLoading(true);
    try {
      // Primeiro, buscar os dados básicos da pesquisa
      const surveyRes = await fetch(`/api/surveys/${surveyId}?survey_type=${surveyType}`);
      
      if (!surveyRes.ok) {
        throw new Error('Falha ao carregar pesquisa');
      }
      
      const surveyData = await surveyRes.json();
      setSurvey(surveyData);
      
      // Depois, buscar os campos da pesquisa
      await fetchFields();
    } catch (err) {
      console.error('Erro ao buscar pesquisa:', err);
      showMessage('Não foi possível carregar a pesquisa. Verifique se o link está correto.', 'vermelho_claro');
      router.push('/pesquisas');
    }
  };

  const fetchFields = async () => {
    try {
      const res = await fetch(`/api/fields?survey_id=${surveyId}&survey_type=${surveyType}`);
      
      if (!res.ok) {
        throw new Error('Falha ao carregar campos');
      }
      
      const data = await res.json();

      if (!data || !Array.isArray(data)) {
        throw new Error('Formato de dados inválido');
      }

      setFields(data);
      await loadOptions(data);
    } catch (err) {
      console.error('Erro ao buscar perguntas:', err);
      showMessage('Erro ao carregar perguntas da pesquisa', 'vermelho_claro');
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async (fields) => {
    const multipleChoiceFields = fields.filter((f) => f.input_type === 'multiple_choice');

    try {
      const results = await Promise.all(
        multipleChoiceFields.map((field) =>
          fetch(`/api/fields/${field.id}/options`)
            .then((res) => {
              if (!res.ok) throw new Error(`Erro ao carregar opções para o campo ${field.id}`);
              return res.json();
            })
        )
      );

      const optionsMap = {};
      multipleChoiceFields.forEach((field, index) => {
        optionsMap[field.id] = results[index];
      });

      setOptionsByField(optionsMap);
    } catch (err) {
      console.error('Erro ao carregar opções:', err);
      showMessage('Algumas opções de resposta não puderam ser carregadas', 'amarelo');
    }
  };

  const handleChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const validateAnswers = () => {
    // Verifica se todos os campos obrigatórios foram preenchidos
    const requiredFields = fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !answers[field.id]);
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(f => f.title).join(', ');
      showMessage(`Por favor, preencha os campos obrigatórios: ${fieldNames}`, 'vermelho_claro');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) return;
    
    setSubmitting(true);
    try {
      const entries = Object.entries(answers);
      if (entries.length === 0) {
        showMessage('Nenhuma resposta para enviar', 'amarelo');
        setSubmitting(false);
        return;
      }

      // Preparar payload para envio em lote
      const payload = entries.map(([fieldId, value]) => ({
        field_id: fieldId,
        value,
        survey_group_id: surveyGroupId,
        survey_id: surveyId,
        survey_type: surveyType,
        contributor_id
      }));

      // Enviar respostas em lote
      const response = await fetch(`/api/survey/answers/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload })
      });

      if (response.ok) {
        showMessage('Respostas enviadas com sucesso!', 'verde');
        router.push('/pesquisas/agradecimento');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar respostas');
      }
    } catch (err) {
      console.error('Erro ao enviar respostas:', err);
      showMessage('Erro ao enviar respostas. Por favor, tente novamente.', 'vermelho_claro');
    } finally {
      setSubmitting(false);
    }
  };

  // Se estiver carregando, mostra o componente de carregamento
  if (loading) {
    return <SurveyLoader />;
  }

  // Se não tiver pesquisa ou campos, mostra mensagem de erro
  if (!survey || fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold mb-2">Pesquisa não encontrada</h2>
        <p className="text-gray-600 mb-4">A pesquisa solicitada não está disponível ou não existe.</p>
        <Button onClick={() => router.push('/pesquisas')}>Voltar para Pesquisas</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{survey.title}</h1>
        {survey.description && <p className="text-gray-700 mt-2">{survey.description}</p>}
      </div>

      {fields.map((field) => (
        <Card key={field.id} className={field.required ? 'border-l-4 border-l-blue-500' : ''}>
          <CardContent className="p-4 flex flex-col gap-2">
            <Label className="font-medium flex items-center">
              {field.title}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && <p className="text-sm text-gray-500">{field.description}</p>}

            {field.input_type === 'text' && (
              <Input
                placeholder="Digite sua resposta"
                value={answers[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.input_type === 'long_text' && (
              <Textarea
                placeholder="Digite sua resposta completa"
                value={answers[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                rows={4}
              />
            )}

            {field.input_type === 'multiple_choice' && (
              <RadioGroup
                value={answers[field.id] || ''}
                onValueChange={(value) => handleChange(field.id, value)}
                className="space-y-2"
              >
                {optionsByField[field.id]?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.label} id={`${field.id}-${option.id}`} />
                    <Label htmlFor={`${field.id}-${option.id}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => router.push('/pesquisas')}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar Respostas'}
        </Button>
      </div>
    </div>
  );
}

ResearchAnswers.pageName = "Responder Pesquisa";
ResearchAnswers.layout = "private";