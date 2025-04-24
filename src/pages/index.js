import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";
import FiltersComponent from "@/components/ui/FiltersComponent";
import { useMessage } from "@/context/MessageContext";
import { useRouter } from "next/router";
import ResearchCardDashboard from "@/components/ui/Research/ResearchCardDashboard"
import Button from "@/components/ui/Button_og";
import {
  getCachedData,
  syncLocalToServer,
  syncServerToCache,
} from "@/services/cache";
import { VARIANTS } from "@/config/colors";

export default function Home() {
  
 const [researches, setResearches] = useState([]);
  const [filters, setFilters] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showCategory, setShowCategory] = useState({
    completed: true,
    ongoing: true,
    future: true,
  });
  const [page, setPage] = useState({ completed: 1, ongoing: 1, future: 1 });
  const perPage = 3;
  const { isLoading, setIsLoading } = useLoading();
  const { showMessage } = useMessage();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  const loadCachedResearches = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCachedData("researches", { paginated: false });
      setResearches(result);
    } catch (err) {
      console.error("Erro ao carregar pesquisas do cache:", err);
      showMessage("Erro ao carregar pesquisas.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showMessage]);

  useEffect(() => {
    loadCachedResearches();
  }, [loadCachedResearches]);

  const currentDate = new Date();
  const categorizedResearches = {
    completed: [],
    ongoing: [],
    future: [],
  };

  researches.forEach((research) => {
    const endDate = new Date(research.end_date);
    const startDate = new Date(research.release_date);
    if (endDate < currentDate) {
      categorizedResearches.completed.push(research);
    } else if (startDate > currentDate) {
      categorizedResearches.future.push(research);
    } else {
      categorizedResearches.ongoing.push(research);
    }
  });

  const filterAndSortResearches = (list) => {
    return list
      .filter(
        (research) =>
          research.title.toLowerCase().includes(filters.toLowerCase()) ||
          research.description.toLowerCase().includes(filters.toLowerCase()) ||
          research.location_title.toLowerCase().includes(filters.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
      
        return sortOrder === "asc"
          ? dateA - dateB
          : dateB - dateA;
      });
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncLocalToServer("researches");
      await syncServerToCache("researches");
      showMessage("Pesquisas sincronizadas com sucesso!", "azul_claro");
      loadCachedResearches();
    } catch (err) {
      console.error("Erro ao sincronizar pesquisas:", err);
      showMessage("Erro ao sincronizar pesquisas.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-transparent rounded-2xl p-6 md:p-8 gap-6"
        >

      <div className="min-h-screen bg-transparent">
            <main className="p-4 md:p-8 max-w-8xl mx-auto">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-transparent rounded-2xl p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">
                  Situação das Pesquisas
                  </h2>
                  <Button
                    onClick={handleSync}
                    disabled={isLoading}
                    className="w-full sm:w-fit self-start sm:self-auto px-4 py-2 transition flex items-center justify-center gap-2 text-sm"
                    variant="secondary"
                  >
                    <span className="material-symbols-outlined text-base">sync</span>
                    <span>Atualizar</span>
                  </Button>
                </div>
      
                <FiltersComponent
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  variants={VARIANTS}
                  filters={[
                    {
                      key: "filters",
                      label: "Buscar por título, descrição ou local",
                      icon: "search",
                      type: "text",
                      value: filters,
                      defaultValue: "",
                    },
                    {
                      key: "sortOrder",
                      label: "Ordenação",
                      icon: "sort",
                      type: "button-group",
                      value: sortOrder,
                      defaultValue: "asc",
                      options: [
                        { label: "Mais Recentes", value: "asc" },
                        { label: "Mais Antigos", value: "desc" },
                      ],
                    },
                    {
                      key: "showCategory",
                      label: "Mostrar categorias",
                      type: "switch-group",
                      options: [
                        {
                          label: "Pesquisas Já Realizadas",
                          value: "completed",
                          checked: showCategory.completed,
                        },
                        {
                          label: "Pesquisas em Andamento",
                          value: "ongoing",
                          checked: showCategory.ongoing,
                        },
                        {
                          label: "Pesquisas Futuras",
                          value: "future",
                          checked: showCategory.future,
                        },
                      ],
                    },
                  ]}
                  onChange={(key, value) => {
                    if (key === "filters") setFilters(value);
                    if (key === "sortOrder") setSortOrder(value);
                    if (key === "showCategory") {
                      setShowCategory((prev) => ({ ...prev, ...value }));
                    }
                  }}
                  onClear={() => {
                    setFilters("");
                    setSortOrder("asc");
                    setShowCategory({ completed: true, ongoing: true, future: true });
                  }}
                />
      
                {Object.entries(categorizedResearches).map(([key, list]) => {
                  if (!showCategory[key]) return null;
                  const filteredAndSorted = filterAndSortResearches(list);
                  const totalPages = Math.ceil(filteredAndSorted.length / perPage);
      
                  const handlePrevious = () => {
                    setPage((prev) => ({
                      ...prev,
                      [key]: Math.max(prev[key] - 1, 1),
                    }));
                  };
      
                  const handleNext = () => {
                    setPage((prev) => ({
                      ...prev,
                      [key]: Math.min(prev[key] + 1, totalPages),
                    }));
                  };
      
                  return (
                    <div key={key} className="mt-10">
                      <h3 className="text-2xl font-semibold mb-4 text-gray-700">
                        {key === "completed"
                          ? "Pesquisas Passadas"
                          : key === "ongoing"
                          ? "Pesquisas em Andamento"
                          : "Pesquisas Futuras"}
                      </h3>
                      {filteredAndSorted.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          Nenhuma pesquisa encontrada.
                        </p>
                      ) : (
                        <motion.div
                          layout
                          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {filteredAndSorted
                            .slice((page[key] - 1) * perPage, page[key] * perPage)
                            .map((research) => (
                              <motion.div
                                key={research.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ResearchCardDashboard
                                  research={research}
                                />
                              </motion.div>
                            ))}
                        </motion.div>
                      )}
      
                      {filteredAndSorted.length > perPage && (
                        <div className="flex items-center justify-between gap-6 mt-6">
                          <Button
                            onClick={handlePrevious}
                            disabled={page[key] === 1}
                            variant="secondary"
                            className="px-4 py-2 text-sm"
                          >
                            Anterior
                          </Button>
                          <span className="text-sm text-gray-70">
                            Página {page[key]} de {totalPages}
                          </span>
                          <Button
                            onClick={handleNext}
                            disabled={page[key] === totalPages}
                            variant="secondary"
                            className="px-4 py-2 text-sm"
                          >
                            Próxima
                          </Button>
                        </div>
                      )}
      
                      <hr className="my-6 border-gray-200" />
                    </div>
                  );
                })}
              </motion.section>
            </main>
          </div>
    </motion.
    section>
  );
}

Home.layout = "private";
Home.pageName = "Dashboard";
