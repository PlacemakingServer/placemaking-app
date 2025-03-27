
import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID do usuário não fornecido" });
  }

  try {
    const response = await fetch(`${process.env.SERVER_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("[delete]", err);
    return res.status(500).json({ error: "Erro ao deletar usuário" });
  }
}
