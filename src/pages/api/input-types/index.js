
import { parse } from "cookie";
export default async function handler(req, res) {
  
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const response = await fetch(`${process.env.SERVER_URL}/input_types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });


    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data.input_types);

  } catch (err) {
    console.error("Erro ao buscar input_types:", err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
}
