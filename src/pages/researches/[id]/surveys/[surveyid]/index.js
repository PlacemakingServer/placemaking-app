import React, { useState, useEffect, useCallback } from "react";
import { Check, ClipboardCopy, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { getCachedData } from "@/services/cache";
import UserCardCompact from "@/components/ui/UserCardCompact";
import Button from "@/components/ui/Button_og";

import { VARIANTS } from "@/config/colors";

export default function ResearchSurvey() {
  const { isLoading, setIsLoading } = useLoading();
  const { showMessage } = useMessage();
  const router = useRouter();

  const { surveyid } = router.query;
  const [contributorsData, setContributorsData] = useState(null);
  const [contributorsFetched, setContributorsFetched] = useState(false);
  const [showContributors, setShowContributors] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadCachedSurveys = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCachedData("surveys", { paginated: false });

      if (Array.isArray(result)) {
        const found = result.find((r) => r.id === surveyid);
        setSelectedSurvey(found);
      }
    } catch (err) {
      console.error("Erro ao carregar surveys do cache:", err);
      showMessage("Erro ao carregar survey.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [surveyid, setIsLoading, showMessage]);

  const fetchSurveyContributorsData = useCallback(
    async (id) => {
      try {
        const res = await fetch(`/api/survey_contributors?survey_id=${id}`);
        const data = await res.json();

        setContributorsFetched(true);

        if (!data || !Array.isArray(data.contributors)) {
          showMessage("Colaboradores não encontrados", "vermelho_claro", 5000);
          setContributorsData([]);
          return;
        }

        setContributorsData(data.contributors);
      } catch (err) {
        console.error("Erro ao buscar colaboradores da coleta:", err);
        showMessage("Erro ao carregar colaboradores.", "vermelho_claro", 5000);
      }
    },
    [showMessage]
  );

  useEffect(() => {
    if (surveyid) {
      loadCachedSurveys();

      if (!contributorsFetched) {
        fetchSurveyContributorsData(surveyid);
      }
    }
  }, [surveyid, loadCachedSurveys, fetchSurveyContributorsData, contributorsFetched]);

  const getShortAddress = (fullAddress) => {
    if (!fullAddress) return "";
    const parts = fullAddress.split(",");
    return parts.slice(0, 3).join(",").trim();
  };

  const handleCopyCoords = () => {
    const name = selectedSurvey?.location_title;
    const lat = selectedSurvey?.lat;
    const lng = selectedSurvey?.long;
    if (lat && lng) {
      navigator.clipboard.writeText(`${getShortAddress(name)}: ${lat}, ${lng}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showNoContributorsMsg = contributorsFetched && contributorsData?.length === 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-screen-lg mx-auto p-6 md:p-8 box-border flex flex-col gap-2 items-center"
    >
      {/* Cabeçalho e Detalhes da Pesquisa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 bg-white rounded-lg shadow-md box-border border-2 w-full"
      >
        <div className="flex flex-col gap-2 p-4">
          <h1 className="text-2xl font-bold">Coleta</h1>

          {!selectedSurvey ? (
            <p className="text-gray-600 italic">
              Carregando detalhes da coleta...
            </p>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Detalhes da Coleta</h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>
                  <strong>Título:</strong> {selectedSurvey.title}
                </li>
                <li>
                  <strong>Descrição:</strong> {selectedSurvey.description}
                </li>
                <li>
                  <strong>Tipo:</strong> {selectedSurvey.survey_type}
                </li>
                <div className="flex justify-stretch gap-2">
                  <li>
                    <strong>Localização:</strong>{" "}
                    {getShortAddress(selectedSurvey.location_title)}
                  </li>
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
                </div>
                <li>
                  <strong>Latitude:</strong> {selectedSurvey.lat}
                </li>
                <li>
                  <strong>Longitude:</strong> {selectedSurvey.long}
                </li>
              </ul>
            </>
          )}
        </div>
      </motion.div>

      {/* Colaboradores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border border-2 mt-4 h-fit w-full"
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
                  {contributorsData.map((contributor) => (
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
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border border-2 mt-4 h-fit w-full"
      >
        <h1 className="text-2xl font-bold">Respostas</h1>
        <p className="text-gray-400">Em breve...</p>
        {/* Aqui você pode adicionar a lógica para exibir as respostas da coleta */}
        </motion.div>
                <Button
                  onClick={() => router.push(`/researches/${router.query.id}/surveys/${surveyid}/answers`)}
                  disabled={isLoading}
                  className="w-full sm:w-fit self-start sm:self-auto px-4 py-2 transition flex items-center justify-center gap-2 text-sm mt-4"
                  variant="primary"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>Responder Pesquisa</span>
                </Button>
    </motion.section>

    
  );
}

ResearchSurvey.pageName = "Visualizar Coleta";
ResearchSurvey.layout = "private";
