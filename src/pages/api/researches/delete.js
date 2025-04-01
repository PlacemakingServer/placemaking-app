// deleteResearch.js

import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Obtém o token do cookie
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID é obrigatório para deletar a pesquisa." });
    }

    // Envia a requisição para o backend para deletar a pesquisa
    const response = await fetch(`${process.env.SERVER_URL}/research/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    return res.status(200).json({ message: "Pesquisa deletada com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
}
