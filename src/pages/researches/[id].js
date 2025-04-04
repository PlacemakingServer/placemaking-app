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

  // Busca activity_types (opcional, depende do seu fluxo)
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

  // Busca os dados da pesquisa para edição
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/researches/${id}`);
        const data = await res.json();

        if (!data.research) {
          showMessage("Pesquisa não encontrada", "vermelho_claro", 5000);
          setLoading(false);
          return;
        }

        // Mapeando colaboradores para o formato { value, label, ... }
        const mapped = {
          ...data.research,
          selectedCollaborators: (
            data.research.selectedCollaborators || []
          ).map((c) => ({
            value: c.user_id || c.id, // Depende de como o backend retorna
            label: c.users?.name || c.name,
            email: c.users?.email || c.email,
            role: c.users?.role || c.role,
            status: c.users?.status || c.status,
          })),
        };

        setInitialData(mapped);
      } catch (err) {
        console.error("Erro ao buscar dados da pesquisa:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Chama PUT /api/researches/update
  const handleUpdate = async (payload) => {
    try {
      // Exemplo de padronização de datas no front antes de enviar
      const release_date = payload.release_date
        ? `${payload.release_date}T00:00:00`
        : null;
      const end_date = payload.end_date ? `${payload.end_date}T00:00:00` : null;

      const finalPayload = {
        ...payload,
        id,
        release_date,
        end_date,
      };

      const res = await fetch("/api/researches/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      if (!res.ok) {
        throw new Error(`Falha ao atualizar pesquisa. Status: ${res.status}`);
      }

      // Resposta do backend
      const updatedData = await res.json();
      console.log("Pesquisa atualizada com sucesso:", updatedData);

      // Mapeia novamente os colaboradores, pois o backend pode retornar
      // { id, name } e você precisa { value, label } para o form
      const mappedData = {
        ...updatedData,
        selectedCollaborators: (updatedData.selectedCollaborators || []).map(
          (c) => ({
            value: c.id,
            label: c.name,
            email: c.email,
            role: c.role,
            status: c.status,
          })
        ),
      };

      setInitialData(mappedData);
      showMessage("Pesquisa atualizada com sucesso", "verde", 5000);
      router.reload();
    } catch (err) {
      console.error("Erro ao atualizar a pesquisa:", err);
      showMessage("Erro ao atualizar a pesquisa", "vermelho_claro", 5000);
    }
  };

  if (loading) return <ResearchLoadingSkeleton />;
  if (!initialData) {
    return (
      <div className="p-6 text-red-500">
        Não foi possível carregar a pesquisa.
      </div>
    );
  }

  const sections = [
    { id: "pesquisa", label: "Pesquisa", icon: "search" },
    { id: "formulario", label: "Formulário", icon: "description" },
    { id: "estatica", label: "Estática", icon: "insights" },
    { id: "dinamica", label: "Dinâmica", icon: "sync_alt" },
  ];

  // Exemplo de como renderizar seções (depende do seu fluxo)
  const renderActivityType = (activity) => {
    switch (activity.type) {
      case "Formulário":
        return (
          <section id="formulario" key="formulario">
            <CollectionFormSection
              activity_type_id={activity.id}
              research_id={id}
              initialData={initialData.activities.find(
                (a) => a.id === activity.id
              )}
            />
          </section>
        );
      case "Estática":
        return (
          <section id="estatica" key="estatica">
            <StaticCollectionSection
              activity_type_id={activity.id}
              research_id={id}
              initialData={initialData.activities.find(
                (a) => a.id === activity.id
              )}
            />
          </section>
        );
      case "Dinâmica":
        return (
          <section id="dinamica" key="dinamica">
            <DynamicCollectionSection
              activity_type_id={activity.id}
              research_id={id}
              initialData={initialData.activities.find(
                (a) => a.id === activity.id
              )}
            />
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

          {/* Passa a pesquisa como initialData + handleUpdate */}
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
