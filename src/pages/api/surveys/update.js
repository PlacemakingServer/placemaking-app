import { parse } from "cookie";

const handler = async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const {
      survey_id,
      survey_type,
      title,
      description,
      lat,
      long,
      location_title,
      research_id
    } = req.body;

    const missingFields = checkMissingFields({
      survey_id,
      survey_type,
      title,
      description,
      lat,
      long,
      location_title,
      research_id,
    });

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Os campos são obrigatórios: ${missingFields.join(', ')}` });
    }

    const response = await fetch(`${process.env.SERVER_URL}/survey/${survey_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        survey_type,
        title,
        description,
        lat,
        long,
        location_title,
        research_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("Erro ao atualizar o survey:", err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
};

const checkMissingFields = (dataObj) => {
  const requiredFields = [
    "survey_id",
    "survey_type",
    "title",
    "description",
    "lat",
    "long",
    "location_title",
    "research_id"
  ];

  return requiredFields.filter((field) => !dataObj[field]);
};

export default handler;
