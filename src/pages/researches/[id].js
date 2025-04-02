import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ResearchForm from "@/components/research/ResearchForm";
import { useMessage } from "@/context/MessageContext";
import ResearchLoadingSkeleton from "@/components/research/ResearchLoadingSkeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function EditResearch() {
  const router = useRouter();
  const { id } = router.query;
  const { showMessage } = useMessage();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/researches/${id}`);
        const data = await res.json();

        if (!data.research) {
          showMessage("Pesquisa não encontrada", "vermelho_claro", 5000);
          setLoading(false);
          return;
        }
        const formatted = {
          ...data.research,
          selectedCollaborators: (data.contributors || []).map((c) => ({
            value: c.user_id,
            label: c.users.name,
            email: c.users.email,
            role: c.users.role,
            status: c.users.status,
          })),
        };
        setInitialData(formatted);
      } catch (err) {
        console.error("Erro ao buscar dados da pesquisa:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleUpdate = async (payload) => {
    try {
      const res = await fetch("/api/researches/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id }),
      });

      if (!res.ok) {
        throw new Error(`Falha ao atualizar pesquisa. Status: ${res.status}`);
      }
      const updatedData = await res.json();
      console.log("Pesquisa atualizada com sucesso:", updatedData);
    } catch (err) {
      console.error("Erro ao atualizar a pesquisa:", err);
      showMessage("Erro ao atualizar a pesquisa:", "vermelho_claro", 5000);
    }
  };

  if (loading) return <ResearchLoadingSkeleton />;

  if (!initialData) {
    return (
      <div className="p-6 text-red-500">
        Não foi possível carregar a pesquisa.
      </div>
    );
  }

  const sections = [
    { id: "pesquisa", label: "Pesquisa", icon: "search" },
    { id: "formulario", label: "Formulário", icon: "description" },
    { id: "estatica", label: "Estática", icon: "insights" },
    { id: "dinamica", label: "Dinâmica", icon: "sync_alt" },
  ];

  return (
    <div className="relative">
      {/* Conteúdo principal */}
      <main className="p-4 sm:p-6 space-y-20">
        <section id="pesquisa">
          <h2 className="text-2xl font-bold mb-4">Pesquisa</h2>
          <ResearchForm
            isEdit
            initialData={initialData}
            onSubmit={handleUpdate}
          />
        </section>

        <section id="formulario">
          <h2 className="text-2xl font-bold mb-4">Formulário</h2>
          <div className="border rounded-lg p-6 text-sm text-gray-500 bg-gray-50">
            Conteúdo do formulário será adicionado aqui...
          </div>
        </section>

        <section id="estatica">
          <h2 className="text-2xl font-bold mb-4">Estática</h2>
          <div className="border rounded-lg p-6 text-sm text-gray-500 bg-gray-50">
            Conteúdo estático será adicionado aqui...
          </div>
        </section>

        <section id="dinamica">
          <h2 className="text-2xl font-bold mb-4">Dinâmica</h2>
          <div className="border rounded-lg p-6 text-sm text-gray-500 bg-gray-50">
            Conteúdo dinâmico será adicionado aqui...
          </div>
        </section>
      </main>

      {/* Botão de toggle */}
      <button
        onClick={() => setNavVisible(!navVisible)}
        className="fixed bottom-4 right-4 bg-black text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50"
      >
        <span className="material-symbols-outlined">
          {navVisible ? "close" : "menu"}
        </span>
      </button>

      {/* Navbar lateral direita fixa visível ao ativar */}
      <AnimatePresence>
        {navVisible && (
          <motion.nav
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed right-0 top-1/3 -translate-y-1/2 bg-white border-l border-gray-200 rounded-l-xl shadow-xl p-4 flex flex-col gap-5 z-40"
          >
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  const el = document.getElementById(section.id);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600 transition"
              >
                <span className="material-symbols-outlined text-xl">
                  {section.icon}
                </span>
                <span className="text-[10px] mt-1">{section.label}</span>
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

EditResearch.layout = "private";
EditResearch.pageName = "Editar Pesquisa";