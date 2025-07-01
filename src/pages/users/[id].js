"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { formatDateToDDMMYY } from "@/utils/formatDate";
import { Eye, EyeOff, User, Mail, Calendar, Shield, Hash } from "lucide-react";
import { useUsers } from "@/hooks/useUsers"; // Declare the useUsers hook

export default function Profile() {
  const { isLoading, setIsLoading } = useLoading(false);
  const { showMessage } = useMessage();
  const { userData, saveUserInfo } = useAuth();
  const router = useRouter();
  const { id: routeUserId } = router.query;
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

  const isSelf = userData?.id === routeUserId;
  const { userData: selectedUser } = useUsers(true, routeUserId);

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
        if (isSelf) saveUserInfo(data.user);
        await updateCachedItemById("users", data.user.id, data.user);
        setForm((prev) => ({
          ...prev,
          updated_at: formatDateToDDMMYY(data.user.updated_at),
        }));
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

  useEffect(() => {
    if (selectedUser) {
      setForm({
        id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        status: selectedUser.status,
        role: selectedUser.role,
        created_at: formatDateToDDMMYY(selectedUser.created_at),
        updated_at: formatDateToDDMMYY(selectedUser.updated_at),
      });
    }
  }, [selectedUser]);

  const profileFields = [
    { label: "Nome", value: form.name, icon: User },
    { label: "E-mail", value: form.email, icon: Mail },
    { label: "ID", value: form.id, icon: Hash },
    { label: "Status", value: form.status, icon: Shield },
    { label: "Papel", value: form.role, icon: Shield },
    { label: "Criado em", value: form.created_at, icon: Calendar },
    { label: "Atualizado em", value: form.updated_at, icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
            {isSelf ? "Meu Perfil" : "Perfil do Usuário"}
          </h1>
          <div className="w-24 h-px bg-gray-900 mx-auto"></div>
        </motion.div>

        {!selectedUser ? (
          <div className="flex justify-center items-center h-96">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-2 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Profile Information */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white border border-gray-200 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-2xl font-light text-gray-900 tracking-wide">
                  Informações do Perfil
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {profileFields.map((field, index) => {
                    const IconComponent = field.icon;
                    return (
                      <motion.div
                        key={field.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                              {field.label}
                            </dt>
                            <dd className="text-lg text-gray-900 font-light break-words">
                              {field.value || "—"}
                            </dd>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.section>

            {isSelf && (
              <>
                {/* Edit Information */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white border border-gray-200 overflow-hidden"
                >
                  <div className="px-8 py-6 border-b border-gray-100">
                    <h2 className="text-2xl font-light text-gray-900 tracking-wide">
                      Editar Informações
                    </h2>
                  </div>
                  <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider">
                            Nome
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider">
                            E-mail
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-center pt-4">
                        <Button
                          type="submit"
                          variant="dark"
                          className="px-12 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 font-medium tracking-wide uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoading}
                        >
                          {isLoading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.section>

                {/* Change Password */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white border border-gray-200 overflow-hidden"
                >
                  <div className="px-8 py-6 border-b border-gray-100">
                    <h2 className="text-2xl font-light text-gray-900 tracking-wide">
                      Alterar Senha
                    </h2>
                  </div>
                  <div className="p-8">
                    <form onSubmit={handlePasswordSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider">
                            Nova Senha
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="new_password"
                              value={passwordForm.new_password}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword((prev) => !prev)
                              }
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider">
                            Confirme a Nova Senha
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="confirm_password"
                              value={passwordForm.confirm_password}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword((prev) => !prev)
                              }
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center pt-4">
                        <Button
                          type="submit"
                          variant="dark"
                          className="px-12 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 font-medium tracking-wide uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoading}
                        >
                          {isLoading ? "Atualizando..." : "Alterar Senha"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.section>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

Profile.pageName = "Perfil do Usuário";
Profile.layout = "private";
