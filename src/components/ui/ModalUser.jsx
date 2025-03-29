// src/components/ui/ModalUser.jsx
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { updateCachedItemById } from "@/services/cache";
import Button from "@/components/ui/Button";
import { USER_ROLES, USER_STATUS } from "@/config/data_types";

export default function ModalUser({
  isOpen,
  user,
  onClose,
  onUserUpdated,
  onUserDeleted,
  showMessage,
}) {
  // Estados locais para edição e loading
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    status: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        id: user.id || "",
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        status: user.status || "",
      });
    }
  }, [user]);

  if (!isOpen || !user) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Atualiza usuário
  const handleUpdate = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar usuário.");

      // Atualiza o IndexedDB
      await updateCachedItemById("users", form.id, {
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
      });

      onUserUpdated({
        ...form,
        updated_at: data.updated_at || new Date().toISOString(),
      });
      showMessage("Usuário atualizado com sucesso!", "azul_claro");
      onClose();
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Excluir usuário
  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao deletar usuário.");

      onUserDeleted(user.id);
      showMessage("Usuário deletado com sucesso!", "verde");
      onClose();
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay com fade */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Conteúdo do modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-2"
          >
            {/* Header com fundo colorido */}
            <div className="bg-black rounded-t-lg p-4">
              <h2 className="text-xl font-semibold text-white">
                Detalhes do Usuário
              </h2>
              <button
                className="absolute top-3 right-3 text-white hover:text-gray-200"
                onClick={onClose}
              >
                <span className="material-symbols-outlined text-xl">
                  close
                </span>
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 border border-gray-300 rounded w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 border border-gray-300 rounded w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Papel
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="mt-1 border border-gray-300 rounded w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="mt-1 border border-gray-300 rounded w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {USER_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end items-center space-x-2 p-4 border-t">
              <Button
                onClick={handleDelete}
                variant="transparent_vermelho"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Excluindo..."
                ) : (
                  <span className="material-symbols-outlined text-base">
                    delete
                  </span>
                )}
              </Button>
              <Button onClick={handleUpdate} variant="dark" disabled={isProcessing}>
                {isProcessing ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
