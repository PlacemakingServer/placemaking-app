import { parse } from "cookie";

const BASE_URL = process.env.SERVER_URL;

async function createResearch(researchData, token) {
  const researchRes = await fetch(`${BASE_URL}/research`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(researchData),
  });

  const data = await researchRes.json();

  if (!researchRes.ok) {
    throw {
      status: researchRes.status,
      message: "Erro ao criar a pesquisa",
      details: data,
    };
  }

  return data.research;
}

async function addCollaborator(researchId, collaboratorId, token) {
  const contributorRes = await fetch(
    `${BASE_URL}/research/${researchId}/contributors/${collaboratorId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ instruction: "Pesquisador" }),
    }
  );

  const data = await contributorRes.json();

  if (!contributorRes.ok) {
    throw {
      status: contributorRes.status,
      message: `Erro ao adicionar colaborador`,
      details: data,
    };
  }

  return data.user;
}

async function addCollaborators(researchId, collaborators, token) {
  const contributors = [];
  
  for (const collaborator of collaborators) {
    try {
      const contributor = await addCollaborator(researchId, collaborator.id, token);
      contributors.push(contributor);
    } catch (error) {
      throw {
        ...error,
        message: `Erro ao adicionar colaborador ${collaborator.label}`,
      };
    }
  }

  return contributors;
}

function validateRequest(req) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    throw {
      status: 401,
      message: "Token não fornecido",
    };
  }

  const created_by = req.headers["x-user-id"] || req.body.created_by;

  if (!created_by) {
    throw {
      status: 400,
      message: "ID do criador não fornecido.",
    };
  }

  return { token, created_by };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { token, created_by } = validateRequest(req);

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

    var research = await createResearch(researchPayload, token);
    var contributors = await addCollaborators(research.id, collaborators, token);

    research.contributors = contributors;

    return res.status(201).json({
      message: "Pesquisa criada e colaboradores adicionados com sucesso!",
      research,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(error.status || 500).json({
      error: error.message || "Erro interno no servidor",
      details: error.details,
    });
  }
}




