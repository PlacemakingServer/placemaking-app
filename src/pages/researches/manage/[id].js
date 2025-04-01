// pages/researches/[id]/edit.jsx
import { useState, useEffect } from "react";
import ResearchForm from "@/components/research/ResearchForm";
import { useRouter } from "next/router";

export default function EditResearch() {
  const router = useRouter();
  const { id } = router.query;

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (!id) return;
    // Buscar os dados de pesquisa do backend
    (async () => {
      try {
        const res = await fetch(`/api/researchs/${id}`);
        const data = await res.json();
        // Exemplo do shape do data: { title, description, lat, long, ...}
        setInitialData(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  const handleUpdate = (payload) => {
    alert(`Pesquisa atualizada!\n\n${JSON.stringify(payload, null, 2)}`);
  };

  if (!initialData) {
    return <div>Carregando...</div>;
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
