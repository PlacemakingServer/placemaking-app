"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Send, X, Plus, Minus } from "lucide-react";
import { useAuthentication } from "@/hooks";
import { useSurveyContributors } from "@/hooks";
import { useMessage } from "@/context/MessageContext";
import { useFields } from "@/hooks/useFields";
import { useInputTypes } from "@/hooks/useInputTypes";
import { useFieldOptions } from "@/hooks";
import { useSurveyTimeRanges } from "@/hooks";

export default function ResearchAnswers() {
  const router = useRouter();
  const { showMessage } = useMessage();
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const surveyId = router.query.surveyid;
  const researchId = router.query.id;
  const surveyType = router.query.survey_type;
  const { fields } = useFields(surveyId, surveyType);
  const { types } = useInputTypes();

  const { user } = useAuthentication();
  const { contributors: surveyContributors } = useSurveyContributors(surveyId);
  const { ranges: surveyTimeRanges } = useSurveyTimeRanges(surveyId);

  // Acha o contributor do usuário logado
  const currentContributor = surveyContributors?.find(
    (c) => c.user_id === user?.id
  );
  const contributorId = currentContributor?.id;

  // Retorna o time range atual
  function getCurrentTimeRangeId() {
    if (!surveyTimeRanges || surveyTimeRanges.length === 0) return "";
    const now = new Date();
    for (const range of surveyTimeRanges) {
      const [sh, sm] = range.start_time.split(":").map(Number);
      const [eh, em] = range.end_time.split(":").map(Number);

      const start = new Date(now);
      start.setHours(sh, sm, 0, 0);
      const end = new Date(now);
      end.setHours(eh, em, 59, 999);

      if (now >= start && now <= end) return range.id;
    }
    return "";
  }

  const handleChange = (fieldId, value) =>
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));

  const validate = () => {
    const missing = fields
      .filter((f) => f.required)
      .filter((f) => !answers[f.id]);
    if (missing.length > 0) {
      showMessage(
        `Preencha: ${missing.map((f) => f.title).join(", ")}`,
        "vermelho_claro"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const currentTimeRangeId = getCurrentTimeRangeId();

    const body = {
      survey_id: surveyId,
      survey_type: surveyType,
      contributor_id: contributorId,
      answers: fields.map((f) => ({
        field_id: f.id,
        value: String(answers[f.id] || ""),
        survey_group_id: f.survey_group_id,
        survey_time_range_id:
          f.survey_time_range_id || currentTimeRangeId || "",
        survey_region_id: f.survey_region_id || "",
        registered_at: new Date().toISOString(),
      })),
    };

    if (body.answers.some((a) => a.value === "")) {
      showMessage("Preencha todos os campos obrigatórios.", "vermelho_claro");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/survey-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      showMessage("Respostas enviadas com sucesso!", "verde_claro");
      router.push(`/researches/${researchId}/surveys/${surveyId}`);
    } catch {
      showMessage("Erro ao enviar respostas.", "vermelho_claro");
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeName = (id) =>
    (types.find((t) => t.id === id) || {}).name || "Texto";

  // Agora todos os campos de tipo "Contador" entram em counterFields
  const counterFields = fields.filter(
    (f) => getTypeName(f.input_type_id) === "Contador"
  );
  const otherFields = fields.filter(
    (f) => getTypeName(f.input_type_id) !== "Contador"
  );

  useEffect(() => {
    console.log("id_do_contribuidor:", contributorId);
  }, [contributorId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(`/researches/${researchId}/surveys/${surveyId}`)
                }
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                Responder Pesquisa
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Survey Info */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {surveyType}: Formulário de Respostas
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Preencha todos os campos obrigatórios para enviar suas
                    respostas
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Campos não-contador */}
          {otherFields.length > 0 && (
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <h3 className="text-base font-medium text-gray-900">
                  Informações da Pesquisa
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {otherFields.map((field) => {
                  const typeName = getTypeName(field.input_type_id);
                  const value = answers[field.id] || "";

                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      {typeName !== "long_text" &&
                        typeName !== "Múltipla Escolha" && (
                          <div className="space-y-2">
                            <Label
                              htmlFor={field.id}
                              className="text-sm font-medium text-gray-700"
                            >
                              {field.title}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </Label>
                            <Input
                              id={field.id}
                              value={value}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                              className="w-full"
                              required={field.required}
                            />
                          </div>
                        )}

                      {typeName === "long_text" && (
                        <div className="space-y-2">
                          <Label
                            htmlFor={`${field.id}-ta`}
                            className="text-sm font-medium text-gray-700"
                          >
                            {field.title}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          <Textarea
                            id={`${field.id}-ta`}
                            value={value}
                            onChange={(e) =>
                              handleChange(field.id, e.target.value)
                            }
                            rows={4}
                            className="w-full"
                            required={field.required}
                          />
                        </div>
                      )}

                      {typeName === "Múltipla Escolha" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            {field.title}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          <FieldOptions
                            field={field}
                            value={value}
                            onChange={(val) => handleChange(field.id, val)}
                            required={field.required}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Seção de Contadores */}
          {counterFields.length > 0 && (
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <h3 className="text-base font-medium text-gray-900">
                  Contadores
                </h3>
                <p className="text-sm text-gray-500">
                  Use os botões para ajustar os valores
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {counterFields.map((field) => {
                    const val = Number(answers[field.id]) || 0;
                    return (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-50 rounded-lg p-4 text-center space-y-3"
                      >
                        <h4 className="text-sm font-medium text-gray-700 leading-tight">
                          {field.title}
                        </h4>
                        <div className="flex items-center justify-center space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleChange(field.id, Math.max(val - 1, 0))
                            }
                            className="w-8 h-8 p-0 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <motion.span
                            key={val}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-xl font-semibold text-gray-900 min-w-[2rem]"
                          >
                            {val}
                          </motion.span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleChange(field.id, val + 1)}
                            className="w-8 h-8 p-0 rounded-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de ação */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(`/researches/${researchId}/surveys/${surveyId}`)
                  }
                  className="flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-black"
                  onClick={handleSubmit}
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Enviando..." : "Enviar Respostas"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.form>
      </div>
    </div>
  );
}

function FieldOptions({ field, value, onChange, required }) {
  const { options, loading } = useFieldOptions(field.id);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.id}
          className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
        >
          <input
            type="radio"
            name={field.id}
            value={opt.option_value}
            checked={value === opt.option_value}
            onChange={() => onChange(opt.option_value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            required={required}
          />
          <span className="ml-3 text-gray-800 font-medium">
            {opt.option_text}
          </span>
        </label>
      ))}
    </div>
  );
}

ResearchAnswers.pageName = "Responder Pesquisa";
ResearchAnswers.layout = "private";
