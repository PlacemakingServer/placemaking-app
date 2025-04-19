import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ResearchForm from "@/components/research/ResearchForm";
import { useMessage } from "@/context/MessageContext";
import ResearchLoadingSkeleton from "@/components/research/ResearchLoadingSkeleton";
import SideBarSectionsFilter from "@/components/ui/SideBarSectionsFilter";
import CollectionFormSection from "@/components/surveys/CollectionFormSection";
import AddSurveyPrompt from "@/components/surveys/AddSurveyPrompt";

export default function EditResearch() {
  const router = useRouter();
  const { id } = router.query;
  const { showMessage } = useMessage();
  const [researchData, setResearchData] = useState(null);
  const [contributors, setContributors] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renderedSurveys, setRenderedSurveys] = useState([]);
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false);

  const SURVEY_TYPES = [
    { id: "formulario", label: "Formulário", icon: "description" },
    { id: "estatica", label: "Estática", icon: "insights" },
    { id: "dinamica", label: "Dinâmica", icon: "sync_alt" },
  ];

  useEffect(() => {
    if (!id) return;
    loadResearchData();
    loadContributors();
    loadAllSurveyTypes();
  }, [id]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      const formatted = data.users?.map((u) => ({
        value: u.id,
        label: u.name,
        role: u.role,
        status: u.status,
        email: u.email,
      }));
      setUsers(formatted || []);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    }
  };

  const loadResearchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/researches/${id}`);
      const data = await res.json();
      if (!data.research) {
        showMessage("Pesquisa não encontrada", "vermelho_claro", 5000);
        return;
      }
      setResearchData(data.research);
    } catch (err) {
      console.error("Erro ao buscar dados da pesquisa:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadContributors = async () => {
    try {
      const res = await fetch(`/api/contributors?research_id=${id}`);
      const data = await res.json();
      if (!data) {
        showMessage("Colaboradores não encontrados", "vermelho_claro", 5000);
        return;
      }
      setContributors(data);
    } catch (err) {
      console.error("Erro ao buscar colaboradores:", err);
    }
  };

  const loadAllSurveyTypes = () => {
    SURVEY_TYPES.forEach(({ label }) => loadSurveyByType(label));
  };

  const loadSurveyByType = async (surveyType) => {
    try {
      const params = new URLSearchParams({
        research_id: id,
        survey_type: surveyType,
      });
      const res = await fetch(`/api/surveys?${params.toString()}`);
      const data = await res.json();

      if (!data.surveys || data.surveys.length === 0) return;

      renderSurveyComponent(surveyType, data);
    } catch (err) {
      console.error("Erro ao buscar survey do tipo", surveyType, err);
    }
  };

  const renderSurveyComponent = (surveyLabel, data) => {

    const surveyType = SURVEY_TYPES.find((t) => t.label === surveyLabel);
    const surveyData = data?.surveys[0] || null;
    if (!surveyType || renderedSurveys.find((s) => s.id === surveyType.id)) return;
    setRenderedSurveys((prev) => {
      return [
        ...prev,
        {
          ...surveyType,
          component: (
            <CollectionFormSection
              key={`survey-${surveyType.id}`}
              survey_type={surveyType.label}
              research_id={id}
              initialData={surveyData}
              handleCancelCreateSurvey={handleCancelCreateSurvey}
              handleCreateSurvey={handleCreateSurvey}
            />
          ),
        },
      ]
    });
  };

  const handleStartCreateSurvey = (selectedTypeId) => {
    const typeObj = SURVEY_TYPES.find((t) => t.id === selectedTypeId);
    if (!typeObj) return;

    renderSurveyComponent(typeObj.label, null);

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
    try {
      const release_date = payload.release_date
        ? `${payload.release_date}T00:00:00`
        : null;
      const end_date = payload.end_date ? `${payload.end_date}T00:00:00` : null;

      const finalPayload = { ...payload, id, release_date, end_date };

      const res = await fetch("/api/researches/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      if (!res.ok) {
        throw new Error(`Falha ao atualizar pesquisa. Status: ${res.status}`);
      }

      const updated = await res.json();
      showMessage("Pesquisa atualizada com sucesso", "verde", 5000);
      router.reload();
    } catch (err) {
      console.error("Erro ao atualizar a pesquisa:", err);
      showMessage("Erro ao atualizar a pesquisa", "vermelho_claro", 5000);
    }
  };

  const handleCreateSurvey = async (payload) => {
    try {
      const res = await fetch("/api/surveys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Falha ao criar uma coleta. Status: ${res.status}`);
      }
      if (!data) {
        showMessage("Erro ao criar uma coleta", "vermelho_claro", 5000);
        return null;
      }
      showMessage("Coleta criada com sucesso", "verde", 5000);
      setIsCreatingSurvey(true);
      return data?.survey;
    } catch (err) {
      showMessage("Erro ao criar uma coleta", "vermelho_claro", 5000);
      return null;
    }
  };

  const handleSurveyUpdate = async (payload) => {
    try {
      const res = await fetch("/api/surveys/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Falha ao atualizar a coleta. Status: ${res.status}`);
      }
      const data = await res.json();
      showMessage("Coleta atualizada com sucesso", "verde", 5000);
      router.reload();
    } catch (err) {
      console.error("Erro ao atualizar a coleta:", err);
      showMessage("Erro ao atualizar a coleta", "vermelho_claro", 5000);
    }
  };

  const handleSurveyDelete = async (surveyId) => {
    try {
      const res = await fetch(`/api/surveys/delete?survey_id=${surveyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Falha ao deletar a coleta. Status: ${res.status}`);
      }
      const data = await res.json();
      showMessage("Coleta deletada com sucesso", "verde", 5000);
      router.reload();
    } catch (err) {
      console.error("Erro ao deletar a coleta:", err);
      showMessage("Erro ao deletar a coleta", "vermelho_claro", 5000);
    }
  };

  if (loading) return <ResearchLoadingSkeleton />;
  if (!researchData) {
    return (
      <div className="p-6 text-red-500">
        Não foi possível carregar a pesquisa.
      </div>
    );
  }

  const sidebarSections = [
    { id: "pesquisa", label: "Pesquisa", icon: "search" },
    ...SURVEY_TYPES,
  ];

  return (
    <div className="relative">
      <main className="p-4 sm:p-6 space-y-20 mb-20">
        <section id="pesquisa">
          <h2 className="text-xl font-bold mb-4">Pesquisa</h2>
          <ResearchForm
            isEdit
            initialData={researchData}
            contributorsData={contributors}
            users={users}
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