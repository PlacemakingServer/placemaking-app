import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { getCachedData, syncLocalToServer, syncServerToCache } from "@/services/cache";

export default function Surveys() {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  const { isLoading, setIsLoading } = useLoading();
  const { showMessage } = useMessage();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("");
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

  useEffect(() => {
    let filtered = surveys.filter((survey) =>
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.location_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filterStatus) {
      filtered = filtered.filter((survey) => survey.status === filterStatus);
    }
    if (order === "asc") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }
    setTotalPages(Math.ceil(filtered.length / perPage));
    setFilteredSurveys(filtered.slice((page - 1) * perPage, page * perPage));
  }, [surveys, searchTerm, order, filterStatus, page, perPage]);

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

          <div className="flex justify-end mb-2">
            <Button variant="light" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? "Esconder filtros" : "Mostrar filtros"}
            </Button>
          </div>

          {showFilters && (
            <div className="mb-4 flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>

              {/* Filtros com botões */}
              <div className="flex gap-2">
                <button
                  onClick={() => setOrder("asc")}
                  className={clsx(
                    "px-4 py-1 rounded-full text-sm border",
                    order === "asc" ? "bg-blue-500 text-white" : "bg-white text-gray-700"
                  )}
                >
                  Mais recentes
                </button>
                <button
                  onClick={() => setOrder("desc")}
                  className={clsx(
                    "px-4 py-1 rounded-full text-sm border",
                    order === "desc" ? "bg-blue-500 text-white" : "bg-white text-gray-700"
                  )}
                >
                  Mais antigos
                </button>
              </div>

              <Button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("");
                  setOrder("desc");
                }}
                variant="transparent_cinza"
                className="text-sm"
              >
                Limpar Filtros
              </Button>
            </div>
          )}

          {filteredSurveys.length === 0 ? (
            <p className="text-gray-500">Nenhuma pesquisa encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredSurveys.map((survey) => (
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