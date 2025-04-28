import { useState } from "react";
import { useRouter } from "next/router";
import { useResearches } from "@/hooks/useResearches";
import { useUsers } from "@/hooks/useUsers";
import ResearchForm from "@/components/research/ResearchForm";
import { useMessage } from "@/context/MessageContext";
import ResearchLoadingSkeleton from "@/components/research/ResearchLoadingSkeleton";
import SideBarSectionsFilter from "@/components/ui/SideBarSectionsFilter";
import AddSurveyPrompt from "@/components/surveys/AddSurveyPrompt";
import CollectionFormSection from "@/components/surveys/CollectionFormSection";
import CollectionStaticSection from "@/components/surveys/CollectionStaticSection";
import CollectionDynamicSection from "@/components/surveys/CollectionDynamicSection";
import { formatDataByModel } from "@/lib/types/models";

const SURVEY_TYPES = [
  { id: "formulario", label: "Formulário", icon: "description" },
  { id: "estatica", label: "Estática", icon: "insights" },
  { id: "dinamica", label: "Dinâmica", icon: "sync_alt" },
];

export default function EditResearch() {
  const router = useRouter();
  const { id } = router.query;
  const { showMessage } = useMessage();
  const { researchData, loading: loadingResearch, updateResearch } = useResearches(true, id);
  const { users, loading: loadingUsers } = useUsers();

  const [renderedSurveys, setRenderedSurveys] = useState([]);
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false);

  const sidebarSections = [{ id: "pesquisa", label: "Pesquisa", icon: "search" }, ...SURVEY_TYPES];

  const renderSurveyComponent = (surveyLabel) => {
    const surveyType = SURVEY_TYPES.find((t) => t.label === surveyLabel);
    if (!surveyType || renderedSurveys.some((s) => s.id === surveyType.id)) return;

    let SurveyComponent = null;

    switch (surveyLabel.toLowerCase()) {
      case "formulário":
        SurveyComponent = CollectionFormSection;
        break;
      case "estática":
        SurveyComponent = CollectionStaticSection;
        break;
      case "dinâmica":
        SurveyComponent = CollectionDynamicSection;
        break;
      default:
        console.warn(`Tipo de coleta desconhecido: ${surveyLabel}`);
        return;
    }

    setRenderedSurveys((prev) => [
      ...prev,
      {
        ...surveyType,
        component: (
          <SurveyComponent
            key={`survey-${surveyType.id}`}
            research_id={id}
            handleCancelCreateSurvey={handleCancelCreateSurvey}
          />
        ),
      },
    ]);
  };

  const handleStartCreateSurvey = (selectedTypeId) => {
    const typeObj = SURVEY_TYPES.find((t) => t.id === selectedTypeId);
    if (!typeObj) return;

    renderSurveyComponent(typeObj.label);

    setTimeout(() => {
      const element = document.getElementById(`survey-${selectedTypeId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);

    setIsCreatingSurvey(true);
  };

  const handleCancelCreateSurvey = () => {
    setRenderedSurveys((prev) => prev.filter((s) => s.id !== "formulario"));
    setIsCreatingSurvey(false);
  };

  const handleResearchUpdate = async (payload) => {
    if (!id) return;

    try {
      const formattedPayload = formatDataByModel({ ...payload, id }, "researches");
      await updateResearch(id, formattedPayload);
      showMessage("Pesquisa atualizada com sucesso", "verde", 5000);
      router.reload();
    } catch (err) {
      console.error("Erro ao atualizar a pesquisa:", err);
      showMessage("Erro ao atualizar a pesquisa", "vermelho_claro", 5000);
    }
  };

  if (!id || loadingResearch || loadingUsers) return <ResearchLoadingSkeleton />;

  if (!researchData) {
    return <div className="p-6 text-red-500">Não foi possível carregar a pesquisa.</div>;
  }

  return (
    <div className="relative">
      <main className="p-4 sm:p-6 space-y-20 mb-20">
        <section id="pesquisa">
          <h2 className="text-xl font-bold mb-4">Pesquisa</h2>
          <ResearchForm
            isEdit
            initialData={researchData}
            users={users.map((u) => ({
              value: u.id,
              label: u.name,
              role: u.role,
              status: u.status,
              email: u.email,
            }))}
            onSubmit={handleResearchUpdate}
          />
        </section>

        {!isCreatingSurvey && (
          <section id="create-survey">
            <h2 className="text-xl font-bold mb-4">Criar coleta</h2>
            <AddSurveyPrompt onContinue={handleStartCreateSurvey} />
          </section>
        )}

        {renderedSurveys.map((survey) => (
          <section id={`survey-${survey.id}`} key={`survey-${survey.id}`}>
            <h2 className="text-xl font-bold mb-4">{survey.label}</h2>
            {survey.component}
          </section>
        ))}
      </main>

      <SideBarSectionsFilter sections={sidebarSections} position="right" />
    </div>
  );
}

EditResearch.layout = "private";
EditResearch.pageName = "Editar Pesquisa";