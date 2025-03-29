import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { getCachedData, syncCachedData, updateCachedItemById } from "@/services/cache";

export default function Users() {
  // Estado do formulário de cadastro (permanece inalterado)
  const [form, setForm] = useState({
    name: "",
    email: "",
    confirmation_email: "",
    role: "",
  });

  // Estados para edição dos usuários
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingData, setEditingData] = useState({});

  // Estados de listagem e paginação dos usuários no cache
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

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
  }, [page, setIsLoading, showMessage]);

  useEffect(() => {
    loadCachedUsers();
  }, [loadCachedUsers]);

  // Função para sincronizar os dados via cache (cache-first update)
  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncCachedData("users");
      showMessage("Dados sincronizados com sucesso!", "azul_claro");
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

  // Funções do formulário de cadastro (mantidas conforme seu código)
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

      // Atualiza a lista localmente (idealmente o cache também seria atualizado)
      setUsers((prev) => [
        ...prev,
        {
          id: data.id || Date.now(),
          name: form.name,
          email: form.email,
          role: form.role,
          status: data.status || "Ativo",
        },
      ]);
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 5000);
    } finally {
      setForm({ name: "", email: "", confirmation_email: "", role: "" });
      setIsLoading(false);
    }
  };

  // Funções de edição, atualização e remoção dos usuários
  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditingData({ ...user });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (userId) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...editingData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...editingData } : u))
      );

      updateCachedItemById("users", userId, editingData);

      showMessage("Usuário atualizado com sucesso!", "azul_claro");

    } catch (err) {

      showMessage(err.message, "vermelho_claro", 5000);

    } finally {
      setEditingUserId(null);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
  };

  const handleDelete = async (userId) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao deletar");

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showMessage("Usuário deletado", "verde");
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
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
                <option value="">Selecione o papel</option>
                <option value="admin">admin</option>
                <option value="viewer">research</option>
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
            <h2 className="text-2xl font-bold mb-2 md:mb-0">Usuários Cadastrados</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Os dados podem estar desatualizados. Clique em “Atualizar” para sincronizar com o servidor.
          </p>
          <div className="flex items-center space-x-2 mb-4">
              <Button
                onClick={handleSync}
                disabled={isLoading}
                className="px-4 py-2 transition"
                variant="dark"
              >
                Atualizar
              </Button>
            </div>
          {users.length === 0 ? (
            <p className="text-gray-500">Nenhum usuário cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse p-4">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="p-3">Nome</th>
                    <th className="p-3">E-mail</th>
                    <th className="p-3">Papel</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {editingUserId === u.id ? (
                          <input
                            type="text"
                            name="name"
                            value={editingData.name}
                            onChange={handleEditChange}
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          u.name
                        )}
                      </td>
                      <td className="p-3">
                        {editingUserId === u.id ? (
                          <input
                            type="email"
                            name="email"
                            value={editingData.email}
                            onChange={handleEditChange}
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          u.email
                        )}
                      </td>
                      <td className="p-3">
                        {editingUserId === u.id ? (
                          <select
                            name="role"
                            value={editingData.role}
                            onChange={handleEditChange}
                            className="border p-1 rounded w-full"
                          >
                            <option value="admin">admin</option>
                            <option value="viewer">research</option>
                          </select>
                        ) : (
                          u.role
                        )}
                      </td>
                      <td className="p-3">
                        {editingUserId === u.id ? (
                          <input
                            type="text"
                            name="status"
                            value={editingData.status}
                            onChange={handleEditChange}
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          u.status
                        )}
                      </td>
                      <td className="p-3 flex space-x-2">
                        {editingUserId === u.id ? (
                          <>
                            <Button
                              onClick={() => handleSave(u.id)}
                              variant="transparent_verde"
                              disabled={isLoading}
                              className="p-1"
                            >
                              <span className="material-symbols-outlined">
                                check_circle
                              </span>
                            </Button>
                            <Button
                              onClick={handleCancel}
                              variant="transparent_vermelho"
                              disabled={isLoading}
                              className="p-1"
                            >
                              <span className="material-symbols-outlined">
                                close
                              </span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEdit(u)}
                              variant="transparent_cinza"
                              disabled={isLoading}
                              className="p-1"
                            >
                              <span className="material-symbols-outlined">
                                edit
                              </span>
                            </Button>
                            <Button
                              onClick={() => handleDelete(u.id)}
                              variant="transparent_vermelho"
                              disabled={isLoading}
                              className="p-1"
                            >
                              <span className="material-symbols-outlined">
                                delete
                              </span>
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Controles de paginação */}
          <div className="flex items-center justify-between mt-4">
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
        </section>
      </main>
    </div>
  );
}

Users.pageName = "Gerenciar Usuários";
Users.layout = "private";
