import { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { formatDateToDDMMYY } from "@/utils/formatDate";
import {
  getCachedItemById,
  updateCachedItemById,
  syncCachedData,
} from "@/services/cache";

export default function Profile() {
  const { isLoading, setIsLoading } = useLoading(false);
  const { showMessage } = useMessage();
  const { userData, saveUserInfo } = useAuth();
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    status: "",
    role: "",
    created_at: "",
    updated_at: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
  });

  // 🧠 Carrega dados do cache ao montar
  useEffect(() => {
    const loadFromCache = async () => {
      if (!userData?.id) return;

      try {
        const cachedUserData = await getCachedItemById("users", userData.id);
        if (cachedUserData) {
          document.title = `${cachedUserData.name} - Perfil`;
          setForm({
            id: cachedUserData.id || "",
            name: cachedUserData.name || "",
            email: cachedUserData.email || "",
            status: cachedUserData.status || "",
            role: cachedUserData.role || "",
            created_at: formatDateToDDMMYY(cachedUserData.created_at),
            updated_at: formatDateToDDMMYY(cachedUserData.updated_at),
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados do cache:", err);
      }
    };

    loadFromCache();
  }, [userData]);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncCachedData("users");

      const updated = await getCachedItemById("users", userData.id);
      if (updated) {
        setForm({
          id: updated.id,
          name: updated.name,
          email: updated.email,
          status: updated.status,
          role: updated.role,
          created_at: formatDateToDDMMYY(updated.created_at),
          updated_at: formatDateToDDMMYY(updated.updated_at),
        });
      }

      showMessage("Dados sincronizados com sucesso!", "azul_claro");
    } catch (err) {
      showMessage("Erro ao sincronizar dados do servidor", "vermelho_claro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar perfil");

      if (data.user) {
        saveUserInfo(data.user);
        await updateCachedItemById("users", data.user.id, data.user);

        setForm({
          ...form,
          updated_at: formatDateToDDMMYY(data.user.updated_at),
        });

        showMessage("Perfil atualizado com sucesso!", "verde");
      }
    } catch (err) {
      showMessage(err.message, "vermelho_claro");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (passwordForm.new_password !== passwordForm.confirm_password) {
        throw new Error("As senhas não coincidem");
      }

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar senha");

      showMessage("Senha atualizada com sucesso!", "verde");
      setPasswordForm({ new_password: "", confirm_password: "" });
    } catch (err) {
      showMessage(err.message, "vermelho_claro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <main className="p-2 md:p-6 space-y-8 max-w-3xl mx-auto">
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold mb-4">Dados do Perfil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <span className="font-bold">Nome:</span>
              <p>{form.name}</p>
            </div>
            <div
              className="hidden md:block">
              <span className="font-bold">E-mail:</span>
              <p>{form.email}</p>
            </div>
            <div>
              <span className="font-bold">ID:</span>
              <p>{form.id}</p>
            </div>
            <div>
              <span className="font-bold">Status:</span>
              <p>{form.status}</p>
            </div>
            <div>
              <span className="font-bold">Papel:</span>
              <p>{form.role}</p>
            </div>
            <div>
              <span className="font-bold">Criado em:</span>
              <p>{form.created_at}</p>
            </div>
            <div>
              <span className="font-bold">Atualizado em:</span>
              <p>{form.updated_at}</p>
            </div>
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
        </section>

        {/* Editar nome e e-mail */}
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold mb-4">Editar Informações</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-center">
              <Button
                type="submit"
                variant="dark"
                className="w-full max-w-60 text-md active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </section>

        {/* Alterar senha */}
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                placeholder="Nova Senha"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className="border p-2 rounded w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showNewPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="confirm_password"
                placeholder="Confirme a Nova Senha"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                className="border p-2 rounded w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showNewPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <div className="flex justify-center">
              <Button
                type="submit"
                variant="dark"
                className="w-full max-w-60 text-md active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? "Atualizando..." : "Alterar Senha"}
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

Profile.layout = "private";
