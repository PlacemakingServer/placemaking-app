import { use, useState } from "react";
import Button from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLoading } from "@/context/loadingContext";
import { useMessage } from "@/context/messageContext";
import { initAuthDB } from "@/lib/db";
import Link from "next/link";
import { useRouter } from "next/router"; 



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, setIsLoading } = useLoading(false);
  const { showMessage } = useMessage();
  const router = useRouter();
  

  const handleLogin = async (e) => {

    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData.message || "Erro ao fazer login");
      }

      const data = await res.json();

      const db = await initAuthDB();

      await db.put("auth", {
        id: data.user.id,
        access_token: data.access_token,
        token_type: data.token_type,
        expires_at: data.expires_at,
        user: data.user,
      });
      showMessage("Login efetuado com sucesso", "verde");
    } catch (err) {
      showMessage(err.message, "vermelho_claro")
    } finally {
      setIsLoading(false)
      router.push("/");     }
  };

  return (
    <div
    className="
      h-screen flex items-center justify-center p-8
      bg-no-repeat bg-cover bg-center bg-black bg-opacity-60 bg-blend-darken
    "
    style={{ backgroundImage: "url('/img/bg-login.jpg')"  }}
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

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              autoComplete="email"
              autoCorrect="off"
              className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-14"
                placeholder="********"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-sm  hover:underline"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div className="flex justify-end p-2">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
          <Button
            type="submit"
            variant="azul_escuro"
            className="w-full text-lg py-3 active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

Login.pageName = "Login";
Login.layout = "public";