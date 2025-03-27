import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Obtém o token do cookie
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const {
      title,
      description,
      release_date,
      created_by,
      research_type,
      research_time,
      gap_by_research_time,
    } = req.body;

    // Validação básica dos campos obrigatórios
    if (!title || !description || !release_date || !created_by || !research_type) {
      return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    // Envia a requisição para o backend para criar a pesquisa
    const response = await fetch(`${process.env.SERVER_URL}/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        release_date,
        created_by,
        research_type,
        research_time,
        gap_by_research_time,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(201).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
}
