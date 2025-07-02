"use client"

import { useState, useEffect } from "react"
import { ClipboardCopy, Check, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/router"
import UserCardCompact from "@/components/ui/UserCardCompact"
import MapPreview from "@/components/map/MapPreviewNoSSR"
import Switch from "@/components/ui/Switch"
import Button from "@/components/ui/Button"
import { ChevronLeft } from "lucide-react"
import { useLoading } from "@/context/LoadingContext"
import { useAuthentication } from "@/hooks"
import { toast } from "react-hot-toast"
import { syncResearchData } from "@/services/sync_data_service"

import { useDynamicSurveys } from "@/hooks/useDynamicSurveys"
import { useFormSurveys } from "@/hooks/useFormSurveys"
import { useStaticSurveys } from "@/hooks/useStaticSurveys"
import { useResearchContributors } from "@/hooks/useResearchContributors"
import { useResearches } from "@/hooks/useResearches"
import { useUsers } from "@/hooks/useUsers"

export default function ResearchView() {
  const router = useRouter()
  const { id } = router.query

  const { dynamicSurvey, dynamicSurveyError } = useDynamicSurveys(id)
  const { formSurvey, formSurveyError } = useFormSurveys(id)
  const { staticSurvey, unSyncedstaticSurveys } = useStaticSurveys(id)
  const { contributors: contributorsData } = useResearchContributors(id)
  const { researchData: selectedResearch } = useResearches(true, id)
  const { users: allUsers } = useUsers() || null
  const { user: currentUser } = useAuthentication()

  const [showContributors, setShowContributors] = useState(false)
  const [showSurveys, setshowSurveys] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [copied, setCopied] = useState(false)
  const [surveyContributors, setSurveyContributors] = useState({})
  const { setIsLoading } = useLoading()

  const [imageUrl, setImageUrl] = useState("")

  const { userData: author } = useUsers(true, selectedResearch?.created_by) || null

  const surveys = [dynamicSurvey, formSurvey, staticSurvey].filter((survey) => survey !== null)

  const userMap = allUsers ? Object.fromEntries(allUsers.map((user) => [user.id, user])) : {}

  const contributorsList =
    contributorsData?.map((contributor) => ({
      ...contributor,
      user: userMap[contributor.user_id] || null,
    })) || []

  // Check if current user is admin
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "administrator"

  // Fetch contributors for each survey to check access
  useEffect(() => {
    const fetchSurveyContributors = async () => {
      if (!surveys.length || !currentUser) return

      const contributorsMap = {}

      for (const survey of surveys) {
        try {
          const response = await fetch(`/api/survey-contributors?survey_id=${survey.id}`)
          if (response.ok) {
            const data = await response.json()
            contributorsMap[survey.id] = data.contributors || []
          }
        } catch (error) {
          console.error(`Error fetching contributors for survey ${survey.id}:`, error)
          contributorsMap[survey.id] = []
        }
      }

      setSurveyContributors(contributorsMap)
    }

    fetchSurveyContributors()
  }, [currentUser])

  // Check if user has access to a specific survey
  const hasAccessToSurvey = () => {
    // admins sempre True
    if (isAdmin) return true

    // se ainda não veio o array, bate False
    if (!Array.isArray(contributorsList)) return false

    // se algum contributor.user_id bate com currentUser.id → True
    return contributorsList.some((c) => c.user_id === currentUser?.id)
  }

  const handleSurveyAccess = (survey) => {
    if (!hasAccessToSurvey(survey.id)) {
      toast.error("Você não tem permissão para acessar esta coleta.")
      return
    }

    router.push(`/researches/${selectedResearch.id}/surveys/${survey.id}`)
  }

  const handleCopyCoords = () => {
    const name = selectedResearch?.location_title
    const lat = selectedResearch?.lat
    const lng = selectedResearch?.long
    if (lat && lng) {
      navigator.clipboard.writeText(`${getShortAddress(name)}: ${lat}, ${lng}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getShortAddress = (fullAddress) => {
    if (!fullAddress) return ""
    const parts = fullAddress.split(",")
    return parts.slice(0, 3).join(",").trim()
  }

  useEffect(() => {
    const idx = Math.floor(Math.random() * 5)
    setImageUrl(`/img/cards/img-${idx}.jpg`)
  }, [])

  useEffect(() => {
    console.log("contributors:", contributorsList)
  }, [contributorsList])

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
          <h1 className="text-xl font-semibold text-gray-900">Detalhes da Pesquisa</h1>
          <p className="text-sm text-gray-500">Visualizar informações e respostas</p>
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
            <h2 className="text-white text-3xl font-semibold truncate drop-shadow-md">{selectedResearch?.title}</h2>
          </div>
        </motion.div>

        <div className="px-6 pb-6 md:px-8 flex flex-col gap-4">
          <motion.p>
            <strong>Descrição:</strong> {selectedResearch?.description}
          </motion.p>
          <motion.p>
            <strong>Início:</strong> {new Date(selectedResearch?.release_date).toLocaleDateString("pt-BR")}
          </motion.p>
          <motion.p>
            <strong>Fim:</strong> {new Date(selectedResearch?.end_date).toLocaleDateString("pt-BR")}
          </motion.p>
          <motion.p>
            <strong>Criada por:</strong> {author?.name}
          </motion.p>
        </div>

        <div className="px-6 pb-8 md:px-8">
          <button
            onClick={async () => {
              if (!selectedResearch?.lat || !selectedResearch?.long) {
                toast.error("Lat/Lon da pesquisa ainda não carregados.")
                return
              }

              setIsLoading(true)
              try {
                await syncResearchData(selectedResearch)
                toast.success("Dados e mapa baixados para uso offline!")
              } catch (err) {
                console.error("[sync]", err)
                toast.error("Não foi possível sincronizar os dados.")
              } finally {
                setIsLoading(false)
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
        <SectionToggle title="Mapa" isChecked={showMap} onChange={() => setShowMap((prev) => !prev)} />

        <AnimatePresence>
          {showMap && selectedResearch?.lat && selectedResearch?.long && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-sm text-gray-700 border rounded-md p-4 bg-gray-50 space-y-4 "
            >
              <MapPreview lat={selectedResearch.lat} lng={selectedResearch.long} height="200px" width="100" />
              <div className="flex flex-row justify-between items-center gap-4">
                <motion.p>
                  <strong>Localização:</strong> {getShortAddress(selectedResearch?.location_title)}
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
                    {copied ? <Check size={16} className="text-green-600" /> : <ClipboardCopy size={20} />}
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

      {/* Seção de Coletas com Controle de Acesso - MELHORADA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border border-2 mt-4 h-fit"
      >
        <SectionToggle title="Coletas" isChecked={showSurveys} onChange={() => setshowSurveys((prev) => !prev)} />

        <AnimatePresence>
          {showSurveys && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 w-full flex flex-col gap-6"
            >
              {(() => {
                const filteredSurveys = surveys.filter((s) => s.research_id === selectedResearch?.id)

                if (filteredSurveys.length === 0) {
                  return (
                    <div className="text-center py-12 px-4">
                      <div className="text-gray-300 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma coleta encontrada</h3>
                      <p className="text-gray-400 text-sm">Ainda não há surveys vinculadas a esta pesquisa</p>
                    </div>
                  )
                }

                const grouped = filteredSurveys.reduce((acc, survey) => {
                  const type = survey.survey_type || "outros"
                  acc[type] = acc[type] || []
                  acc[type].push(survey)
                  return acc
                }, {})

                return Object.entries(grouped).map(([type, group], groupIndex) => (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="w-full"
                  >
                    {/* Header da Categoria Melhorado */}
                    <div className="mb-5 pb-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                          <h3 className="text-xl font-semibold text-gray-800 capitalize">{type}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                            {group.length} {group.length === 1 ? "item" : "itens"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Surveys Melhorada */}
                    <div className="space-y-3">
                      {group.map((survey, idx) => {
                        const hasAccess = hasAccessToSurvey()

                        return (
                          <motion.div
                            key={survey.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: groupIndex * 0.1 + idx * 0.05 }}
                            className={`group relative overflow-hidden rounded-lg border transition-all duration-200 ${
                              hasAccess
                                ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:bg-gray-50/30"
                                : "border-gray-100 bg-gray-50/50"
                            }`}
                          >
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                {/* Conteúdo Principal */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-medium text-gray-900 truncate text-base leading-tight">
                                      {survey.title || `Survey ${survey.id}`}
                                    </h4>
                                    {!hasAccess && (
                                      <div className="flex items-center gap-1.5 text-gray-400">
                                        <Lock className="w-4 h-4" />
                                        <span className="text-xs font-medium">Restrito</span>
                                      </div>
                                    )}
                                  </div>

                                  <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                                    {survey.description || "Sem descrição disponível"}
                                  </p>

                                  {!hasAccess && !isAdmin && (
                                    <div className="inline-flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                      Você não é contribuidor desta coleta
                                    </div>
                                  )}
                                </div>

                                {/* Ações */}
                                <div className="flex items-center gap-4 flex-shrink-0">
                                  {/* Status Badge Melhorado */}
                                  <div
                                    className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full border ${
                                      survey._syncStatus === "synced"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : survey._syncStatus === "error"
                                          ? "bg-red-50 text-red-700 border-red-200"
                                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    }`}
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        survey._syncStatus === "synced"
                                          ? "bg-green-500"
                                          : survey._syncStatus === "error"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                      }`}
                                    ></div>
                                    {survey._syncStatus === "synced"
                                      ? "Sincronizado"
                                      : survey._syncStatus === "error"
                                        ? "Erro"
                                        : "Pendente"}
                                  </div>

                                  {/* Botão de Visualizar Melhorado */}
                                  <button
                                    onClick={() => handleSurveyAccess(survey)}
                                    disabled={!hasAccess}
                                    className={`p-3 rounded-lg border transition-all duration-200 ${
                                      hasAccess
                                        ? "text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 hover:scale-105 active:scale-95"
                                        : "text-gray-300 border-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    title={hasAccess ? "Visualizar coleta" : "Acesso negado"}
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      {hasAccess ? "visibility" : "visibility_off"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Efeito de hover sutil */}
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-50/0 to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                ))
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  )
}

function SectionToggle({ title, isChecked, onChange }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      <Switch type="arrow" checked={isChecked} onChange={onChange} />
    </div>
  )
}

ResearchView.pageName = "Visualizar Pesquisa"
ResearchView.layout = "private"
