import Button from "@/components/ui/Button";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { useState, useEffect, useCallback } from "react";

export default function Researchs() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    release_date: "",
    research_type: "",
    research_time: "",
    gap_by_research_time: "",
  });

  const { isLoading, setIsLoading } = useLoading(false);
  const { showMessage } = useMessage();

  const [researchTypes, setResearchTypes] = useState([]);
  const [researches, setResearches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  const fetchResearchTypes = useCallback(async () => {
    try {
      const res = await fetch("/api/research/types");
      const data = await res.json();
      if (res.ok) setResearchTypes(data.research_types || []);
    } catch (err) {
      showMessage("Erro ao carregar tipos de pesquisa", "vermelho_claro");
    }
  }, [showMessage]);

  const fetchResearches = useCallback(() => {
    // MOCK
    setResearches([
      {
        id: 1,
        title: "Pesquisa de Saúde Pública",
        description: "Análise do comportamento alimentar",
        release_date: "2025-04-10",
        research_type: "Qualitativa",
        research_time: 30,
        gap_by_research_time: 5,
      },
    ]);
  }, []);

  useEffect(() => {
    fetchResearchTypes();
    fetchResearches();
  }, [fetchResearchTypes, fetchResearches]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/research/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar pesquisa");

      setResearches((prev) => [...prev, { ...form, id: Date.now() }]);
      showMessage("Pesquisa criada com sucesso!", "verde");
      setForm({
        title: "",
        description: "",
        release_date: "",
        research_type: "",
        research_time: "",
        gap_by_research_time: "",
      });
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <main className="p-6 space-y-12">
        {/* Cadastro */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Cadastrar Nova Pesquisa</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="title" placeholder="Título" value={form.title} onChange={handleChange} className="border p-2 rounded w-full" required />
              <input type="date" name="release_date" value={form.release_date} onChange={handleChange} className="border p-2 rounded w-full" required />
              <input type="number" name="research_time" placeholder="Duração (min)" value={form.research_time} onChange={handleChange} className="border p-2 rounded w-full" />
              <input type="number" name="gap_by_research_time" placeholder="Intervalo (min)" value={form.gap_by_research_time} onChange={handleChange} className="border p-2 rounded w-full" />
              <select name="research_type" value={form.research_type} onChange={handleChange} className="border p-2 rounded w-full" required>
                <option value="">Tipo de Pesquisa</option>
                {researchTypes.map((r) => (
                  <option key={r.id} value={r.type}>{r.type}</option>
                ))}
              </select>
              <textarea name="description" placeholder="Descrição" value={form.description} onChange={handleChange} className="border p-2 rounded w-full col-span-full" required />
            </div>

            <div className="w-full flex justify-center">
            <Button type="submit" variant="dark" className="w-full max-w-60 text-md active:scale-95" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar"}
            </Button>
            </div>
            
          </form>
        </section>

        {/* Lista de Pesquisas */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Pesquisas Cadastradas</h2>
          {researches.length === 0 ? (
            <p className="text-gray-500">Nenhuma pesquisa cadastrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-white bg-black border-gray-800 hover:bg-gray-800">
                    <th className="p-2">Título</th>
                    <th className="p-2">Descrição</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Duração</th>
                    <th className="p-2">Data de Lançamento</th>
                  </tr>
                </thead>
                <tbody>
                  {researches.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{r.title}</td>
                      <td className="p-2">{r.description}</td>
                      <td className="p-2">{r.research_type}</td>
                      <td className="p-2">{r.research_time || "-"}</td>
                      <td className="p-2">{r.release_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

Researchs.pageName = "Pesquisas";
Researchs.layout = "private";