import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMessage } from "@/context/MessageContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";


export default function ValidateCode() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const { showMessage } = useMessage();
  const { isLoading, setIsLoading } = useLoading();
  const router = useRouter();
  const { saveCredentials, saveUserInfo } = useAuth();
  

  useEffect(() => {
    const storedEmail = localStorage.getItem("recover_email");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await fetch("/api/auth/validate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Código inválido");
      }
  
      const { token, token_type, expires_at } = data.access_token;
  
      await saveCredentials({
        access_token: token,
        token_type,
        expires_at,
      });
  
      await saveUserInfo(data.user);
  
      showMessage(data.message, "verde");
      router.push("/profile");
  
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 7000);
      console.error("[handleSubmit]", err);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleResend = async () => {
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
        throw new Error(data.message || "Erro ao reenviar código");
      }

      showMessage("Código reenviado com sucesso!", "verde");
    } catch (err) {
      showMessage(err.message, "vermelho_claro", 7000);
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

        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
          Verificar Código
        </h2>

        {email && (
          <p className="text-sm text-gray-600 text-center mb-4">
            Código enviado para: <span className="font-medium">{email}</span>. Verifique na caixa de spam ou na lixeira.
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Código de Verificação
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              className="mt-1 block w-full px-4 py-3 text-lg tracking-widest text-center border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="XXXXXXXX"
              required
            />
          </div>
          <Button
            type="submit"
            variant="azul_escuro"
            className="w-full text-lg py-3 active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? "Verificando..." : "Verificar"}
          </Button>

          <Button
            type="button"
            variant="azul_claro"
            className="w-full text-bg py-2 mt-2"
            onClick={handleResend}
          >
            Reenviar código
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

ValidateCode.pageName = "Verificar Código";
ValidateCode.layout = "public";
