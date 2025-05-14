// pages/api/survey-answers/index.js
import { parse } from "cookie";

export default async function handler(req, res) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  if (req.method === "POST") {
    const { survey_id, survey_type, contributor_id, answers } = req.body;

    if (
      !survey_id ||
      !survey_type ||
      !contributor_id ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({ error: "Payload inválido" });
    }

    const url = new URL(
      `${
        process.env.SERVER_URL
      }/survey/${survey_id}/answers?survey_type=${encodeURIComponent(
        survey_type
      )}&contributor_id=${encodeURIComponent(contributor_id)}`
    );

    try {
      const results = [];
      for (const answer of answers) {
        console.log(answer);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(answer), // envia uma answer por vez
        });
        const data = await response.json();
        results.push({ status: response.status, data });
        if (!response.ok) {
          // Se alguma falhar, retorna erro imediatamente
          return res.status(response.status).json(data);
        }
      }
      return res.status(200).json({ results });
    } catch (err) {
      console.error("Erro ao criar resposta da survey:", err);
      return res
        .status(500)
        .json({ error: "Erro ao criar resposta da survey" });
    }
  }

  // opcionalmente mantenha GET se precisar
  if (req.method === "GET") {
    try {
      const response = await fetch(
        `${process.env.API_BASE_URL}/survey-answers`
      );
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro ao buscar respostas da survey:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar respostas da survey" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
