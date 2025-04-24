import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ClipboardCopy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import {
  getCachedData,
  syncLocalToServer,
  syncServerToCache,
} from "@/services/cache";
import Button from "@/components/ui/Button_og";
import { VARIANTS } from "@/config/colors";
import UserCardCompact from "@/components/ui/UserCardCompact";
import MapPreview from "@/components/map/MapPreviewNoSSR";

export default function ResearchView() {
  const [researches, setResearches] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [contributorsData, setContributorsData] = useState(null);
  const [showContributors, setShowContributors] = useState(false);
  const [showSurveys, setshowSurveys] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isLoading, setIsLoading } = useLoading();
  const { showMessage } = useMessage();
  const router = useRouter();
  const { id } = router.query;
  const [imageUrl, setImageUrl] = useState("");

  const loadCachedResearches = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCachedData("researches", { paginated: false });
      setResearches(result);

      if (id && Array.isArray(result)) {
        const found = result.find((r) => r.id === id);
        setSelectedResearch(found);
      }
    } catch (err) {
      console.error("Erro ao carregar pesquisas do cache:", err);
      showMessage("Erro ao carregar pesquisas.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [id, setIsLoading, showMessage]);

  const loadCachedSurveys = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCachedData("surveys", { paginated: false });
      setSurveys(result);
    } catch (err) {
      console.error("Erro ao carregar coletas do cache:", err);
      showMessage("Erro ao carregar coletas.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showMessage]);

  const fetchResearchContributorsData = useCallback(
    async (id) => {
      try {
        const res = await fetch(`/api/contributors?research_id=${id}`);
        const data = await res.json();

        if (!data) {
          showMessage("Colaboradores não encontrados", "vermelho_claro", 5000);
          return;
        }
        setContributorsData(data);
      } catch (err) {
        console.error("Erro ao buscar colaboradores da pesquisa:", err);
      }
    },
    [showMessage]
  );

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

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncLocalToServer("surveys");
      await syncServerToCache("surveys", {
        research_id: selectedResearch?.id,
        survey_type: "all",
      });
      showMessage("Coletas sincronizadas com sucesso!", "azul_claro");
      loadCachedSurveys();
    } catch (err) {
      console.error("Erro ao sincronizar Coletas:", err);
      showMessage("Erro ao sincronizar Coletas.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getShortAddress = (fullAddress) => {
    if (!fullAddress) return "";
    const parts = fullAddress.split(",");
    return parts.slice(0, 3).join(",").trim();
  };

  useEffect(() => {
    if (id) {
      loadCachedResearches();
      loadCachedSurveys();
      fetchResearchContributorsData(id);
    }
  }, [
    id,
    loadCachedResearches,
    loadCachedSurveys,
    fetchResearchContributorsData,
  ]);

  useEffect(() => {
    const idx = Math.floor(Math.random() * 5);
    setImageUrl(`/img/cards/img-${idx}.jpg`);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-screen-lg mx-auto p-6 md:p-8 box-border"
    >
      {/* Cabeçalho e Detalhes da Pesquisa */}

      <div className="flex flex-row gap-2 justify-between items-start">
        <div className="flex flex-col flex-start">
          <h1 className="text-2xl font-bold p-4">Sincronizar Coletas: </h1>
          <motion.p className="text-sm text-gray-500 p-4">
            Clique no botão "Atualizar" para sincronizar as coletas com o
            servidor.
            <br />
            <strong>Observação:</strong> As coletas podem demorar alguns
            segundos.
          </motion.p>
        </div>
        <Button
          onClick={handleSync}
          disabled={isLoading}
          className="w-full sm:w-fit self-start sm:self-auto px-4 py-2 transition flex items-center justify-center gap-2 text-sm h-fit m-4"
          variant="secondary"
        >
          <span className="material-symbols-outlined text-base">sync</span>
          <span>Atualizar</span>
        </Button>
      </div>

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
            <strong>Início:</strong> {selectedResearch?.release_date}
          </motion.p>
          <motion.p>
            <strong>Fim:</strong> {selectedResearch?.end_date}
          </motion.p>
          <motion.div className="flex justify-between gap-2">
            <motion.p>
              <strong>Criada por:</strong> {selectedResearch?.created_by?.name}
            </motion.p>

            <motion.p
              className={`flex-shrink-0 truncate max-w-[58px] px-2 py-1 text-xs font-semibold rounded justify-end ${
                VARIANTS[selectedResearch?._syncStatus] || VARIANTS.verde
              }`}
            >
              {selectedResearch?._syncStatus}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Seção Colaboradores com Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border border-2 mt-4 h-fit"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <button
            onClick={() => setShowContributors((prev) => !prev)}
            className="flex items-center gap-1 text-sm text-blue-600 underline hover:text-blue-800 transition"
          >
            <motion.div
              animate={{ rotate: showContributors ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={28} />
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
              {contributorsData === null ? (
                <p className="text-gray-400">Carregando colaboradores...</p>
              ) : contributorsData.length === 0 ? (
                <p className="text-gray-400">Nenhum colaborador encontrado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {contributorsData.map((user) => (
                    <UserCardCompact
                      key={user.value}
                      user={{
                        id: user.id,
                        name: user.label,
                        role: user.role,
                        status: user.status,
                        email: user.email,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Seção Mapa com Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border border-2 mt-4 h-fit"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mapa</h1>
          <button
            onClick={() => setShowMap((prev) => !prev)}
            className="flex items-center gap-1 text-sm text-blue-600 underline hover:text-blue-800 transition"
          >
            <motion.div
              animate={{ rotate: showMap ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={28} />
            </motion.div>
          </button>
        </div>

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
                </div>
              </div>
              <button
                onClick={handleCopyCoords}
                className="flex items-center gap-2 text-sm text-blue-600 underline hover:text-blue-800 transition"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <ClipboardCopy size={20} />
                    Copiar localização
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border border-2 mt-4 h-fit"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Coletas</h1>
          <button
            onClick={() => setshowSurveys((prev) => !prev)}
            className="flex items-center gap-1 text-sm text-blue-600 underline hover:text-blue-800 transition"
          >
            <motion.div
              animate={{ rotate: showSurveys ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={28} />
            </motion.div>
          </button>
        </div>
        {showSurveys && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-sm text-gray-700 border rounded-md p-4 bg-gray-50 space-y-4"
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
                <div key={type}>
                  <h3 className="text-sm font-semibold text-gray-800 capitalize mb-2">
                    {type}
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {group.map((survey) => (
                      <li key={survey.id}>
                        {survey.title || `Survey ${survey.id}`}
                        <span className="text-gray-500 text-xs ml-2">
                          {survey.description}
                        </span>
                        <button
                          onClick={() =>
                            router.push(
                              `/researches/${selectedResearch.id}/surveys/${survey.id}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 transition ml-2"
                        >
                          Ver detalhes
                        </button>
                        <span className="text-gray-500 text-xs ml-2">
                          {survey._syncStatus}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ));
            })()}
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  );
}

ResearchView.pageName = "Visualizar Pesquisa";
ResearchView.layout = "private";
