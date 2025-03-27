import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Image from "next/image";
import Button from "@/components/ui/button";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [role, setRole] = useState("pesquisador");
  const { isLoading, setIsLoading } = useLoading(false);
  const { showMessage } = useMessage();
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (email !== confirmationEmail) {
      showMessage("Os emails não coincidem", "vermelho_claro");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, confirmation_email: confirmationEmail, role }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao criar usuário");
      }

      showMessage("Usuário criado com sucesso!", "verde");
    } catch (err) {
      showMessage(err.message, "vermelho_claro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl"
      >
        <div className="flex justify-center mb-4">
          <Image src="/img/logo-no-bg-azul.png" alt="Logo" width={200} height={100} className="object-contain" />
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              autoComplete="email"
              className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          {/* Confirmação de Email */}
          <div>
            <label htmlFor="confirmationEmail" className="block text-sm font-medium text-gray-700">Confirmar Email</label>
            <input
              type="email"
              id="confirmationEmail"
              value={confirmationEmail}
              onChange={(e) => setConfirmationEmail(e.target.value)}
              inputMode="email"
              autoComplete="email"
              className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o email novamente"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Tipo de usuário</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pesquisador">Pesquisador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <Button type="submit" variant="azul_escuro" className="w-full text-lg py-3 active:scale-95" disabled={isLoading}>
            {isLoading ? "Criando usuário..." : "Criar usuário"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

Register.pageName = "Registrar";
Register.layout = "private";
