import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ClipboardCopy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { VARIANTS } from "@/config/colors";
import UserCardCompact from "@/components/ui/UserCardCompact";
import MapPreview from "@/components/map/MapPreviewNoSSR";
import Switch from "@/components/ui/Switch";

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
  const [showContributors, setShowContributors] = useState(false);
  const [showSurveys, setshowSurveys] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [copied, setCopied] = useState(false);

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
              <strong>Criada por:</strong> {author?.name}
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
                        instruction: user.instruction, // se o componente aceitar
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
                          <span className="material-symbols-outlined text-2xl">
                            visibility
                          </span>
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
