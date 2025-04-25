import { parse } from "cookie";

export default async function handler(req, res) {
  const { entity } = req.query;

  if (!entity)
    return res.status(400).json({ error: "Entity não especificada" });

  const baseURL = `https://placemaking-server-go.vercel.app/api/v1`;
  const url = `${baseURL}/sync/${entity}`;

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    if (req.method === "GET") {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Erro ao buscar ${entity}`);
      const data = await response.json();
      // return res.status(200).json({ [entity]: data });
      return res.status(200).json(data);
    }

    if (req.method === "PATCH") {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(req.body),
      });
      if (!response.ok) throw new Error(`Erro ao sincronizar ${entity}`);
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (error) {
    console.error(`[API SYNC] Erro:`, error);
    return res.status(500).json({ error: "Erro interno ao sincronizar dados" });
  }
}
