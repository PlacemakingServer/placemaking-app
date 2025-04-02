import { useState, useEffect } from "react";
import ResearchForm from "@/components/research/ResearchForm";
import { useRouter } from "next/router";

export default function EditResearch() {
  const router = useRouter();
  const { id } = router.query;

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/researches/${id}`);
        const data = await res.json();

        if (!data.research) {
          console.error("Pesquisa não encontrada");
          return;
        }

        const formatted = {
          ...data.research,
          collaborators: (data.contributors || []).map((c) => ({
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
      }
    })();
  }, [id]);

  const handleUpdate = (payload) => {
    alert(`Pesquisa atualizada!\n\n${JSON.stringify(payload, null, 2)}`);
  };

  if (!initialData) {
    return <div className="p-6 text-gray-700">Carregando pesquisa...</div>;
  }

  return (
    <ResearchForm
      isEdit
      initialData={initialData}
      onSubmit={handleUpdate}
    />
  );
}

EditResearch.layout = "private";
EditResearch.pageName = "Editar Pesquisa";
