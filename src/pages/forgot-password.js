import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMessage } from "@/context/MessageContext";
import { useLoading } from "@/context/LoadingContext";
import Link from "next/link";
import { useRouter } from "next/router"; 

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { showMessage } = useMessage();
  const { isLoading, setIsLoading } = useLoading();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao enviar email");
      }

      showMessage(
        "Se o email estiver cadastrado, você receberá o código para recuperar sua senha.",
        "verde"
      );
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 10000);
    } finally {
      setIsLoading(false);
      localStorage.setItem("recover_email", email);
      router.push("/validate-code"); 
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-8 bg-no-repeat bg-cover bg-center bg-black bg-opacity-60 bg-blend-darken"
      style={{ backgroundImage: "url('/img/bg-login.jpg')" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl"
      >
        <div className="flex justify-center mb-4">
          <Image
            src="/img/logo-no-bg-azul.png"
            alt="Logo"
            width={200}
            height={100}
            className="object-contain"
          />
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
          Recuperar Senha
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
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
          <div className="flex justify-end p-2">
            <Link
              href="/login"
              className="text-sm text-blue-500 hover:underline"
            >
              Login?
            </Link>
          </div>

          <Button
            type="submit"
            variant="azul_escuro"
            className="w-full text-lg py-3 active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

ForgotPassword.pageName = "Recuperar Senha";
ForgotPassword.layout = "public";
