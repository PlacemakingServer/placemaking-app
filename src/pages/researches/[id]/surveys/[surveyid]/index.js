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
  Users,
  MessageSquare,
  Info,
  Map,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Switch from "@/components/ui/Switch";
import { useDynamicSurveys } from "@/hooks/useDynamicSurveys";
import { useFormSurveys } from "@/hooks/useFormSurveys";
import { useStaticSurveys } from "@/hooks/useStaticSurveys";
import { useSurveyContributors } from "@/hooks/useSurveyContributors";
import { useSurveyRegions } from "@/hooks/useSurveyRegions";
import { useUsers } from "@/hooks/useUsers";
import { useSurveyTimeRanges } from "@/hooks/useSurveyTimeRanges";
import { useFields } from "@/hooks/useFields";
import { useResearches } from "@/hooks/useResearches";
import MapPreview from "@/components/map/MapPreviewNoSSR";
import UserCardCompact from "@/components/ui/UserCardCompact";
import { useLoading } from "@/context/LoadingContext";

export default function ResearchSurvey() {
  const router = useRouter();
  const { surveyid } = router.query;
  const { isLoading } = useLoading();

  // Hooks de survey
  const { dynamicSurvey, isLoading: loadingDynamic } =
    useDynamicSurveys(surveyid) || {};
  const { formSurvey, isLoading: loadingForm } = useFormSurveys(surveyid) || {};
  const { staticSurvey, isLoading: loadingStatic } =
    useStaticSurveys(surveyid) || {};
  const survey = dynamicSurvey || formSurvey || staticSurvey || {};

  // Hook de research para pegar start_date/end_date
  const { researchData: selectedResearch, isLoading: loadingResearch } =
    useResearches(true, survey.research_id);

  // Demais hooks
  const { contributors, isLoading: loadingContributors } =
    useSurveyContributors(surveyid);
  const { surveyRegions } = useSurveyRegions(surveyid);
  const { ranges: surveyTimeRanges } = useSurveyTimeRanges(surveyid);
  const { fields } = useFields(surveyid, survey.survey_type);

  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showContributors, setShowContributors] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedRangeId, setCopiedRangeId] = useState(null);
  const [surveyAnswers, setSurveyAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [isWithinTimeRange, setIsWithinTimeRange] = useState(false);
  const [currentTimeStatus, setCurrentTimeStatus] = useState("");
  const [isWithinDateRange, setIsWithinDateRange] = useState(false);

  // Build user lookup
  const allUsers = useUsers()?.users || [];
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));
  const contributorsList =
    contributors?.map((c) => ({ ...c, user: userMap[c.user_id] })) || [];

  // Agrupa respostas por colaborador
  const groupedAnswers = surveyAnswers.reduce((acc, answer) => {
    const cid = answer.contributor_id;
    if (!acc[cid]) {
      acc[cid] = {
        contributor: contributorsList.find((c) => c.id === cid),
        answers: [],
      };
    }
    acc[cid].answers.push(answer);
    return acc;
  }, {});

  const formatDateTime = (s) =>
    new Date(s).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Header image aleatória
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const idx = Math.floor(Math.random() * 5);
    setImageUrl(`/img/cards/img-${idx}.jpg`);
  }, []);

  // Verifica horário
  useEffect(() => {
    if (!surveyTimeRanges?.length) {
      setIsWithinTimeRange(false);
      setCurrentTimeStatus("Nenhum horário de coleta definido");
      return;
    }

    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();

    for (const r of surveyTimeRanges) {
      const [sh, sm] = r.start_time.split(":").map(Number);
      const [eh, em] = r.end_time.split(":").map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      if (minutesNow >= start && minutesNow <= end) {
        setIsWithinTimeRange(true);
        setCurrentTimeStatus(`Coleta ativa: ${r.start_time} - ${r.end_time}`);
        return;
      }
    }

    setIsWithinTimeRange(false);
    const next = surveyTimeRanges.find((r) => {
      const [sh] = r.start_time.split(":").map(Number);
      return minutesNow < sh * 60;
    });

    setCurrentTimeStatus(
      next
        ? `Próxima coleta: ${next.start_time} - ${next.end_time}`
        : "Coleta encerrada para hoje"
    );
  }, [surveyTimeRanges]);

  // Verifica intervalo de datas (do research)
  useEffect(() => {
    if (loadingResearch || !selectedResearch) {
      setIsWithinDateRange(false);
      return;
    }

    const now = new Date();
    const start = new Date(`${selectedResearch.release_date}T00:00:00`);
    const end = new Date(`${selectedResearch.end_date}T23:59:59`);
    setIsWithinDateRange(now >= start && now <= end);
  }, [loadingResearch, selectedResearch]);

  const isSurveyActive = isWithinDateRange && isWithinTimeRange;

  // Busca respostas
  const fetchAnswers = async () => {
    if (!surveyid) return;
    setLoadingAnswers(true);
    try {
      const res = await fetch(`/api/survey-answers/${surveyid}`);
      const data = await res.json();
      setSurveyAnswers(data.answers || []);
    } finally {
      setLoadingAnswers(false);
    }
  };

  useEffect(() => {
    if (showAnswers) fetchAnswers();
  }, [showAnswers]);

  const getShortAddress = (addr) =>
    addr ? addr.split(",").slice(0, 3).join(",").trim() : "";

  const handleCopyCoords = () => {
    if (survey.lat && survey.long) {
      const txt = `${getShortAddress(survey.location_title)}: ${survey.lat}, ${
        survey.long
      }`;
      navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyRange = (r) => {
    navigator.clipboard.writeText(`${r.start_time} - ${r.end_time}`);
    setCopiedRangeId(r.id);
    setTimeout(() => setCopiedRangeId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </Button>

          <div className="text-right">
            <h1 className="text-xl font-bold text-gray-900">
              Detalhes da Coleta
            </h1>
            <p className="text-gray-600 text-sm">
              Visualizar Detalhes
            </p>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-gray-200 overflow-hidden mb-12 rounded-lg shadow-lg"
        >
          <div
            className="relative h-48 overflow-hidden"
            style={{
              backgroundImage: `url('${imageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 from-black/60 to-black/30" />
            <div className="absolute inset-0 flex items-center px-8">
              <div className="text-white">
                <h2 className="text-4xl font-bold mb-2 tracking-wide drop-shadow-lg">
                  {survey.title || "Carregando..."}
                </h2>
                <p className="text-lg opacity-90 font-light">
                  {survey.survey_type && `Tipo: ${survey.survey_type}`}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {loadingDynamic || loadingForm || loadingStatic ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : survey.id ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Descrição
                  </h3>
                  <p className="text-lg text-gray-900 font-light leading-relaxed">
                    {survey.description || "Nenhuma descrição disponível"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 text-lg font-medium">
                  Coleta não encontrada
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Status Alerts */}
        <div className="space-y-4 mb-12">
          {!isWithinDateRange &&
            !loadingResearch &&
            selectedResearch?.release_date &&
            selectedResearch?.end_date && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="shadow-lg"
              >
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium">
                    Fora do período de coleta. Disponível de{" "}
                    {selectedResearch.release_date} até{" "}
                    {selectedResearch.end_date}.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

          {surveyTimeRanges?.length > 0 && isWithinDateRange && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="shadow-lg"
            >
              <Alert
                className={`${
                  isWithinTimeRange
                    ? "border-green-200 bg-green-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <Clock
                  className={`h-5 w-5 ${
                    isWithinTimeRange ? "text-green-600" : "text-amber-600"
                  }`}
                />
                <AlertDescription
                  className={`font-medium ${
                    isWithinTimeRange ? "text-green-800" : "text-amber-800"
                  }`}
                >
                  <strong>Status da Coleta:</strong> {currentTimeStatus}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Informações Adicionais */}
          <DetailSection
            title="Informações Adicionais"
            icon={<Info className="w-6 h-6" />}
            isOpen={showMoreInfo}
            onToggle={() => setShowMoreInfo((p) => !p)}
          >
            <div className="space-y-8">
              <div>
                <SectionHeader
                  icon={<MapPin className="w-5 h-5" />}
                  title="Micro-regiões"
                />
                {surveyRegions?.length ? (
                  <div className="space-y-4">
                    {surveyRegions.map((r) => (
                      <RegionRow
                        key={r.id}
                        region={r}
                        onCopy={handleCopyCoords}
                        copied={copied}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Nenhuma região cadastrada" />
                )}
              </div>

              <div>
                <SectionHeader
                  icon={<Clock className="w-5 h-5" />}
                  title="Horas de Coleta"
                />
                {surveyTimeRanges?.length ? (
                  <div className="space-y-4">
                    {surveyTimeRanges.map((r) => (
                      <TimeRangeRow
                        key={r.id}
                        range={r}
                        onCopy={() => handleCopyRange(r)}
                        copied={copiedRangeId === r.id}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Nenhum intervalo cadastrado" />
                )}
              </div>
            </div>
          </DetailSection>

          {/* Mapa */}
          <DetailSection
            title="Mapa da Coleta"
            icon={<Map className="w-6 h-6" />}
            isOpen={showMap}
            onToggle={() => setShowMap((p) => !p)}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                {survey.lat && survey.long ? (
                  <MapPreview
                    lat={survey.lat}
                    lng={survey.long}
                    height="300px"
                    width="100%"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <EmptyState message="Nenhuma localização disponível" />
                  </div>
                )}
              </div>

              {survey.lat && survey.long && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Localização
                      </h4>
                      <p className="text-lg text-gray-900 font-light">
                        {getShortAddress(survey.location_title)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Lat:</span> {survey.lat}
                        </p>
                        <p>
                          <span className="font-medium">Long:</span>{" "}
                          {survey.long}
                        </p>
                      </div>
                      <button
                        onClick={handleCopyCoords}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <ClipboardCopy className="w-4 h-4" />
                        )}
                        <span>{copied ? "Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Colaboradores */}
          <DetailSection
            title="Colaboradores"
            icon={<Users className="w-6 h-6" />}
            isOpen={showContributors}
            onToggle={() => setShowContributors((p) => !p)}
          >
            {loadingContributors ? (
              <LoadingPlaceholder />
            ) : contributorsList.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contributorsList.map((c) => (
                  <UserCardCompact
                    key={c.id}
                    user={{
                      id: c.user?.id,
                      name: c.user?.name,
                      role: c.user?.role,
                      status: c.user?.status,
                      email: c.user?.email,
                      instruction: c.instruction,
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="Nenhum colaborador atribuído" />
            )}
          </DetailSection>

          {/* Respostas */}
          <DetailSection
            title={`Respostas${
              surveyAnswers.length ? ` (${surveyAnswers.length})` : ""
            }`}
            icon={<MessageSquare className="w-6 h-6" />}
            isOpen={showAnswers}
            onToggle={() => setShowAnswers((p) => !p)}
          >
            {loadingAnswers ? (
              <LoadingPlaceholder />
            ) : Object.keys(groupedAnswers).length ? (
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {Object.entries(groupedAnswers).map(([cid, data]) => (
                  <AnswerGroup
                    key={cid}
                    data={data}
                    fields={fields}
                    ranges={surveyTimeRanges}
                    formatDateTime={formatDateTime}
                  />
                ))}
              </div>
            ) : (
              <NoAnswers />
            )}
          </DetailSection>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mt-16"
        >
          <Button
            onClick={() =>
              router.push(
                `/researches/${router.query.id}/surveys/${surveyid}/answers?survey_type=${survey.survey_type}`
              )
            }
            disabled={isLoading || !isSurveyActive}
            className={`px-12 py-4 text-lg font-medium tracking-wide transition-all duration-200 ${
              !isSurveyActive
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "bg-gray-900 hover:bg-black text-white shadow-lg hover:shadow-xl"
            }`}
          >
            <span className="material-symbols-outlined text-xl mr-3">send</span>
            <span className="text-lg">
              {!isWithinDateRange
                ? "Fora do período de coleta"
                : !isWithinTimeRange
                ? "Fora do horário de coleta"
                : "Responder Pesquisa"}
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="text-gray-600">{icon}</div>
      <h3 className="text-xl font-light text-gray-900 tracking-wide">
        {title}
      </h3>
      <div className="flex-1 h-px bg-gray-200 ml-4"></div>
    </div>
  );
}

function RegionRow({ region, onCopy, copied }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {region.name}
          </h4>
          <p className="text-gray-600 leading-relaxed">{region.description}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-500 space-y-1">
            <p>
              <span className="font-medium">Lat:</span> {region.lat}
            </p>
            <p>
              <span className="font-medium">Long:</span> {region.long}
            </p>
          </div>
          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <ClipboardCopy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function TimeRangeRow({ range, onCopy, copied }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {range.start_time} - {range.end_time}
          </h4>
          <p className="text-gray-600 leading-relaxed">{range.description}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-500">
            <span className="font-medium">ID:</span> {range.id}
          </div>
          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <ClipboardCopy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, icon, isOpen, onToggle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-gray-200 overflow-hidden shadow-lg"
    >
      <div className="flex justify-between items-center p-8 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="text-gray-600">{icon}</div>
          <h2 className="text-2xl font-light text-gray-900 tracking-wide">
            {title}
          </h2>
        </div>
        <Switch type="arrow" checked={isOpen} onChange={onToggle} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
        <AlertCircle className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg font-light">{message}</p>
    </div>
  );
}

function NoAnswers() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <MessageSquare className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-light text-gray-900 mb-2">
        Nenhuma resposta encontrada
      </h3>
      <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
        As respostas aparecerão aqui quando os colaboradores enviarem suas
        coletas.
      </p>
    </div>
  );
}

function AnswerGroup({ data, fields, ranges, formatDateTime }) {
  const contributor = data.contributor;
  const first = data.answers[0];
  const timestamp = first?.registered_at;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 shadow-lg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {contributor?.user?.name || "Colaborador não identificado"}
            </h4>
            <p className="text-sm text-gray-500">{contributor?.user?.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatDateTime(timestamp)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {data.answers.map((ans, idx) => {
          const field = fields.find((f) => f.id === ans.field_id);
          const title = field?.title || `Campo ${ans.field_id}`;
          const range = ranges.find((r) => r.id === ans.survey_time_range_id);
          const rangeText = range
            ? `${range.start_time} - ${range.end_time}`
            : null;

          return (
            <div
              key={idx}
              className="bg-gray-50 rounded-lg p-4 border border-gray-100shadow-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                  {title}
                </span>
                {rangeText && (
                  <Badge
                    variant="outline"
                    className="text-xs flex items-center space-x-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{rangeText}</span>
                  </Badge>
                )}
              </div>
              <p className="text-gray-900 font-medium text-lg leading-relaxed">
                {ans.value}
              </p>
              {ans.survey_group_id && (
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">
                  Grupo: {ans.survey_group_id}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

ResearchSurvey.pageName = "Visualizar Coleta";
ResearchSurvey.layout = "private";
