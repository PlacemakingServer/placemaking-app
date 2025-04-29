// src/app/surveys/[surveyid]/index.tsx

import React, { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ClipboardCopy, Check, ChevronDown } from "lucide-react";

import { useDynamicSurveys } from "@/hooks/useDynamicSurveys";
import { useFormSurveys } from "@/hooks/useFormSurveys";
import { useStaticSurveys } from "@/hooks/useStaticSurveys";
import { useSurveyContributors } from "@/hooks/useSurveyContributors";
import { useLoading } from "@/context/LoadingContext";

import UserCardCompact from "@/components/ui/UserCardCompact";
import Button from "@/components/ui/Button";

export default function ResearchSurvey() {
  const router = useRouter();
  const { surveyid } = router.query;

  const { isLoading } = useLoading();
  const { dynamicSurvey, isLoading: loadingSurvey } = useDynamicSurveys(surveyid) || null;
  const { formSurvey, isLoading: loadingFormSurvey } = useFormSurveys(surveyid) || null;
  const { staticSurvey, isLoading: loadingStaticSurvey } = useStaticSurveys(surveyid) || null;
  const { contributors, isLoading: loadingContributors } = useSurveyContributors(surveyid);

  const [showContributors, setShowContributors] = useState(false);
  const [copied, setCopied] = useState(false);

  const survey = dynamicSurvey || formSurvey || staticSurvey;

  const handleCopyCoords = () => {
    if (survey?.lat && survey?.long) {
      const shortAddress = survey.location_title?.split(",").slice(0, 3).join(",").trim() || "";
      navigator.clipboard.writeText(`${shortAddress}: ${survey.lat}, ${survey.long}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    console.log("Survey data:", dynamicSurvey, formSurvey, staticSurvey);
  }, [dynamicSurvey, formSurvey, staticSurvey]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-screen-lg mx-auto p-6 md:p-8 box-border flex flex-col gap-6 items-center"
    >
      {/* Detalhes da Coleta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 bg-white rounded-lg shadow-md border-2 w-full p-6"
      >
        <h1 className="text-2xl font-bold">Coleta</h1>

        {loadingSurvey ? (
          <p className="text-gray-600 italic">Carregando detalhes da coleta...</p>
        ) : survey ? (
          <>
            <h2 className="text-xl font-semibold">Detalhes da Coleta</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li><strong>Título:</strong> {survey.title}</li>
              <li><strong>Descrição:</strong> {survey.description}</li>
              <li><strong>Tipo:</strong> {survey.survey_type}</li>
              <li className="flex items-center gap-2">
                <strong>Localização:</strong> {survey.location_title?.split(",").slice(0, 3).join(",").trim()}
                <button
                  onClick={handleCopyCoords}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline transition text-sm"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-green-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <ClipboardCopy size={16} />
                      Copiar localização
                    </>
                  )}
                </button>
              </li>
              <li><strong>Latitude:</strong> {survey.lat}</li>
              <li><strong>Longitude:</strong> {survey.long}</li>
            </ul>
          </>
        ) : (
          <p className="text-red-500">Coleta não encontrada.</p>
        )}
      </motion.div>

      {/* Colaboradores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 bg-white rounded-lg shadow-md border-2 w-full p-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <button
            onClick={() => setShowContributors((prev) => !prev)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            <motion.div
              animate={{ rotate: showContributors ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={24} />
            </motion.div>
          </button>
        </div>

        <AnimatePresence>
          {showContributors && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {loadingContributors ? (
                <p className="text-gray-400">Carregando colaboradores...</p>
              ) : contributors?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contributors.map((contributor) => (
                    <UserCardCompact
                      key={contributor.id}
                      user={{
                        id: contributor.user.id,
                        name: contributor.user.name,
                        role: contributor.user.role,
                        email: contributor.user.email,
                        status: contributor.user.status,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Nenhum colaborador encontrado.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Respostas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 bg-white rounded-lg shadow-md border-2 w-full p-6"
      >
        <h1 className="text-2xl font-bold">Respostas</h1>
        <p className="text-gray-400">Em breve...</p>
      </motion.div>

      {/* Botão de Responder */}
      <Button
        onClick={() => router.push(`/researches/${router.query.id}/surveys/${surveyid}/answers`)}
        disabled={isLoading}
        variant="primary"
        className="w-full sm:w-auto px-6 py-2 mt-4 flex items-center gap-2 text-sm"
      >
        <span className="material-symbols-outlined text-base">send</span>
        <span>Responder Pesquisa</span>
      </Button>
    </motion.section>
  );
}

ResearchSurvey.pageName = "Visualizar Coleta";
ResearchSurvey.layout = "private";
