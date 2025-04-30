// src/pages/api/survey-time-ranges/index.js
import { parse } from "cookie";

/**
 * Rotas Go ⇄ Frontend
 *  GET    /survey/:surveyId/time-range                 → listar faixas
 *  POST   /survey/:surveyId/time-range?survey_type=..  → criar faixa
 *  DELETE /survey/:surveyId/time-range/:id             → deletar faixa
 *
 * O cookie token (Bearer) é encaminhado em todas as requisições.
 */
export default async function handler(req, res) {
  const { survey_id, id } = req.query;         // id == time-rangeId (DELETE)
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  if (!survey_id) {
    return res.status(400).json({ error: "survey_id é obrigatório" });
  }

  const baseUrl = `${process.env.SERVER_URL}/survey/${survey_id}/time`;

  // ---------- LISTAR ----------
  if (req.method === "GET") {
    try {
      const resp = await fetch(baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      if (!resp.ok) return res.status(resp.status).json(json);
      // o controller devolve em survey_times[]  :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
      return res.status(200).json(json.survey_times ?? json);
    } catch (err) {
      console.error("GET time-ranges:", err);
      return res.status(500).json({ error: "Erro ao buscar faixas de horário" });
    }
  }

  // ---------- CRIAR ----------
  if (req.method === "POST") {
    const { start_time, end_time, survey_type } = req.body;
    if (!start_time || !end_time || !survey_type) {
      return res.status(400).json({ error: "start_time, end_time e survey_type são obrigatórios" });
    }

    try {
      const url = `${baseUrl}?survey_type=${encodeURIComponent(survey_type)}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ start_time, end_time }),
      });
      const json = await resp.json();
      if (!resp.ok) return res.status(resp.status).json(json);
      // o controller devolve em survey_time {}  :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}
      return res.status(201).json(json.survey_time ?? json);
    } catch (err) {
      console.error("POST time-ranges:", err);
      return res.status(500).json({ error: "Erro ao criar faixa de horário" });
    }
  }

  // ---------- DELETAR ----------
  if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "id do time-range ausente" });

    try {
      const resp = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await resp.json();
      if (!resp.ok) return res.status(resp.status).json(json);
      return res.status(200).json(json);
    } catch (err) {
      console.error("DELETE time-ranges:", err);
      return res.status(500).json({ error: "Erro ao deletar faixa de horário" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
