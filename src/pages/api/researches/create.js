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
      location_title
    } = req.body;

    const researchPayload = {
      title,
      description,
      release_date: release_date,
      end_date: end_date,
      lat,
      long,
      location_title,
      created_by,
    };

    var research = await createResearch(researchPayload, token);

    return res.status(201).json(
      research,
    );
  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(error.status || 500).json({
      error: error.message || "Erro interno no servidor",
      details: error.details,
    });
  }
}




