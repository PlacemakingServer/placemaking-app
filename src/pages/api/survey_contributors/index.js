import { parse } from "cookie";

const handler = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const { survey_id } = req.query;
    if (!survey_id) {
      return res.status(400).json({ error: "o survey_id é obrigatório" });
    }
    const response = await fetch(
      `${process.env.SERVER_URL}/survey/${survey_id}/contributors`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (!data) {
      return res.status(404).json({ error: "Nenhum dado encontrado" });
    }

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    return res.status(200).json(data.contributors);
  } catch (err) {
    console.error("Erro ao buscar survey_contributors:", err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
};

export default handler;
