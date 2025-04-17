// src/components/ui/ModalRegisterUser.jsx
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button_og";
import { USER_ROLES, USER_STATUS } from "@/config/data_types";
import { addCachedItem, markItemForCreate } from "@/services/cache";

export default function ModalRegisterUser({
  isOpen,
  onClose,
  onUserCreated,
  showMessage,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    confirmation_email: "",
    role: "",
    status: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        email: "",
        confirmation_email: "",
        role: "",
        status: "",
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.email !== form.confirmation_email) {
      showMessage("E-mails não coincidem", "vermelho_claro", 5000);
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar");
      showMessage("Usuário cadastrado com sucesso!", "verde");

      await addCachedItem("users", { ...data.user, _syncStatus: "synced" });
      if (onUserCreated) {
        onUserCreated(data.user);
      }
      onClose();
    } catch (err) {
      try {
        const pendingUser = await markItemForCreate("users", form);
        if (onUserCreated) {
          onUserCreated(pendingUser);
        }
        showMessage(
          "Servidor indisponível. Usuário salvo localmente e ficará pendente de sincronização.",
          "vermelho",
          5000
        );
      } catch (err) {
        showMessage(err.message, "vermelho_claro", 5000);
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                Cadastrar Novo Usuário
              </h2>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white hover:text-gray-200"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirmar E-mail
                  </label>
                  <input
                    type="email"
                    name="confirmation_email"
                    value={form.confirmation_email}
                    onChange={handleChange}
                    className="mt-1 border border-gray-300 rounded w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
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
                    required
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
                    required
                  >
                    <option value="">Selecione um status</option>
                    {USER_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    variant="dark"
                    disabled={isProcessing}
                    className="w-full max-w-xs text-md"
                  >
                    {isProcessing ? (
                      "Cadastrando..."
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="material-symbols-outlined mr-2">
                          person_add
                        </span>
                        Cadastrar
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
