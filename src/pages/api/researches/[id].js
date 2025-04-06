import { parse } from "cookie";


const BASE_URL = process.env.SERVER_URL || "http://localhost:8000";

async function fetchWithAuth(url, token) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function getResearchDetails(id, token) {
  const { ok, status, data } = await fetchWithAuth(`${BASE_URL}/research/${id}`, token);
  if (!ok) {
    throw { status, message: "Erro ao buscar dados da pesquisa", details: data };
  }
  return data.research;
}

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

  try {
    const [research] = await Promise.all([
      getResearchDetails(id, token)
    ]);

    return res.status(200).json({research});
  } catch (error) {
    console.error("Erro ao buscar dados da pesquisa:", error);
    return res
      .status(error.status || 500)
      .json({ error: error.message || "Erro interno", details: error.details });
  }
}
