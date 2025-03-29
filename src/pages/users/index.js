import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import ModalUser from "@/components/ui/ModalUser"; // Importa o modal
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { USER_ROLES } from "@/config/data_types";

import {
  getCachedData,
  syncCachedData,
} from "@/services/cache";

export default function Users() {
  // Estado do formulário de cadastro
  const [form, setForm] = useState({
    name: "",
    email: "",
    confirmation_email: "",
    role: "",
  });

  // Estados de listagem e paginação
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  // Modal
  const [selectedUser, setSelectedUser] = useState(null);

  const { isLoading, setIsLoading } = useLoading();
  const { showMessage } = useMessage();

  // Carrega os dados dos usuários do cache (com paginação)
  const loadCachedUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCachedData("users", {
        paginated: true,
        page,
        perPage,
      });
      setUsers(result.items);
      setTotalPages(result.totalPages);
    } catch (err) {
      showMessage("Erro ao carregar dados do cache.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, setIsLoading, showMessage]);

  useEffect(() => {
    loadCachedUsers();
  }, [loadCachedUsers]);

  // Função para sincronizar os dados via cache
  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncCachedData("users");
      showMessage("Dados sincronizados com sucesso!", "azul_claro");
      // Recarrega lista
      loadCachedUsers();
    } catch (err) {
      showMessage("Erro ao sincronizar dados.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de paginação
  const handlePrevious = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  // Criação de usuário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar");

      showMessage("Usuário cadastrado com sucesso!", "verde");

      // Atualiza a lista localmente (para exibir imediatamente)
      setUsers((prev) => [
        ...prev,
        {
          id: data.id || Date.now(),
          name: form.name,
          email: form.email,
          role: form.role,
          status: data.status || "active",
        },
      ]);
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 5000);
    } finally {
      setForm({ name: "", email: "", confirmation_email: "", role: "" });
      setIsLoading(false);
    }
  };

  // Callbacks para atualizar/remover usuário após edição no modal
  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };
  const handleUserDeleted = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Seção de Cadastro */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Cadastrar Novo Usuário</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Nome"
                value={form.name}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={form.email}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="email"
                name="confirmation_email"
                placeholder="Confirmar E-mail"
                value={form.confirmation_email}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              >
                {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-center">
              <Button
                type="submit"
                variant="dark"
                className="w-full max-w-xs text-md active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </section>

        {/* Seção de Gerenciamento e Listagem */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-2xl font-bold mb-2 md:mb-0">
              Usuários Cadastrados
            </h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Os dados podem estar desatualizados. Clique em “Atualizar” para
            sincronizar com o servidor.
          </p>
          <div className="flex items-center space-x-2 mb-4">
            <Button
              onClick={handleSync}
              disabled={isLoading}
              className="px-4 py-2 transition flex justify-evenly items-center gap-2"
              variant="dark"
            >
              <span className="material-symbols-outlined">sync</span>
              <span>Atualizar</span>
            </Button>
          </div>

          {users.length === 0 ? (
            <p className="text-gray-500">Nenhum usuário cadastrado.</p>
          ) : (
            <>
              {/* Grid de "cartões" (flashcards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
                  >
                    {/* Conteúdo principal do card */}
                    <div className="space-y-2 text-sm">
                      <h3 className="text-lg font-semibold">{u.name}</h3>
                      <p className="text-gray-600">Email: {u.email}</p>
                      <p className="text-gray-600">Papel: {u.role}</p>
                      <p className="text-gray-600">Status: {u.status}</p>
                    </div>
                    {/* Botão de ações (abre modal) */}
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="transparent_cinza"
                        className="p-1"
                        onClick={() => setSelectedUser(u)}
                      >
                        <span className="material-symbols-outlined">
                          info
                        </span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controles de paginação */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  onClick={handlePrevious}
                  disabled={page === 1}
                  className="disabled:opacity-80"
                  variant="dark"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  Página {page} de {totalPages}
                </span>
                <Button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className="disabled:opacity-80"
                  variant="dark"
                >
                  Próxima
                </Button>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Modal de Detalhes e Edição de Usuário */}
      <ModalUser
        isOpen={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
        showMessage={showMessage}
      />
    </div>
  );
}

Users.pageName = "Gerenciar Usuários";
Users.layout = "private";
