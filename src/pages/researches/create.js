import { useRouter } from "next/router";
import { useEffect } from "react";
import ResearchForm from "@/components/research/ResearchForm";
import { initAuthDB } from "@/lib/db";
import { useMessage } from "@/context/MessageContext";
import { useLoading } from "@/context/LoadingContext";

export default function CreateResearch() {
  const { showMessage } = useMessage();
  const { setIsLoading } = useLoading();
  const router = useRouter();

  const handleCreate = async (payload) => {
    setIsLoading(true);

    try {
      const db = await initAuthDB();
      const stored = await db.get("user-data", "user-data");
      const userId = stored?.user?.id;

      if (!userId) {
        showMessage("Usuário não encontrado", "vermelho", 5000);
        return;
      }

      const res = await fetch("/api/researches/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.error || "Erro ao criar a pesquisa.";
        showMessage(message, "vermelho", 5000);
        return;
      }

      showMessage("Pesquisa criada com sucesso!", "verde", 4000);
      router.push(`/researches/${data.research.id}`);
    } catch (error) {
      console.error("Erro ao criar pesquisa:", error);
      showMessage("Erro interno ao criar pesquisa.", "vermelho", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResearchForm
      isEdit={false}
      onSubmit={handleCreate}
    />
  );
}

CreateResearch.layout = "private";
CreateResearch.pageName = "Criar Pesquisa";
