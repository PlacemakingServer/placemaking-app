import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  if (req.method === "GET") {
    try {
      const response = await fetch(`${process.env.SERVER_URL}/research/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data?.researches || []);
    } catch (err) {
      console.error("Erro ao buscar pesquisas:", err);
      return res.status(500).json({ error: "Erro ao conectar com o servidor" });
    }
  }

  // Caso o método seja POST, cria uma nova pesquisa
  if (req.method === "POST") {
    const { titulo, descricao, data_criacao } = req.body;

    if (!titulo || !descricao || !data_criacao) {
      return res.status(400).json({ error: "Dados inválidos: título, descrição e data_criacao são obrigatórios" });
    }

    try {
      const response = await fetch(`${process.env.SERVER_URL}/research/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          descricao,
          data_criacao,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      return res.status(201).json(data);
    } catch (err) {
      console.error("Erro ao criar pesquisa:", err);
      return res.status(500).json({ error: "Erro ao conectar com o servidor" });
    }
  }
}
