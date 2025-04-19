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

    
    const {survey_type, title, description, lat, long, location_title, research_id} = req.body;
    let missingFields = checkMissingFields({
      survey_type,
      title,
      description,
      lat,
      long,
      location_title,
      research_id,
    });




    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Os campos são obrigatórios: ${missingFields}` });
    }
    const response = await fetch(
      `${process.env.SERVER_URL}/survey?survey_type=${encodeURIComponent(survey_type)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          description: description,
          lat: lat,
          long: long,
          location_title: location_title,
          research_id: research_id,
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


const checkMissingFields = (dataObj) => {
  const requiredFields = [
    "survey_type", "title", "description", "lat", "long", "location_title", "research_id"
  ];

  return requiredFields.filter((field) => !dataObj[field]);
};

export default handler;
