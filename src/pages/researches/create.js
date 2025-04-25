import { useRouter } from "next/router";
import { useMemo } from "react";
import ResearchForm from "@/components/research/ResearchForm";
import { useMessage } from "@/context/MessageContext";
import { useLoading } from "@/context/LoadingContext";
import { useUsers, useAuthentication, useResearches } from "@/hooks";

export default function CreateResearch() {
  const { users: rawUsers, loading: usersLoading, error: usersError } = useUsers();
  const { addResearch } = useResearches();
  const { user } = useAuthentication();
  const { showMessage } = useMessage();
  const { setIsLoading } = useLoading();
  const router = useRouter();

  const users = useMemo(() => {
    if (!Array.isArray(rawUsers)) return [];
    return rawUsers.map((user) => ({
      value: user.id,
      id: user.id,
      label: user.name,
      role: user.role,
      status: user.status,
      email: user.email,
    }));
  }, [rawUsers]);

  const handleCreate = async (payload) => {
    setIsLoading(true);
    try {
      const userId = user?.id;
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

      const created = await addResearch(finalPayload);

      showMessage("Pesquisa criada com sucesso!", "verde", 4000);
      router.push(`/researches/${created?.id || ""}`);
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
