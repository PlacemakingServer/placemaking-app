// src/app/surveys/[surveyid]/index.tsx

import React, { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ClipboardCopy, Check, ChevronDown } from "lucide-react";
import Switch from "@/components/ui/Switch";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Clock, MapPin } from "lucide-react";

import { useDynamicSurveys } from "@/hooks/useDynamicSurveys";
import { useFormSurveys } from "@/hooks/useFormSurveys";
import { useStaticSurveys } from "@/hooks/useStaticSurveys";
import { useSurveyContributors } from "@/hooks/useSurveyContributors";
import { useSurveyRegions } from "@/hooks/useSurveyRegions";
import { useSurveyTimeRanges } from "@/hooks/useSurveyTimeRanges";
import { useLoading } from "@/context/LoadingContext";
import MapPreview from "@/components/map/MapPreviewNoSSR";

import UserCardCompact from "@/components/ui/UserCardCompact";
import Button from "@/components/ui/Button";

export default function ResearchSurvey() {
  const router = useRouter();
  const { surveyid } = router.query;

  const { isLoading } = useLoading();
  const { dynamicSurvey, isLoading: loadingSurvey } =
    useDynamicSurveys(surveyid) || null;
  const { formSurvey, isLoading: loadingFormSurvey } =
    useFormSurveys(surveyid) || null;
  const { staticSurvey, isLoading: loadingStaticSurvey } =
    useStaticSurveys(surveyid) || null;
  const { contributors, isLoading: loadingContributors } =
    useSurveyContributors(surveyid);

  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showContributors, setShowContributors] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [copiedRangeId, setCopiedRangeId] = useState(null);

  const { surveyRegions } = useSurveyRegions(surveyid);
  const { ranges: surveyTimeRanges } = useSurveyTimeRanges(surveyid);

  const survey = dynamicSurvey || formSurvey || staticSurvey;

  const handleCopyCoords = () => {
    if (survey?.lat && survey?.long) {
      const shortAddress =
        survey.location_title?.split(",").slice(0, 3).join(",").trim() || "";
      navigator.clipboard.writeText(
        `${shortAddress}: ${survey.lat}, ${survey.long}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyRange = (range) => {
    const text = `${range.start_time} - ${range.end_time}`;
    navigator.clipboard.writeText(text);
  };

  const getShortAddress = (fullAddress) => {
    if (!fullAddress) return "";
    const parts = fullAddress.split(",");
    return parts.slice(0, 3).join(",").trim();
  };

  useEffect(() => {
    console.log("surveyTimeRanges", surveyTimeRanges);
  }, [surveyTimeRanges]);

  useEffect(() => {
    const idx = Math.floor(Math.random() * 5);
    setImageUrl(`/img/cards/img-${idx}.jpg`);
  }, []);

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
        className="flex flex-col gap-4 bg-white rounded-lg shadow-md border-2 w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-t-lg h-32 overflow-hidden box-border"
          style={{
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40 rounded-t-lg" />
          <div className="absolute inset-0 flex items-center px-4 z-10">
            <h2 className="text-white text-3xl font-semibold truncate drop-shadow-md">
              {survey?.title}
            </h2>
          </div>
        </motion.div>

        {loadingSurvey ? (
          <p className="text-gray-600 italic">
            Carregando detalhes da coleta...
          </p>
        ) : survey ? (
          <div className="flex flex-col gap-2 px-6 pb-6">
            <h2 className="text-xl font-semibold">Detalhes da Coleta</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>
                <strong>Título:</strong> {survey.title}
              </li>
              <li>
                <strong>Descrição:</strong> {survey.description}
              </li>
              <li>
                <strong>Tipo:</strong> {survey.survey_type}
              </li>
            </ul>
          </div>
        ) : (
          <p className="text-red-500">Coleta não encontrada.</p>
        )}
      </motion.div>

      {/* Informações Adicionais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 bg-white rounded-lg shadow-md border-2 w-full p-6"
      >
        <SectionToggle
          title="Informações Adicionais"
          isChecked={showMoreInfo}
          onChange={() => setShowMoreInfo((prev) => !prev)}
        />
        <AnimatePresence>
          {showMoreInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                    Micro-regiões
                  </h2>
                  <Tooltip.Provider delayDuration={100}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button>
                          <MapPin
                            size={16}
                            className="text-gray-400 hover:text-gray-600 transition"
                          />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="top"
                          className="z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-md shadow-lg max-w-xs"
                          sideOffset={6}
                        >
                          Regiões onde a coleta de dados ocorrerá.
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
                {surveyRegions?.length ? (
                  surveyRegions.map((region) => (
                    <div
                      key={region.id}
                      className="flex flex-row justify-between items-center gap-4 p-2 border rounded-md bg-gray-50"
                    >
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {region.name}
                        </p>
                        <p className="text-gray-500">{region.description}</p>
                      </div>
                      <div className="flex flex-row justify-end gap-4">
                        <p className="text-gray-500">
                          <strong>Latitude:</strong> {region.lat}
                        </p>
                        <p className="text-gray-500">
                          <strong>Longitude:</strong> {region.long}
                        </p>
                        <button
                          onClick={() => handleCopyCoords(region)}
                          className="flex items-center gap-2 text-sm text-blue-600 underline hover:text-blue-800 transition"
                        >
                          {copied ? (
                            <Check size={16} className="text-green-600" />
                          ) : (
                            <ClipboardCopy size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhuma região cadastrada.</p>
                )}
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                    Horas de Coleta
                  </h2>
                  <Tooltip.Provider delayDuration={100}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button>
                          <Clock
                            size={16}
                            className="text-gray-400 hover:text-gray-600 transition"
                          />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="top"
                          className="z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-md shadow-lg max-w-xs"
                          sideOffset={6}
                        >
                          Horários exatos de atuação dos pesquisadores em campo.
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
                {surveyTimeRanges?.length ? (
                  surveyTimeRanges.map((range) => (
                    <div
                      key={range.id}
                      className="flex flex-row justify-between items-center gap-4 p-2 border rounded-md bg-gray-50"
                    >
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {range.start_time} - {range.end_time}
                        </p>
                        <p className="text-gray-500">{range.description}</p>
                      </div>
                      <div className="flex flex-row gap-2 items-center">
                        <p className="text-gray-500">
                          <strong>ID:</strong> {range.id}
                        </p>
                        <button
                          onClick={() => handleCopyRange(range)}
                          className="flex items-center gap-2 text-sm text-blue-600 underline hover:text-blue-800 transition"
                        >
                          {copiedRangeId === range.id ? (
                            <Check size={16} className="text-green-600" />
                          ) : (
                            <ClipboardCopy size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Nenhum intervalo de tempo cadastrado.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mapa da Coleta */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 bg-white rounded-lg shadow-md border-2 w-full p-6"
      >
        <SectionToggle
          title="Mapa da Coleta"
          isChecked={showMap}
          onChange={() => setShowMap((prev) => !prev)}
        />
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-sm text-gray-700 border rounded-md p-4 bg-gray-50 space-y-4 "
            >
              {loadingSurvey ? (
                <p className="text-gray-400">Carregando mapa...</p>
              ) : survey?.lat && survey?.long ? (
                <MapPreview
                  lat={survey.lat}
                  lng={survey.long}
                  height="200px"
                  width="100"
                />
              ) : (
                <p className="text-gray-400">Nenhuma localização disponível.</p>
              )}

              <div className="flex flex-row justify-between items-center gap-4 mt-2 text-gray-700 text-sm">
                <motion.p>
                  <strong>Localização:</strong>{" "}
                  {getShortAddress(survey?.location_title)}
                </motion.p>
                <div className="flex flex-row  justify-end gap-4">
                  <motion.p>
                    <strong>Latitude:</strong> {survey?.lat}
                  </motion.p>
                  <motion.p>
                    <strong>Longitude:</strong> {survey?.long}
                  </motion.p>
                  <button
                    onClick={handleCopyCoords}
                    className="flex items-center gap-2 text-sm text-blue-600 underline hover:text-blue-800 transition"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <ClipboardCopy size={20} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Colaboradores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 bg-white rounded-lg shadow-md border-2 w-full p-6"
      >
        <SectionToggle
          title="Colaboradores"
          isChecked={showContributors}
          onChange={() => setShowContributors((prev) => !prev)}
        />
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
        onClick={() =>
          router.push(
            `/researches/${router.query.id}/surveys/${surveyid}/answers?survey_type=${survey?.survey_type}`
          )
        }
        disabled={isLoading}
        variant="primary"
        className="w-fit sm:w-auto px-6 py-2 mt-4 flex items-center gap-2 text-sm"
      >
        <span className="material-symbols-outlined text-base">send</span>
        <span>Responder Pesquisa</span>
      </Button>
    </motion.section>
  );
}

function SectionToggle({ title, isChecked, onChange }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      <Switch type="arrow" checked={isChecked} onChange={onChange} />
    </div>
  );
}

ResearchSurvey.pageName = "Visualizar Coleta";
ResearchSurvey.layout = "private";
