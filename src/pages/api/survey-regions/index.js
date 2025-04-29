// src/pages/api/survey-regions/index.js
import { parse } from "cookie";

export default async function handler(req, res) {
  const baseUrl = `${process.env.SERVER_URL}/survey`;
  const { survey_id, id } = req.query;
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  if (req.method === "GET") {
    try {
      const url = `${baseUrl}/${survey_id}/region`;
      const response = await fetch(url, {
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
      return res.status(200).json(data.regions);
    } catch (err) {
      console.error("Erro ao buscar regiões:", err);
      return res.status(500).json({ error: "Erro ao buscar regiões" });
    }
  }

  if (req.method === "POST") {
    const { name, lat, long, location_title, survey_type } = req.body;
    try {
      const url = `${baseUrl}/${survey_id}/region?survey_type=${survey_type}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          lat,
          long,
          location_title,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      return res.status(201).json(data.region);
    } catch (err) {
      console.error("Erro ao criar região:", err);
      return res.status(500).json({ error: "Erro ao criar região" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const url = `${baseUrl}/${survey_id}/region/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro ao deletar região:", err);
      return res.status(500).json({ error: "Erro ao deletar região" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
