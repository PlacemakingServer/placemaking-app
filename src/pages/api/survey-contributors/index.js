// src/pages/api/survey-contributors/index.js
import { parse } from "cookie";

export default async function handler(req, res) {
  const baseUrl = `${process.env.SERVER_URL}/survey`;
  const { survey_id, contributor_id } = req.query;
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  if (!survey_id) {
    return res.status(400).json({ error: "survey_id é obrigatório" });
  }

  if (req.method === "GET") {
    try {
      const url = `${baseUrl}/${survey_id}/contributors`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      return res.status(200).json(data.contributors);
    } catch (err) {
      console.error("Erro ao buscar contribuidores:", err);
      return res.status(500).json({ error: "Erro ao buscar contribuidores" });
    }
  }

  if (req.method === "POST") {
    const { survey_type, user_id, instruction } = req.body;

    if (!survey_type || !user_id || !instruction) {
      return res.status(400).json({
        error: "Campos survey_type, user_id e instruction são obrigatórios",
      });
    }

    try {
      const url = `${baseUrl}/${survey_id}/contributors`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          survey_type,
          user_id,
          instruction,
        }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      return res.status(201).json(data.contributor);
    } catch (err) {
      console.error("Erro ao criar colaborador:", err);
      return res.status(500).json({ error: "Erro ao criar colaborador" });
    }
  }

  if (req.method === "DELETE") {
    if (!contributor_id) {
      return res.status(400).json({ error: "contributor_id é obrigatório para deletar" });
    }

    try {
      const url = `${baseUrl}/${survey_id}/contributors/${contributor_id}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro ao deletar colaborador:", err);
      return res.status(500).json({ error: "Erro ao deletar colaborador" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
