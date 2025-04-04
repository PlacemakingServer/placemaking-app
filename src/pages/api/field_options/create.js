import { parse } from "cookie";

const checkMissingFields = (dataObj) => {
  const requiredFields = ["field_id", "option_text", "option_value"];
  return requiredFields.filter((field) => !dataObj[field]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const { field_id, option_text, option_value  } = req.query;
    const missingFields = checkMissingFields({ field_id, option_text, option_value });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Os campos são obrigatórios: ${missingFields.join(", ")}`,
      });
    }

    const url = `${process.env.SERVER_URL}/fields/${field_id}/options`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        option_text,
        option_value,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar com o servidor" });
  }
}
