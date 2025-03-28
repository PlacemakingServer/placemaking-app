import Button from "@/components/ui/Button";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { useState, useEffect, useCallback } from "react";

export default function Users() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    confirmation_email: "",
    role: "",
  });

  const { isLoading, setIsLoading } = useLoading(false);
  const { showMessage } = useMessage();

  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingData, setEditingData] = useState({});

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users", {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao buscar usuários");

      setUsers(data.users);
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showMessage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      showMessage("Usuário atualizado com sucesso!", "verde");
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
      setEditingUserId(null);
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
    <div className="min-h-screen bg-transparent">
      <main className="p-6 space-y-12">
        {/* Seção de Cadastro */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Usuário</h2>
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
            <div className="w-full text-md flex justify-center p-4 rounded">
              <Button
                type="submit"
                variant="dark"
                className="w-full max-w-60 text-md active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </section>

        {/* Seção de Gerenciamento */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Usuários Cadastrados</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">Nenhum usuário cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-white bg-black border-gray-800 hover:bg-gray-800">
                    <th className="p-2">Nome</th>
                    <th className="p-2">E-mail</th>
                    <th className="p-2">Papel</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="p-2">
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
                      <td className="p-2">
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
                      <td className="p-2">
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
                      <td className="p-2">
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
                      <td className="p-2 space-x-2">
                        {editingUserId === u.id ? (
                          <>
                            <Button
                              type="submit"
                              variant="transparent_verde"
                              onClick={() => handleSave(u.id)}
                              className="active:scale-95 py-0.5 px-1 border-none rounded-sm justify-center align-middle"
                              disabled={isLoading}
                            >
                              <span class="material-symbols-outlined">
                                check_circle
                              </span>
                            </Button>

                            <Button
                              type="submit"
                              variant="transparent_vermelho"
                              onClick={handleCancel}
                              className="active:scale-95 py-0.5 px-1 border-none rounded-sm justify-center align-middle"
                              disabled={isLoading}
                            >
                              <span class="material-symbols-outlined">
                                close
                              </span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="submit"
                              variant="transparent_cinza"
                              onClick={() => handleEdit(u)}
                              className="active:scale-95 py-0.5 px-1 border-none rounded-sm justify-center align-middle"
                              disabled={isLoading}
                            >
                              <span className="material-symbols-outlined">
                                edit
                              </span>
                            </Button>

                            <Button
                              type="submit"
                              variant="transparent_vermelho"
                              onClick={() => handleDelete(u.id)}
                              className="active:scale-95 py-0.5 px-1 border-none rounded-sm justify-center align-middle"
                              disabled={isLoading}
                            >
                              <span class="material-symbols-outlined">
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
        </section>
      </main>
    </div>
  );
}

Users.pageName = "Gerenciar Usuários";
Users.layout = "private";
