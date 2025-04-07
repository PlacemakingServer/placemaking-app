import { parse } from "cookie";

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    
    const { research_id, survey_type } = req.query;

    const missingFields = checkMissingFields({ research_id, survey_type });
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Os campos são obrigatórios: ${missingFields.join(", ")}`,
      });
    }

    const url = `${process.env.SERVER_URL}/research/${research_id}/surveys?survey_type=${encodeURIComponent(survey_type)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("Erro ao buscar surveys:", err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
};

const checkMissingFields = (dataObj) => {
  const requiredFields = ["research_id", "survey_type"];
  return requiredFields.filter((field) => !dataObj[field]);
};

export default handler;
