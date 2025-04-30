'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import  Button  from '@/components/ui/Button';
import { useMessage } from "@/context/MessageContext";
import { useFields } from '@/hooks/useFields';

export default function ResearchAnswers() {
  const router = useRouter();
  const { showMessage } = useMessage();

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const surveyType = router.query.survey_type;

  const { fields } = useFields(router.query.surveyid, surveyType);

  const handleChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const validateAnswers = () => {
    const requiredFields = MOCK_FIELDS.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !answers[field.id]);

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(f => f.title).join(', ');
      showMessage(`Preencha os campos obrigatórios: ${fieldNames}`, 'vermelho_claro');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) return;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/researches/${router.query.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
x
      if (!response.ok) {
        throw new Error('Erro ao enviar respostas');
      }

      showMessage('Respostas enviadas com sucesso!', 'verde_claro');
      router.push('/pesquisas');
    } catch (err) {
      showMessage('Erro ao enviar respostas.', 'vermelho_claro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pesquisa Placemaking (Mock)</h1>
        <p className="text-gray-700 mt-2">Este é um formulário simulado de teste para a interface de respostas.</p>
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
                {MOCK_OPTIONS[field.id]?.map((option) => (
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
        <Button variant="outline" onClick={() => router.push('/')}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar Respostas'}
        </Button>
      </div>
    </div>
  );
}

ResearchAnswers.pageName = "Responder Pesquisa (Mock)";
ResearchAnswers.layout = "private";