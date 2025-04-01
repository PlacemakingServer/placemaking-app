import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import Button from "@/components/ui/Button";
import { formatDateToDDMMYY } from "@/utils/formatDate";
import { getCachedItemById, syncCachedData } from "@/services/cache";

export default function SpecificPage() {
  const { isLoading, setIsLoading } = useLoading(false);
  const { showMessage } = useMessage();
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState({
    title: "",
    description: "",
    release_date: "",
    created_by: "",
    created_at: "",
    updated_at: "",
    location_title: "",
  });

  useEffect(() => {
    const loadFromCache = async () => {
      if (!id) return;
      try {
        const cachedData = await getCachedItemById("researches", id);
        if (cachedData) {
          document.title = `${cachedData.title} - Detalhes`;
          setData({
            title: cachedData.title || "",
            description: cachedData.description || "",
            release_date: formatDateToDDMMYY(cachedData.release_date),
            created_by: cachedData.created_by || "",
            created_at: formatDateToDDMMYY(cachedData.created_at),
            updated_at: formatDateToDDMMYY(cachedData.updated_at),
            location_title: cachedData.location_title || "",
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados do cache:", err);
      }
    };
    loadFromCache();
  }, [id]);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncCachedData("researches");
      const updated = await getCachedItemById("researches", id);
      if (updated) {
        setData({
          title: updated.title,
          description: updated.description,
          release_date: formatDateToDDMMYY(updated.release_date),
          created_by: updated.created_by,
          created_at: formatDateToDDMMYY(updated.created_at),
          updated_at: formatDateToDDMMYY(updated.updated_at),
          location_title: updated.location_title,
        });
      }
      showMessage("Dados sincronizados com sucesso!", "azul_claro");
    } catch (err) {
      showMessage("Erro ao sincronizar dados do servidor", "vermelho_claro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div className="min-h-screen bg-transparent">
  <main className="p-2 md:p-6 space-y-8 max-w-3xl mx-auto">
    <section className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold mb-4">Detalhes</h2>
      <p className="text-xs text-gray-500 mb-4">
        Os dados podem estar desatualizados. Clique em “Atualizar” para
        sincronizar com o servidor.
      </p>
      <div className="flex items-center space-x-2 mb-4">
        <Button
          onClick={handleSync}
          disabled={isLoading}
          className="px-4 py-2 transition flex justify-evenly items-center gap-2"
          variant="dark"
        >
          <span className="material-symbols-outlined">sync</span>
          <span>Atualizar</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div><span className="font-bold">Título:</span> <p>{data.title}</p></div>
        <div><span className="font-bold">Descrição:</span> <p>{data.description}</p></div>
        <div><span className="font-bold">Data de Lançamento:</span> <p>{data.release_date}</p></div>
        <div><span className="font-bold">Criado por:</span> <p>{data.created_by}</p></div>
        <div><span className="font-bold">Criado em:</span> <p>{data.created_at}</p></div>
        <div><span className="font-bold">Atualizado em:</span> <p>{data.updated_at}</p></div>
        <div><span className="font-bold">Localização:</span> <p>{data.location_title}</p></div>
      </div>
    </section>
  </main>
</div>

  );
}

SpecificPage.layout = 'private';
SpecificPage.title = "Detalhes da Pesquisa";