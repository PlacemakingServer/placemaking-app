import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ResearchForm from "@/components/research/ResearchForm";
import { initAuthDB } from "@/lib/db";
import { useMessage } from "@/context/MessageContext";
import { useLoading } from "@/context/LoadingContext";
import { set } from "zod";

export default function CreateResearch() {
  const { showMessage } = useMessage();
  const { setIsLoading } = useLoading();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => { 
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      const formatted = data.users?.map((c) => ({
        value: c.id,
        label: c.name,
        role: c.role,
        status: c.status,
        email: c.email,
      }));
      setUsers(formatted || []);
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
    }
  };
      
  
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

      const release_date = payload.release_date
        ? `${payload.release_date}T00:00:00`
        : null;
      const end_date = payload.end_date
        ? `${payload.end_date}T00:00:00`
        : null;

      const finalPayload = {
        ...payload,
        release_date,
        end_date,
        created_by: userId,
      };

      const res = await fetch("/api/researches/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(finalPayload),
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
    <div className="pb-20">
      <ResearchForm
        isEdit={false} 
        onSubmit={handleCreate}
        users={users}
      />
    </div>
  );
}

CreateResearch.layout = "private";
CreateResearch.pageName = "Criar Pesquisa";
