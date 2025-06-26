import { useState } from "react";
import { motion } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";
import FiltersComponent from "@/components/ui/FiltersComponent";
import { useAuth } from '@/context/AuthContext';
import { useMessage } from "@/context/MessageContext";
import ResearchCardDashboard from "@/components/ui/Research/ResearchCardDashboard";
import ResearchCardSkeleton from "@/components/ui/Research/ResearchCardSkeleton";
import Button from "@/components/ui/Button";
import { VARIANTS } from "@/config/colors";
import { useResearches } from "@/hooks/useResearches";
import { Info } from "lucide-react";

export default function Home() {
  const { userData } = useAuth();
  const { researches, loading } = useResearches(); // << usando hook
  const [filters, setFilters] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showCategory, setShowCategory] = useState({
    completed: false,
    ongoing: true,
    future: true,
  });
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [page, setPage] = useState({ completed: 1, ongoing: 1, future: 1 });
  const perPage = 3;
  const { setIsLoading } = useLoading();
  const { showMessage } = useMessage();
  const [showFilters, setShowFilters] = useState(false);

  const currentDate = new Date();
  const categorizedResearches = {
    completed: [],
    ongoing: [],
    future: [],
  };

  // Paginação das Researches do Footer
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

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

  const handleResearchClick = (research) => {
    setSelectedResearch(research);
  };

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
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg shadow-sm mb-8"
          >
            <Info size={24} className="text-blue-500" />
            <div className="text-sm font-medium">
              <strong>Aviso:</strong> Esta página ainda está em desenvolvimento.
              Em breve você verá aqui as pesquisas futuras e resumos de dados
              para resposta rápida.
            </div>
          </motion.div>
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-transparent rounded-2xl p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Suas Pesquisas
              </h2>
  
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
                setShowCategory({
                  completed: true,
                  ongoing: true,
                  future: true,
                });
              }}
            />
</div>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <ResearchCardSkeleton key={index} />
                ))
              : Object.entries(categorizedResearches).map(([key, list]) => {
                  if (!showCategory[key]) return null;
                  const filteredAndSorted = filterAndSortResearches(list);
                  const visibleResearches = filteredAndSorted.filter((research) => {
                    // admins veem tudo
                    if (userData?.role === "admin") return true;
                    console.log("chegou aqui:", research)
                    // contribuidor: vê se seu id está em algum research_contributor.user_id
                    return Array.isArray(research.research_contributors) &&
                           research.research_contributors.some(
                             (c) => c.user_id === userData.id
                           );
                  });
                  const totalPages = Math.ceil(
                    visibleResearches.length / perPage
                  );

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

                      {visibleResearches.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          Nenhuma pesquisa encontrada.
                        </p>
                      ) : (
                        <motion.div
                          layout
                          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {visibleResearches
                            .slice(
                              (page[key] - 1) * perPage,
                              page[key] * perPage
                            )
                            .map((research) => (
                              <motion.div
                                key={research.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ResearchCardDashboard
                                  showButton={true}
                                  research={research}
                                />
                              </motion.div>
                            ))}
                        </motion.div>
                      )}

                      {visibleResearches.length > perPage && (
                        <div className="flex items-center justify-between gap-6 mt-6">
                          <Button
                            onClick={handlePrevious}
                            disabled={page[key] === 1}
                            variant="secondary"
                            className="px-4 py-2 text-sm"
                          >
                            Anterior
                          </Button>
                          <span className="text-sm text-gray-700">
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
    </motion.section>
  );
}

Home.layout = "private";
Home.pageName = "Dashboard";
