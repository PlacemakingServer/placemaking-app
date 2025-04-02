import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const {
      title,
      description,
      release_date,
      end_date,
      lat,
      long,
      location_title,
      collaborators,
    } = req.body;

    const BASE_URL = process.env.SERVER_URL || "http://localhost:8000";

    const created_by = req.headers["x-user-id"] || req.body.created_by;

    if (!created_by) {
      return res.status(400).json({ error: "ID do criador não fornecido." });
    }

    const researchPayload = {
      title,
      description,
      release_date: `${release_date}T12:00:00`,
      end_date: `${end_date}T12:00:00`,
      lat,
      long,
      location_title,
      created_by,
    };


    const researchRes = await fetch(`${BASE_URL}/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(researchPayload),
    });

    const researchData = await researchRes.json();

    if (!researchRes.ok) {
      return res.status(researchRes.status).json({
        error: "Erro ao criar a pesquisa",
        details: researchData,
      });
    }

    const researchId = researchData.research.id;
    const contributors = [];

    for (const collaborator of collaborators) {
      const contributorRes = await fetch(
        `${BASE_URL}/research/${researchId}/contributors/${collaborator.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ instruction: "Pesquisador" }),
        }
      );

      const contributorData = await contributorRes.json();

      if (!contributorRes.ok) {
        return res.status(contributorRes.status).json({
          error: `Erro ao adicionar colaborador ${collaborator.label}`,
          details: contributorData,
        });
      }

      contributors.push(contributorData.contributor);
    }

    return res.status(201).json({
      message: "Pesquisa e colaboradores criados com sucesso!",
      research: researchData.research,
      contributors,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
