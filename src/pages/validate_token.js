"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://seu-backend.com/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Código inválido");
      }

      // redireciona para página de redefinir senha
      window.location.href = "/reset-password";

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/icon-512x512.png"
            alt="Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Verifique seu Código</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

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
              className="mt-1 block w-full px-4 py-2 tracking-widest text-center uppercase border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="XXXXXXXX"
              required
            />
          </div>

          <Button
            type="submit"
            variant="danger"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </form>
      </div>
    </div>
  );
}