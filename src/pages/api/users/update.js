
import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const { id, name, email, role, status } = req.body;

  try {
    const response = await fetch(`${process.env.SERVER_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, role, status }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }


    return res.status(200).json(data);
  } catch (err) {

    console.error("[update]", err);
    return res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
}
