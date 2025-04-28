import { parse } from "cookie";

async function updateResearch(token, researchId, researchData) {
  const response = await fetch(
    `${process.env.SERVER_URL}/research/${researchId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(researchData),
    }
  );
  return response;
}


export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    console.log("------------------");
    console.log(req.body);
    console.log("------------------");


    const {
      id,
      title,
      description,
      release_date,
      end_date,
      lat,
      long,
      location_title, 
      status
    } = req.body;

    if (
      !id ||
      !title ||
      !description ||
      !release_date ||
      !lat ||
      !long ||
      !location_title
    ) {
      return res
        .status(400)
        .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    const researchData = {
      title,
      description,
      release_date,
      end_date,
      lat,
      long,
      location_title,
      status
    };

  
    const updateResponse = await updateResearch(token, id, researchData);
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      return res.status(updateResponse.status).json(errorData);
    }
    const updatedResearch = await updateResponse.json();

    return res.status(200).json(updatedResearch);
  } catch (err) {
    console.error("Erro no handler:", err);
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
}
