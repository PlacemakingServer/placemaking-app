import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Obtém o token do cookie
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    // Envia a requisição para o backend para pegar os tipos de pesquisa
    const response = await fetch(`${process.env.SERVER_URL}/research/types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Inclui o token no cabeçalho
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();

    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
}
