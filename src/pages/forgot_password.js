"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://seu-backend.com/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao enviar email");
      }

      setSubmitted(true);
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

        <h1 className="text-2xl font-bold mb-6 text-center">Recuperar Senha</h1>

        {submitted ? (
          <p className="text-green-600 text-center">
            Se o email estiver cadastrado, você receberá instruções em breve.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
                required
              />
            </div>

            <Button
              type="submit"
              variant="danger"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}