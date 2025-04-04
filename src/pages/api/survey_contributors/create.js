import { parse } from "cookie";

const handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const { survey_id, survey_type, user_id, instruction } = req.body;
    if (!survey_id || !survey_type || !user_id || !instruction) {
      return res
        .status(400)
        .json({ error: "survey_id e survey_type são obrigatórios" });
    }
    const response = await fetch(
      `${process.env.SERVER_URL}/survey/${survey_id}/contributors`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          survey_type: survey_type,
          user_id: user_id,
          instruction: instruction,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
    const data = await response.json();
    if (!data) {
      return res.status(404).json({ error: "Erro ao adicionar um contribuidor à coleta." });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
};

export default handler;
