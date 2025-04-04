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

    const { survey_id, survey_type } = req.body;
    if (!survey_id || !survey_type) {
      return res
        .status(400)
        .json({ error: "survey_id e survey_type são obrigatórios" });
    }
    const response = await fetch(
      `${process.env.SERVER_URL}/survey/${survey_id}/contributors`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          survey_type: survey_type,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
    const data = await response.json();
    if (!data) {
      return res.status(404).json({ error: "Nenhum dado encontrado" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Erro ao buscar activity_types:", err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
};

export default handler;
