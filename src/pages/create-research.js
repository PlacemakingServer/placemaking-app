import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/button";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { initAuthDB } from "@/lib/db";

export default function CreateResearch() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [researchType, setResearchType] = useState("");
  const [researchTime, setResearchTime] = useState("");
  const [gapByResearchTime, setGapByResearchTime] = useState("");
  const [researchTypes, setResearchTypes] = useState([]);
  const { isLoading, setIsLoading } = useLoading(false);
  const { showMessage } = useMessage();
  const router = useRouter();
  const [userData, setUserData] = useState(false);


  // Fetch available research types
  useEffect(() => {
    const fetchResearchTypes = async () => {
      try {
        const res = await fetch("/api/research/types");
        const data = await res.json();

        if (res.ok && data.research_types) {
          setResearchTypes(data.research_types); // Atualizar com a lista de tipos de pesquisa
        } else {
          showMessage("Erro ao buscar tipos de pesquisa", "vermelho_claro");
        }
      } catch (err) {
        showMessage("Erro de rede ao buscar tipos de pesquisa", "vermelho_claro");
      }
    };
    // const fetchUserData = async () => {
    //   const db = await initAuthDB();
    //     const user = await db.get("auth", "user");
    fetchResearchTypes();
  }, []);

  const handleCreateResearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!title || !description || !releaseDate || !researchType) {
      showMessage("Por favor, preencha todos os campos obrigatórios", "vermelho_claro");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/research/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          release_date: releaseDate,
          created_by: "",
          research_type: researchType,
          research_time: researchTime || undefined,
          gap_by_research_time: gapByResearchTime || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao criar pesquisa");
      }

      showMessage("Pesquisa criada com sucesso!", "verde");
      router.push("/researches"); // Redirecionar para a lista de pesquisas
    } catch (err) {
      showMessage(err.message, "vermelho_claro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Criar Pesquisa</h1>
      <form onSubmit={handleCreateResearch} className="space-y-4">
        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Título da pesquisa"
            required
          />
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Breve sinopse sobre a pesquisa"
            required
          />
        </div>

        {/* Data de lançamento */}
        <div>
          <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700">Data de Lançamento</label>
          <input
            type="date"
            id="releaseDate"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Tipo de pesquisa */}
        <div>
          <label htmlFor="researchType" className="block text-sm font-medium text-gray-700">Tipo de Pesquisa</label>
          <select
            id="researchType"
            value={researchType}
            onChange={(e) => setResearchType(e.target.value)}
            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {researchTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.type}</option>
            ))}
          </select>
        </div>

        {/* Tempo de pesquisa */}
        <div>
          <label htmlFor="researchTime" className="block text-sm font-medium text-gray-700">Duração da Pesquisa (em minutos)</label>
          <input
            type="number"
            id="researchTime"
            value={researchTime}
            onChange={(e) => setResearchTime(e.target.value)}
            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Duração em minutos (opcional)"
          />
        </div>

        {/* Intervalo entre pesquisas */}
        <div>
          <label htmlFor="gapByResearchTime" className="block text-sm font-medium text-gray-700">Intervalo entre pesquisas (em minutos)</label>
          <input
            type="number"
            id="gapByResearchTime"
            value={gapByResearchTime}
            onChange={(e) => setGapByResearchTime(e.target.value)}
            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Intervalo em minutos (opcional)"
          />
        </div>

        <Button type="submit" variant="azul_escuro" className="w-full text-lg py-3 active:scale-95" disabled={isLoading}>
          {isLoading ? "Criando pesquisa..." : "Criar pesquisa"}
        </Button>
      </form>
    </div>
  );
}

CreateResearch.pageName = "Criar Pesquisa";
CreateResearch.layout = "private";
