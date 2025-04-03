import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ResearchForm from "@/components/research/ResearchForm";
import { useMessage } from "@/context/MessageContext";
import ResearchLoadingSkeleton from "@/components/research/ResearchLoadingSkeleton";
import SideBarSectionsFilter from "@/components/ui/SideBarSectionsFilter";
import CollectionFormSection from "@/components/collection/CollectionFormSection";
import StaticCollectionSection from "@/components/collection/StaticCollectionSection";
import DynamicCollectionSection from "@/components/collection/DynamicCollectionSection";

export default function EditResearch() {
  const router = useRouter();
  const { id } = router.query;
  const { showMessage } = useMessage();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityTypes, setActivityTypes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/activity_types");
        const data = await res.json();
        setActivityTypes(data.activity_types || []);
      } catch (error) {
        console.error("Erro ao buscar activity types:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/researches/${id}`);
        const data = await res.json();

        if (!data.research) {
          showMessage("Pesquisa não encontrada", "vermelho_claro", 5000);
          setLoading(false);
          return;
        }
        const formatted = {
          ...data.research,
            selectedCollaborators: (data.research.selectedCollaborators || []).map((c) => ({
            value: c.user_id,
            label: c.users.name,
            email: c.users.email,
            role: c.users.role,
            status: c.users.status,
          })),
        };
        setInitialData(formatted);
      } catch (err) {
        console.error("Erro ao buscar dados da pesquisa:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleUpdate = async (payload) => {

    console.log("payload", payload);
    return
    try {
      const res = await fetch("/api/researches/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id }),
      });

      if (!res.ok) {
        throw new Error(`Falha ao atualizar pesquisa. Status: ${res.status}`);
      }

      const updatedData = await res.json();
      console.log("Pesquisa atualizada com sucesso:", updatedData);
    } catch (err) {
      console.error("Erro ao atualizar a pesquisa:", err);
      showMessage("Erro ao atualizar a pesquisa", "vermelho_claro", 5000);
    }
  };

  if (loading) return <ResearchLoadingSkeleton />;
  if (!initialData) {
    return <div className="p-6 text-red-500">Não foi possível carregar a pesquisa.</div>;
  }

  const sections = [
    { id: "pesquisa", label: "Pesquisa", icon: "search" },
    { id: "formulario", label: "Formulário", icon: "description" },
    { id: "estatica", label: "Estática", icon: "insights" },
    { id: "dinamica", label: "Dinâmica", icon: "sync_alt" },
  ];

  const renderActivityType = (activity) => {
    switch (activity.type) {
      case "Formulário":
        return (
          <section id="formulario" key="formulario">
            <CollectionFormSection activity_type_id={activity.id} research_id={id} isEdit={true} onSubmit={() => {}} />
          </section>
        );
      case "Estática":
        return (
          <section id="estatica" key="estatica">
            <StaticCollectionSection isEdit={true} onSubmit={() => {}} />
          </section>
        );
      case "Dinâmica":
        return (
          <section id="dinamica" key="dinamica">
            <DynamicCollectionSection isEdit={true} onSubmit={() => {}} />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <main className="p-4 sm:p-6 space-y-20 mb-20">
        <section id="pesquisa">
          <h2 className="text-2xl font-bold mb-4">Pesquisa</h2>
          <ResearchForm
            isEdit
            initialData={initialData}
            onSubmit={handleUpdate}
          />
        </section>

        {activityTypes.map((activity) => renderActivityType(activity))}
      </main>

      <SideBarSectionsFilter sections={sections} position="right" />
    </div>
  );
}

EditResearch.layout = "private";
EditResearch.pageName = "Editar Pesquisa";
