// pages/api/researchs/[id].js

import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const {
    query: { id },
  } = req;

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const BASE_URL = process.env.SERVER_URL || "http://localhost:8000";

  try {
    // Fetch da pesquisa
    const researchRes = await fetch(`${BASE_URL}/research/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const researchData = await researchRes.json();

    if (!researchRes.ok) {
      return res.status(researchRes.status).json({
        error: "Erro ao buscar dados da pesquisa",
        details: researchData,
      });
    }

    const contributorsRes = await fetch(`${BASE_URL}/research/${id}/contributors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contributorsData = await contributorsRes.json();

    if (!contributorsRes.ok) {
      return res.status(contributorsRes.status).json({
        error: "Erro ao buscar colaboradores",
        details: contributorsData,
      });
    }

    return res.status(200).json({
      research: researchData.research,
      contributors: contributorsData.contributors,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
