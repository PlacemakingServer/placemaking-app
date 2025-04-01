import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { getCachedData, syncLocalToServer, syncServerToCache } from "@/services/cache";

export default function Surveys() {
  const [surveys, setSurveys] = useState([]);
  const [filters, setFilters] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState({ completed: 1, ongoing: 1, future: 1 });
  const perPage = 4; // Number of items per page
  const { isLoading, setIsLoading } = useLoading();
  const { showMessage } = useMessage();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  const loadCachedSurveys = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCachedData("researches", { paginated: false });
      setSurveys(result);
    } catch (err) {
      console.error("Erro ao carregar pesquisas do cache:", err);
      showMessage("Erro ao carregar pesquisas.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showMessage]);

  useEffect(() => {
    loadCachedSurveys();
  }, [loadCachedSurveys]);

  const currentDate = new Date();
  const categorizedSurveys = {
    completed: [],
    ongoing: [],
    future: []
  };

  surveys.forEach((survey) => {
    const endDate = new Date(survey.end_date);
    const startDate = new Date(survey.release_date);
    if (endDate < currentDate) {
      categorizedSurveys.completed.push(survey);
    } else if (startDate > currentDate) {
      categorizedSurveys.future.push(survey);
    } else {
      categorizedSurveys.ongoing.push(survey);
    }
  });

  const filterAndSortSurveys = (list) => {
    return list
      .filter((survey) =>
        survey.title.toLowerCase().includes(filters.toLowerCase()) ||
        survey.description.toLowerCase().includes(filters.toLowerCase()) ||
        survey.location_title.toLowerCase().includes(filters.toLowerCase())
      )
      .sort((a, b) => {
        return sortOrder === "asc"
          ? a.created_at.localeCompare(b.created_at)
          : b.created_at.localeCompare(a.created_at);
      });
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-2 md:p-8 max-w-7xl mx-auto">
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Pesquisas</h2>
            <Button onClick={handleSync} disabled={isLoading} variant="dark">
              Atualizar
            </Button>
          </div>

          <div className="flex justify-end mb-2 gap-2">
            <Button variant="light" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? "Esconder filtros" : "Mostrar filtros"}
            </Button>
            <Button variant="light" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              Ordenar: {sortOrder === "asc" ? "Mais Recentes" : "Mais Antigos"}
            </Button>
          </div>

          {showFilters && (
            <div className="mb-4 flex flex-wrap gap-4 items-center">
              <input
                type="text"
                placeholder="Buscar..."
                value={filters}
                onChange={(e) => setFilters(e.target.value)}
                className="border p-2 rounded"
              />
            </div>
          )}

        {Object.entries(categorizedSurveys).map(([key, list]) => {
          const filteredAndSorted = filterAndSortSurveys(list);
          const totalPages = Math.ceil(filteredAndSorted.length / perPage);

          const handlePrevious = () => {
            setPage(prev => ({ ...prev, [key]: Math.max(prev[key] - 1, 1  ) }));
          };

          const handleNext = () => {
            setPage(prev => ({
              ...prev,
              [key]: Math.min(prev[key] + 1, totalPages),
            }));
          };

          return (
            <div key={key} className="mb-6">
              <h3 className="text-xl font-semibold capitalize">
                {key === "completed" ? "Pesquisas Já Realizadas" : key === "ongoing" ? "Pesquisas em Andamento" : "Pesquisas Futuras"}
              </h3>
              {filteredAndSorted.length === 0 ? (
                <p className="text-gray-500">Nenhuma pesquisa encontrada.</p>
              ) : (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAndSorted.slice((page[key] - 1) * perPage, page[key] * perPage).map((survey) => (
                      <div key={survey.id} className="rounded-lg shadow p-4 flex flex-col bg-white border">
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

                  {/* Paginação */}
                  <div className="flex items-center justify-between mt-6">
                    <Button
                      onClick={handlePrevious}
                      disabled={page[key] === 1}
                      className="disabled:opacity-80"
                      variant="dark"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-700">
                      Página {page[key]} de {totalPages}
                    </span>
                    <Button
                      onClick={handleNext}
                      disabled={page[key] === totalPages}
                      className="disabled:opacity-80"
                      variant="dark"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </section>
      </main>
    </div>
  );
}

Surveys.pageName = "Gerenciar Pesquisas";
Surveys.layout = "private";
