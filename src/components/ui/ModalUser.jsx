// src/components/ui/ModalUser.jsx
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  updateCachedItemById,
  deleteCachedItemById,
  markItemForUpdate,
  markItemForDelete,
} from "@/services/cache";
import Button from "@/components/ui/Button";
import { USER_ROLES, USER_STATUS } from "@/config/data_types";
import Link from "next/link";

export default function ModalUser({
  isOpen,
  user,
  onClose,
  onUserUpdated,
  onUserDeleted,
  showMessage,
}) {
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

  const cleanStatus = (status) => status.replace(/^["']|["']$/g, "");

  const handleUpdate = async () => {
    setIsProcessing(true);
    const updateData = { ...form, status: cleanStatus(form.status) };
    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (!res.ok) {
        // Se a API falhar, marca para sincronização
        await markItemForUpdate("users", form.id, updateData);
        showMessage(
          "Falha na atualização. Alteração pendente de sincronização.",
          "vermelho",
          5000
        );
      } else {
        // Em caso de sucesso, force a atualização removendo o status pendente
        const updatedDataWithSync = { ...updateData, _syncStatus: "synced" };
        await updateCachedItemById("users", form.id, updatedDataWithSync);
        onUserUpdated({
          ...form,
          _syncStatus: "synced",
          updated_at: data.updated_at || new Date().toISOString(),
        });
        showMessage("Usuário atualizado com sucesso!", "azul_claro");
      }
      onClose();
    } catch (err) {
      await markItemForUpdate("users", form.id, updateData);
      showMessage(
        "Erro ao atualizar. Alteração ficará pendente de sincronização.",
        "vermelho",
        5000
      );
    } finally {
      setIsProcessing(false);
    }
  };
  

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Se a exclusão falhar, marca para sincronização
        await markItemForDelete("users", user.id);
        showMessage(
          "Falha ao deletar. Exclusão pendente de sincronização.",
          "vermelho",
          5000
        );
      } else {
        await deleteCachedItemById("users", user.id);
        onUserDeleted(user.id);
        showMessage("Usuário deletado com sucesso!", "verde");
      }
      onClose();
    } catch (err) {
      await markItemForDelete("users", user.id);
      showMessage(
        "Erro ao deletar. Exclusão ficará pendente de sincronização.",
        "vermelho",
        5000
      );
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
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-2"
          >
            <div className="bg-gray-600 rounded-t-lg p-4">
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
                  <option value="">Selecione um papel</option>
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
                  <option value="">Selecione um status</option>
                  {USER_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row justify-center items-center">
                <Link href={`/users/${form.id}`} passHref>
                  <Button variant="dark" className="w-full">
                    Ver Perfil
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-between items-center space-x-2 p-4 border-t">
              <Button
                onClick={handleDelete}
                variant="transparent_vermelho"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Excluindo..."
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Excluir</span>
                    <span className="material-symbols-outlined text-base">
                      delete
                    </span>
                  </div>
                )}
              </Button>
              <Button
                onClick={handleUpdate}
                variant="transparent_verde"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Salvando..."
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Salvar</span>
                    <span className="material-symbols-outlined text-base">
                      save
                    </span>
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}




