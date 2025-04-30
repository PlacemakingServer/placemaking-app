import { useState } from "react";
import { motion } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";
import FiltersComponent from "@/components/ui/FiltersComponent";
import { useMessage } from "@/context/MessageContext";
import { useRouter } from "next/router";
import ResearchCardDashboard from "@/components/ui/Research/ResearchCardDashboard";
import Button from "@/components/ui/Button";
import { VARIANTS } from "@/config/colors";
import { useResearches } from "@/hooks/useResearches"; // << usando o hook certo!
import { Info } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function Home() {
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
  const router = useRouter();

  const currentDate = new Date();
  const categorizedResearches = {
    completed: [],
    ongoing: [],
    future: [],
  };

  // Mockando os dados para o gráfico

  const charData = [
    {
      id: 1,
      title: "Uso do espaço público",
      description:
        "Com que frequência você utiliza os espaços públicos da sua região?",
      chartData: [
        { label: "Diariamente", value: 40 },
        { label: "Semanalmente", value: 30 },
        { label: "Raramente", value: 20 },
        { label: "Nunca", value: 10 },
      ],
    },
    {
      id: 2,
      title: "Atividades preferidas",
      description: "Quais atividades você mais realiza nos espaços públicos?",
      chartData: [
        { label: "Caminhada", value: 45 },
        { label: "Lazer com crianças", value: 25 },
        { label: "Encontros sociais", value: 20 },
        { label: "Atividades físicas", value: 10 },
      ],
    },
    {
      id: 3,
      title: "Sensação de segurança",
      description:
        "Como você avalia a segurança nos espaços públicos da sua área?",
      chartData: [
        { label: "Muito seguro", value: 15 },
        { label: "Relativamente seguro", value: 50 },
        { label: "Pouco seguro", value: 25 },
        { label: "Inseguro", value: 10 },
      ],
    },
    {
      id: 4,
      title: "Infraestrutura percebida",
      description: "Como você avalia a infraestrutura dos espaços públicos?",
      chartData: [
        { label: "Excelente", value: 10 },
        { label: "Boa", value: 35 },
        { label: "Regular", value: 30 },
        { label: "Ruim", value: 25 },
      ],
    },
  ];

  // Cores para os gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF", "#FF6699"];

  // Paginação das Researches do Footer
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(researches.length / itemsPerPage);

  const nextPage = () => {
    if (endIndex < researches.length) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  //Paginação dos gráficos

  const [chartPage, setChartPage] = useState(0);
  const totalChartPages = charData.length;

  const nextChart = () => {
    if (chartPage < totalChartPages - 1) setChartPage((prev) => prev + 1);
  };

  const prevChart = () => {
    if (chartPage > 0) setChartPage((prev) => prev - 1);
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Suas Pesquisas
              </h2>
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
                setShowCategory({
                  completed: true,
                  ongoing: true,
                  future: true,
                });
              }}
            />

            {loading ? (
              <p className="text-center text-gray-500 mt-10">
                Carregando pesquisas...
              </p>
            ) : (
              Object.entries(categorizedResearches).map(([key, list]) => {
                if (!showCategory[key]) return null;
                const filteredAndSorted = filterAndSortResearches(list);
                const totalPages = Math.ceil(
                  filteredAndSorted.length / perPage
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
                                showButton={false}
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
              })
            )}
            <div className="flex flex-col gap-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-row items-center gap-2 bg-slate-300 rounded-full px-2 py-1 text-sm text-gray-500 w-50"
              >
                <span className="material-symbols-outlined text-gray-500">
                  search
                </span>
                <p className="text-sm text-gray-500">
                  Busque aqui por título, descrição ou local
                </p>
              </motion.div>
              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full bg-white shadow-md rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Pesquisas
                      </h3>
                      <div className="flex flex-row items-center justify-between gap-4 px-2 py-3">
                        <span className="material-symbols-outlined text-gray-500">
                          info
                        </span>
                        <p className="text-sm text-gray-500">
                          Clique em uma pesquisa para ver mais detalhes ou
                          responder.
                        </p>
                      </div>
                    </div>

                    {/* Lista de pesquisas */}
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                      {researches
                        .slice(startIndex, endIndex)
                        .map((research) => (
                          <li
                            key={research.id}
                            className="p-3 border border-gray-200 rounded hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleResearchClick(research)}
                          >
                            <p className="font-medium">{research.title}</p>
                            <p className="text-sm text-gray-500">
                              {research.description}
                            </p>
                          </li>
                        ))}
                    </ul>

                    {/* Paginação */}
                    <div className="flex justify-between items-center pt-2 text-sm">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <span className="text-gray-600">
                        Página {currentPage} - {totalPages}
                      </span>
                      <button
                        onClick={nextPage}
                        disabled={endIndex >= researches.length}
                        className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50"
                      >
                        Próxima
                      </button>
                    </div>
                  </motion.div>
                </div>
                <div className="flex items-center gap-2 w-full h-full justify-center">
                  {selectedResearch ? (
                    <motion.div
                      key={selectedResearch.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-white shadow-md rounded-lg p-4 space-y-4 h-full"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-700">
                          {selectedResearch.title}
                        </h3>
                        <button
                          className="text-sm text-blue-600 underline"
                          onClick={() => viewResponses(selectedResearch.id)}
                        >
                          Ver respostas
                        </button>
                      </div>
                      <div className="w-full max-h-80 h-full flex flex-col items-center justify-center gap-2">
                        {charData.length > 0 && (
                          <>
                            <h2 className="text-base font-semibold text-gray-700 mb-1">
                              {charData[chartPage].title}
                            </h2>
                            <span className="text-sm text-gray-500">
                              {charData[chartPage].description}
                            </span>

                            <div className="w-full h-60 my-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={charData[chartPage].chartData}
                                    dataKey="value"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={60}
                                    fill="#8884d8"
                                    label
                                  >
                                    {charData[chartPage].chartData.map(
                                      (_, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={COLORS[index % COLORS.length]}
                                        />
                                      )
                                    )}
                                  </Pie>
                                  <Tooltip />
                                  <Legend verticalAlign="bottom" height={2} fontSize={1} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="flex justify-between text-sm mt-2">
                              <button
                                onClick={prevChart}
                                disabled={chartPage === 0}
                                className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50"
                              >
                                Anterior
                              </button>
                              <span className="text-gray-600">
                                Gráfico {chartPage + 1} de {totalChartPages}
                              </span>
                              <button
                                onClick={nextChart}
                                disabled={chartPage >= totalChartPages - 1}
                                className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50"
                              >
                                Próximo
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      Selecione uma pesquisa
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </motion.section>
  );
}

Home.layout = "private";
Home.pageName = "Dashboard";
