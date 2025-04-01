import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { getCachedData, syncLocalToServer, syncServerToCache } from "@/services/cache";

export default function Surveys() {
  const [surveys, setSurveys] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  const { isLoading, setIsLoading } = useLoading();
  const { showMessage } = useMessage();
  const router = useRouter();

  const loadCachedSurveys = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCachedData("researches", { paginated: false });
      const total = result.length;
      const totalPagesCalc = Math.ceil(total / perPage);
      const start = (page - 1) * perPage;
      const paginatedSurveys = result.slice(start, start + perPage);

      setSurveys(paginatedSurveys);
      setTotalPages(totalPagesCalc);
    } catch (err) {
      console.error("Erro ao carregar pesquisas do cache:", err);
      showMessage("Erro ao carregar pesquisas.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, setIsLoading, showMessage]);

  useEffect(() => {
    loadCachedSurveys();
  }, [loadCachedSurveys]);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncLocalToServer("researches");
      await syncServerToCache("researches");
      showMessage("Pesquisas sincronizadas com sucesso!", "azul_claro");
      loadCachedSurveys();
    } catch (err) {
      console.error("Erro ao sincronizar pesquisas:", err);
      showMessage("Erro ao sincronizar pesquisas.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-2 md:p-8 max-w-7xl mx-auto">
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Pesquisas Cadastradas</h2>
            <Button onClick={handleSync} disabled={isLoading} variant="dark">
              Atualizar
            </Button>
          </div>

          {surveys.length === 0 ? (
            <p className="text-gray-500">Nenhuma pesquisa encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {surveys.map((survey) => (
                <div key={survey.id} className="rounded-lg shadow p-4 flex flex-col">
                  <h3 className="text-lg font-semibold truncate">{survey.title}</h3>
                  <p className="text-gray-600 truncate">{survey.description}</p>
                  <div className="flex justify-between mt-4">
                    <Button variant="transparent_cinza" onClick={() => router.push(`/researches/manage/${survey.id}`)}>
                      Visualizar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <Button onClick={handlePrevious} disabled={page === 1} variant="dark">
              Anterior
            </Button>
            <span className="text-sm text-gray-700">Página {page} de {totalPages}</span>
            <Button onClick={handleNext} disabled={page === totalPages} variant="dark">
              Próxima
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

Surveys.pageName = "Gerenciar Pesquisas";
Surveys.layout = "private";