"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import {
  ClipboardCopy,
  Check,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Switch from "@/components/ui/Switch";
import * as Tooltip from "@radix-ui/react-tooltip";

import { useDynamicSurveys } from "@/hooks/useDynamicSurveys";
import { useFormSurveys } from "@/hooks/useFormSurveys";
import { useStaticSurveys } from "@/hooks/useStaticSurveys";
import { useSurveyContributors } from "@/hooks/useSurveyContributors";
import { useSurveyRegions } from "@/hooks/useSurveyRegions";
import { useUsers } from "@/hooks/useUsers";
import { useSurveyTimeRanges } from "@/hooks/useSurveyTimeRanges";
import { useLoading } from "@/context/LoadingContext";
import MapPreview from "@/components/map/MapPreviewNoSSR";
import UserCardCompact from "@/components/ui/UserCardCompact";
import { useFields } from "@/hooks/useFields";

export default function ResearchSurvey() {
  const router = useRouter();
  const { surveyid } = router.query;

  const { isLoading } = useLoading();
  const { dynamicSurvey, isLoading: loadingSurvey } =
    useDynamicSurveys(surveyid) || {};
  const { formSurvey, isLoading: loadingFormSurvey } =
    useFormSurveys(surveyid) || {};
  const { staticSurvey, isLoading: loadingStaticSurvey } =
    useStaticSurveys(surveyid) || {};
  const { contributors, isLoading: loadingContributors } =
    useSurveyContributors(surveyid);
  const { surveyRegions } = useSurveyRegions(surveyid);
  const { ranges: surveyTimeRanges } = useSurveyTimeRanges(surveyid);
  const { fields } = useFields(
    surveyid,
    dynamicSurvey?.survey_type ||
      formSurvey?.survey_type ||
      staticSurvey?.survey_type
  );

  const survey = dynamicSurvey || formSurvey || staticSurvey;

  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showContributors, setShowContributors] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [copiedRangeId, setCopiedRangeId] = useState(null);
  const [surveyAnswers, setSurveyAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [isWithinTimeRange, setIsWithinTimeRange] = useState(false);
  const [currentTimeStatus, setCurrentTimeStatus] = useState("");

  const allUsers = useUsers()?.users || {};
  const userMap = Object.fromEntries(allUsers.map((user) => [user.id, user]));

  const getShortAddress = (fullAddress) => {
    if (!fullAddress) return "";
    const parts = fullAddress.split(",");
    return parts.slice(0, 3).join(",").trim();
  };

  const contributorsList =
    contributors?.map((contributor) => ({
      ...contributor,
      user: userMap[contributor.user_id] || null,
    })) || [];

  // Group answers by contributor
  const groupedAnswers = surveyAnswers.reduce((acc, answer) => {
    const contributorId = answer.contributor_id;
    if (!acc[contributorId]) {
      acc[contributorId] = {
        contributor: contributorsList.find((c) => c.id === contributorId),
        answers: [],
      };
    }
    acc[contributorId].answers.push(answer);
    return acc;
  }, {});

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const idx = Math.floor(Math.random() * 5);
    setImageUrl(`/img/cards/img-${idx}.jpg`);
  }, []);

  // Check if current time is within survey time ranges
  useEffect(() => {
    const checkTimeRange = () => {
      if (!surveyTimeRanges || !surveyTimeRanges.length) {
        setIsWithinTimeRange(false);
        setCurrentTimeStatus("Nenhum horário de coleta definido");
        return;
      }

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

      for (const range of surveyTimeRanges) {
        const [startHour, startMinute] = range.start_time
          .split(":")
          .map(Number);
        const [endHour, endMinute] = range.end_time.split(":").map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        if (currentTime >= startTime && currentTime <= endTime) {
          setIsWithinTimeRange(true);
          setCurrentTimeStatus(
            `Coleta ativa: ${range.start_time} - ${range.end_time}`
          );
          return;
        }
      }

      setIsWithinTimeRange(false);
      const nextRange = surveyTimeRanges.find((range) => {
        const [startHour, startMinute] = range.start_time
          .split(":")
          .map(Number);
        const startTime = startHour * 60 + startMinute;
        return currentTime < startTime;
      });

      if (nextRange) {
        setCurrentTimeStatus(
          `Próxima coleta: ${nextRange.start_time} - ${nextRange.end_time}`
        );
      } else {
        setCurrentTimeStatus("Coleta encerrada para hoje");
      }
    };

    checkTimeRange();
    const interval = setInterval(checkTimeRange, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [surveyTimeRanges]);

  // Fetch survey answers
  const fetchSurveyAnswers = async () => {
    if (!surveyid) return;

    setLoadingAnswers(true);
    try {
      const response = await fetch(`/api/survey-answers/${surveyid}`);
      if (response.ok) {
        const data = await response.json();
        setSurveyAnswers(data.answers || []);
      }
    } catch (error) {
      console.error("Error fetching survey answers:", error);
    } finally {
      setLoadingAnswers(false);
    }
  };

  useEffect(() => {
    if (showAnswers && surveyid) {
      fetchSurveyAnswers();
    }
  }, [showAnswers, surveyid]);

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
    setCopiedRangeId(range.id);
    setTimeout(() => setCopiedRangeId(null), 2000);
  };

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
      {/* Header com botão de voltar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full flex items-center justify-between mb-4"
      >
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-300"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Button>
        <div className="text-right">
          <h1 className="text-xl font-semibold text-gray-900">
            Detalhes da Coleta
          </h1>
          <p className="text-sm text-gray-500">
            Visualizar informações e respostas
          </p>
        </div>
      </motion.div>
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
          <p className="text-gray-600 italic p-6">
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
          <p className="text-red-500 p-6">Coleta não encontrada.</p>
        )}
      </motion.div>

      {/* Time Range Status Alert */}
      {surveyTimeRanges && surveyTimeRanges.length > 0 && (
        <Alert
          className={`w-full ${
            isWithinTimeRange
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <Clock
            className={`h-4 w-4 ${
              isWithinTimeRange ? "text-green-600" : "text-amber-600"
            }`}
          />
          <AlertDescription
            className={isWithinTimeRange ? "text-green-800" : "text-amber-800"}
          >
            <strong>Status da Coleta:</strong> {currentTimeStatus}
          </AlertDescription>
        </Alert>
      )}

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
              className="mt-4 text-sm text-gray-700 border rounded-md p-4 bg-gray-50 space-y-4"
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
                <div className="flex flex-row justify-end gap-4">
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
                  {contributorsList.length === 0 ? (
                    <p className="text-gray-400">
                      Nenhum colaborador encontrado.
                    </p>
                  ) : (
                    contributorsList.map((contributor) => (
                      <UserCardCompact
                        key={contributor.id}
                        user={{
                          id: contributor.user?.id,
                          name: contributor.user?.name,
                          role: contributor.user?.role,
                          status: contributor.user?.status,
                          email: contributor.user?.email,
                          instruction: contributor.instruction,
                        }}
                      />
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-400">
                  Nenhum contribuidor atribuído para essa coleta.
                </p>
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
        <SectionToggle
          title={`Respostas ${
            surveyAnswers.length > 0 ? `(${surveyAnswers.length})` : ""
          }`}
          isChecked={showAnswers}
          onChange={() => setShowAnswers((prev) => !prev)}
        />
        <AnimatePresence>
          {showAnswers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {loadingAnswers ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(groupedAnswers).length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(groupedAnswers).map(
                    ([contributorId, data]) => {
                      const contributor = contributorsList.find(
                        (c) => c.id === contributorId
                      );
                      const contributorName =
                        contributor?.user?.name ||
                        "Colaborador não identificado";

                      return (
                        <div
                          key={contributorId}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          {/* Header do Contribuidor */}
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {contributorName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {contributor?.user?.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {formatDateTime(data.answers[0]?.registered_at)}
                              </span>
                            </div>
                          </div>

                          {/* Respostas */}
                          <div className="space-y-3">
                            {data.answers.map((answer, index) => {
                              const field = fields?.find(
                                (f) => f.id === answer.field_id
                              );
                              const fieldTitle =
                                field?.title || `Campo ${answer.field_id}`;
                              const timeRange = surveyTimeRanges?.find(
                                (r) => r.id === answer.survey_time_range_id
                              );
                              const timeRangeText = timeRange
                                ? `${timeRange.start_time} - ${timeRange.end_time}`
                                : null;

                              return (
                                <div
                                  key={index}
                                  className="bg-white rounded-md p-3 border border-gray-100"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {fieldTitle}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      {timeRangeText && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs flex items-center space-x-1"
                                        >
                                          <Clock className="w-3 h-3" />
                                          <span>{timeRangeText}</span>
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-gray-900 font-medium">
                                    {answer.value}
                                  </p>
                                  {answer.survey_group_id && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Grupo: {answer.survey_group_id}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Nenhuma resposta encontrada
                  </p>
                  <p className="text-gray-400 text-sm">
                    As respostas aparecerão aqui quando os colaboradores
                    enviarem suas coletas.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Botão de Responder */}
      <div className="w-full flex justify-center">
        <Button
          onClick={() =>
            router.push(
              `/researches/${router.query.id}/surveys/${surveyid}/answers?survey_type=${survey?.survey_type}`
            )
          }
          disabled={isLoading || !isWithinTimeRange}
          className={`px-6 py-3 flex items-center gap-2 text-sm font-medium transition-all ${
            !isWithinTimeRange
              ? "bg-gray-400 cursor-not-allowed opacity-50"
              : "bg-slate-900 hover:bg-black"
          }`}
        >
          <span className="material-symbols-outlined text-base">send</span>
          <span>
            {!isWithinTimeRange
              ? "Fora do horário de coleta"
              : "Responder Pesquisa"}
          </span>
        </Button>
      </div>
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
