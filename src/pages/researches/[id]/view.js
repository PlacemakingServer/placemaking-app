"use client";

import { useState, useEffect } from "react";
import { ClipboardCopy, Check, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import UserCardCompact from "@/components/ui/UserCardCompact";
import MapPreview from "@/components/map/MapPreviewNoSSR";
import Switch from "@/components/ui/Switch";
import Button from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";
import { useAuthentication } from "@/hooks";
import { toast } from "react-hot-toast";
import { syncResearchData } from "@/services/sync_data_service";

import { useDynamicSurveys } from "@/hooks/useDynamicSurveys";
import { useFormSurveys } from "@/hooks/useFormSurveys";
import { useStaticSurveys } from "@/hooks/useStaticSurveys";
import { useResearchContributors } from "@/hooks/useResearchContributors";
import { useResearches } from "@/hooks/useResearches";
import { useUsers } from "@/hooks/useUsers";

export default function ResearchView() {
  const router = useRouter();
  const { id } = router.query;

  const { dynamicSurvey, dynamicSurveyError } = useDynamicSurveys(id);
  const { formSurvey, formSurveyError } = useFormSurveys(id);
  const { staticSurvey, unSyncedstaticSurveys } = useStaticSurveys(id);
  const { contributors: contributorsData } = useResearchContributors(id);
  const { researchData: selectedResearch } = useResearches(true, id);
  const { users: allUsers } = useUsers() || null;
  const { user: currentUser } = useAuthentication();

  const [showContributors, setShowContributors] = useState(false);
  const [showSurveys, setshowSurveys] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [copied, setCopied] = useState(false);
  const [surveyContributors, setSurveyContributors] = useState({});
  const { setIsLoading } = useLoading();

  const [imageUrl, setImageUrl] = useState("");

  const { userData: author } =
    useUsers(true, selectedResearch?.created_by) || null;

  const surveys = [dynamicSurvey, formSurvey, staticSurvey].filter(
    (survey) => survey !== null
  );

  const userMap = allUsers
    ? Object.fromEntries(allUsers.map((user) => [user.id, user]))
    : {};

  const contributorsList =
    contributorsData?.map((contributor) => ({
      ...contributor,
      user: userMap[contributor.user_id] || null,
    })) || [];

  // Check if current user is admin
  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "administrator";

  // Fetch contributors for each survey to check access
  useEffect(() => {
    const fetchSurveyContributors = async () => {
      if (!surveys.length || !currentUser) return;

      const contributorsMap = {};

      for (const survey of surveys) {
        try {
          const response = await fetch(
            `/api/survey-contributors?survey_id=${survey.id}`
          );
          if (response.ok) {
            const data = await response.json();
            contributorsMap[survey.id] = data.contributors || [];
          }
        } catch (error) {
          console.error(
            `Error fetching contributors for survey ${survey.id}:`,
            error
          );
          contributorsMap[survey.id] = [];
        }
      }

      setSurveyContributors(contributorsMap);
    };

    fetchSurveyContributors();
  }, [currentUser]);

  // Check if user has access to a specific survey
  const hasAccessToSurvey = () => {
    // admins sempre True
    if (isAdmin) return true;

    // se ainda não veio o array, bate False
    if (!Array.isArray(contributorsList)) return false;

    // se algum contributor.user_id bate com currentUser.id → True
    return contributorsList.some((c) => c.user_id === currentUser?.id);
  };

  const handleSurveyAccess = (survey) => {
    if (!hasAccessToSurvey(survey.id)) {
      toast.error("Você não tem permissão para acessar esta coleta.");
      return;
    }

    router.push(`/researches/${selectedResearch.id}/surveys/${survey.id}`);
  };

  const handleCopyCoords = () => {
    const name = selectedResearch?.location_title;
    const lat = selectedResearch?.lat;
    const lng = selectedResearch?.long;
    if (lat && lng) {
      navigator.clipboard.writeText(`${getShortAddress(name)}: ${lat}, ${lng}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getShortAddress = (fullAddress) => {
    if (!fullAddress) return "";
    const parts = fullAddress.split(",");
    return parts.slice(0, 3).join(",").trim();
  };

  useEffect(() => {
    const idx = Math.floor(Math.random() * 5);
    setImageUrl(`/img/cards/img-${idx}.jpg`);
  }, []);

  useEffect(() => {
    console.log("contributors:", contributorsList);
  }, [contributorsList]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-screen-lg mx-auto p-6 md:p-8 box-border"
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
            Detalhes da Pesquisa
          </h1>
          <p className="text-sm text-gray-500">
            Visualizar informações e respostas
          </p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 bg-white rounded-lg shadow-md box-border border-2"
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
              {selectedResearch?.title}
            </h2>
          </div>
        </motion.div>

        <div className="px-6 pb-6 md:px-8 flex flex-col gap-4">
          <motion.p>
            <strong>Descrição:</strong> {selectedResearch?.description}
          </motion.p>
          <motion.p>
            <strong>Início:</strong>{" "}
            {new Date(selectedResearch?.release_date).toLocaleDateString(
              "pt-BR"
            )}
          </motion.p>
          <motion.p>
            <strong>Fim:</strong>{" "}
            {new Date(selectedResearch?.end_date).toLocaleDateString("pt-BR")}
          </motion.p>
          <motion.p>
            <strong>Criada por:</strong> {author?.name}
          </motion.p>
        </div>

        <div className="px-6 pb-8 md:px-8">
          <button
            onClick={async () => {
              if (!selectedResearch?.lat || !selectedResearch?.long) {
                toast.error("Lat/Lon da pesquisa ainda não carregados.");
                return;
              }

              setIsLoading(true);
              try {
                await syncResearchData(selectedResearch);
                toast.success("Dados e mapa baixados para uso offline!");
              } catch (err) {
                console.error("[sync]", err);
                toast.error("Não foi possível sincronizar os dados.");
              } finally {
                setIsLoading(false);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Baixar dados da pesquisa
          </button>
        </div>
      </motion.div>

      {/* Seção Mapa com Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border border-2 mt-4 h-fit"
      >
        <SectionToggle
          title="Mapa"
          isChecked={showMap}
          onChange={() => setShowMap((prev) => !prev)}
        />

        <AnimatePresence>
          {showMap && selectedResearch?.lat && selectedResearch?.long && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-sm text-gray-700 border rounded-md p-4 bg-gray-50 space-y-4 "
            >
              <MapPreview
                lat={selectedResearch.lat}
                lng={selectedResearch.long}
                height="200px"
                width="100"
              />
              <div className="flex flex-row justify-between items-center gap-4">
                <motion.p>
                  <strong>Localização:</strong>{" "}
                  {getShortAddress(selectedResearch?.location_title)}
                </motion.p>
                <div className="flex flex-row  justify-end gap-4">
                  <motion.p>
                    <strong>Latitude:</strong> {selectedResearch?.lat}
                  </motion.p>
                  <motion.p>
                    <strong>Longitude:</strong> {selectedResearch?.long}
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

      {/* Seção Colaboradores com Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border border-2 mt-4 h-fit"
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
              {contributorsList === null ? (
                <p className="text-gray-400">Carregando colaboradores...</p>
              ) : contributorsList.length === 0 ? (
                <p className="text-gray-400">Nenhum colaborador encontrado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {contributorsList.map((user) => (
                    <UserCardCompact
                      key={user.id}
                      user={{
                        id: user.user?.id,
                        name: user.user?.name,
                        role: user.user?.role,
                        status: user.user?.status,
                        email: user.user?.email,
                        instruction: user.instruction,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Seção de Coletas com Controle de Acesso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border border-2 mt-4 h-fit"
      >
        <SectionToggle
          title="Coletas"
          isChecked={showSurveys}
          onChange={() => setshowSurveys((prev) => !prev)}
        />
        {showSurveys && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-sm text-gray-700 px-2 w-full flex flex-col gap-4"
          >
            {(() => {
              const filteredSurveys = surveys.filter(
                (s) => s.research_id === selectedResearch.id
              );

              if (filteredSurveys.length === 0) {
                return (
                  <div className="text-gray-500 italic">
                    Nenhuma survey vinculada a esta pesquisa.
                  </div>
                );
              }

              const grouped = filteredSurveys.reduce((acc, survey) => {
                const type = survey.survey_type || "outros";
                acc[type] = acc[type] || [];
                acc[type].push(survey);
                return acc;
              }, {});

              return Object.entries(grouped).map(([type, group]) => (
                <motion.div
                  key={type}
                  className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4"
                >
                  <h3 className="text-xl font-semibold text-gray-800 capitalize">
                    {type}
                  </h3>

                  {group.map((survey, idx) => {
                    const hasAccess = hasAccessToSurvey();

                    return (
                      <div
                        key={survey.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 border rounded-lg shadow-sm transition hover:shadow-md ${
                          idx !== 0 ? "mt-2" : ""
                        } ${!hasAccess ? "opacity-60" : ""}`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {survey.title || `Survey ${survey.id}`}
                            </span>
                            {!hasAccess && (
                              <Lock
                                className="w-4 h-4 text-gray-500"
                                title="Acesso restrito"
                              />
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {survey.description || "Sem descrição"}
                          </span>
                          {!hasAccess && !isAdmin && (
                            <span className="text-xs text-red-500 mt-1">
                              Você não é contribuidor desta coleta
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSurveyAccess(survey)}
                            disabled={!hasAccess}
                            className={`transition ${
                              hasAccess
                                ? "text-blue-600 hover:text-blue-800 cursor-pointer"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                            title={
                              hasAccess ? "Visualizar coleta" : "Acesso negado"
                            }
                          >
                            <span className="material-symbols-outlined text-2xl">
                              {hasAccess ? "visibility" : "visibility_off"}
                            </span>
                          </button>

                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              survey._syncStatus === "synced"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {survey._syncStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ));
            })()}
          </motion.div>
        )}
      </motion.div>
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

ResearchView.pageName = "Visualizar Pesquisa";
ResearchView.layout = "private";
