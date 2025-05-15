"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import { useAuthentication } from "@/hooks";
import { useSurveyContributors } from "@/hooks";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/Button";
import { useMessage } from "@/context/MessageContext";
import { useFields } from "@/hooks/useFields";
import { useInputTypes } from "@/hooks/useInputTypes";
import { useFieldOptions } from "@/hooks";

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

  // Filtra o contributor correspondente ao usuário logado
  const currentContributor = surveyContributors?.find(
    (c) => c.user_id === user?.id
  );
  const contributorId = currentContributor?.id;

  const handleChange = (fieldId, value) =>
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));

  const validate = () => {
    const missing = fields
      .filter((f) => f.required)
      .filter((f) => answers[f.id] === undefined || answers[f.id] === "");
    if (missing.length) {
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

    // Monta o body completo
    const body = {
      survey_id: surveyId,
      survey_type: surveyType,
      contributor_id: contributorId,
      answers: fields
      .filter((f) => String(answers[f.id] ?? "") !== "")
      .map((f) => ({
        value: String(answers[f.id] ?? ""),
        survey_group_id: f.survey_group_id,
        survey_time_range_id: f.survey_time_range_id || "",
        survey_region_id: f.survey_region_id || "",
        registered_at: new Date().toISOString(),
      })),
    };

    try {
      const res = await fetch("/api/survey-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      showMessage("Respostas enviadas com sucesso!", "verde_claro");
      router.push(`/researches/${researchId}/view`);
    } catch {
      showMessage("Erro ao enviar respostas.", "vermelho_claro");
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeName = (id) =>
    (types.find((t) => t.id === id) || {}).name || "Texto";
  const isDynamic = surveyType === "Dinâmica";
  const counterFields = isDynamic
    ? fields.filter((f) => getTypeName(f.input_type_id) === "Contador")
    : [];
  const otherFields = fields.filter((f) => !counterFields.includes(f));

  useEffect(() => {
    console.log("id_do_contribuidor:", contributorId);
  }, [contributorId]);

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 flex flex-col gap-6"
    >
      <header>
        <h1 className="text-2xl font-bold">Responder Pesquisa</h1>
        <p className="text-gray-600">Preencha os campos abaixo.</p>
      </header>

      {/* Outros campos */}
      {otherFields.map((field) => {
        const typeName = getTypeName(field.input_type_id);
        const value = answers[field.id] || "";

        return (
          <Card
            key={field.id}
            className={field.required ? "border-l-4 border-blue-500" : ""}
          >
            <CardContent className="flex flex-col gap-2">
              {typeName !== "long_text" && typeName !== "Múltipla Escolha" && (
                <div className="relative">
                  <Input
                    id={field.id}
                    value={value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder=" "
                    className="peer h-10 w-full border-b-2 border-gray-300 focus:border-blue-500 transition"
                  />
                  <Label
                    htmlFor={field.id}
                    className="absolute left-0 -top-3.5 text-gray-700 text-sm transition-all 
                      peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                      peer-focus:-top-3.5 peer-focus:scale-75 peer-focus:text-blue-500"
                  >
                    {field.title}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                </div>
              )}

              {typeName === "long_text" && (
                <div className="relative mt-4">
                  <Textarea
                    id={`${field.id}-ta`}
                    value={value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    rows={4}
                    placeholder=" "
                    className="peer w-full border-b-2 border-gray-300 focus:border-blue-500 transition"
                  />
                  <Label
                    htmlFor={`${field.id}-ta`}
                    className="absolute left-0 -top-3.5 text-gray-700 text-sm transition-all 
                      peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                      peer-focus:-top-3.5 peer-focus:scale-75 peer-focus:text-blue-500"
                  >
                    {field.title}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                </div>
              )}

                            {typeName === "Múltipla Escolha" && (
                <FieldOptions
                  field={field}
                  value={value}
                  onChange={(val) => handleChange(field.id, val)}
                />
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Contadores dinâmicos */}
      {isDynamic && counterFields.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Contadores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {counterFields.map((field) => {
              const val = answers[field.id] || 0;
              return (
                <Card key={field.id} className="p-4 flex flex-col items-center">
                  <CardContent className="flex flex-col items-center gap-2">
                    <span className="text-gray-700 font-medium text-center">
                      {field.title}
                    </span>
                    <div className="flex items-center gap-4 mt-2">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleChange(field.id, Math.max(val - 1, 0))
                        }
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center transition"
                        aria-label="Diminuir"
                      >
                        −
                      </motion.button>
                      <motion.span
                        key={val}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xl font-semibold text-gray-900 w-8 text-center"
                      >
                        {val}
                      </motion.span>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleChange(field.id, val + 1)}
                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center transition"
                        aria-label="Aumentar"
                      >
                        +
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Ações */}
      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          className="px-6 py-2 border-gray-400 text-gray-600 hover:border-gray-600"
          onClick={() => router.push("/")}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Enviando..." : "Enviar Respostas"}
        </Button>
      </div>
    </motion.form>
  );
}

function FieldOptions({ field, value, onChange }) {
  const { options, loading } = useFieldOptions(field.id);

  if (loading) {
    return <p className="text-gray-400 italic">Carregando opções...</p>;
  }

  return (
    <fieldset className="mt-4">
      <legend className="text-gray-700 font-medium">{field.title}</legend>
      <div className="mt-2 space-y-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500"
          >
            <input
              type="radio"
              name={field.id}
              value={value}
              checked={value === opt.option_value}
              onChange={() => onChange(opt.option_value)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-gray-800">{opt.option_text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
ResearchAnswers.pageName = "Responder Pesquisa";
ResearchAnswers.layout = "private";
