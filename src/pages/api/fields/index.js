// pages/api/fields/index.js
import { parse } from "cookie";

export default async function handler(req, res) {
  const { method, query, body } = req;
  const { survey_id, survey_type, field_id } = query;

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token || "";
  const SERVER_URL = process.env.SERVER_URL;
  const baseURL = `${SERVER_URL}/survey/${survey_id}/fields`;

  try {
    switch (method) {

      case "GET": {
        console.log("urllll-", baseURL)
        const response = await fetch(`${baseURL}?survey_type=${survey_type}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();  
        return res.status(response.status).json(data.fields);
      }

      case "POST": {
        console.log("Creating field with body:", body);
        const response = await fetch(`${baseURL}?survey_type=${survey_type}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        return res.status(response.status).json(data.field);
      }

      case "PUT": {
        if (!field_id) {
          return res.status(400).json({ error: "field_id é obrigatório para PUT" });
        }

        console.log("Updating field with ID:", field_id, "and body:", body);

        const response = await fetch(`${baseURL}/${field_id}?survey_type=${survey_type}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case "DELETE": {
        if (!field_id) {
          return res.status(400).json({ error: "field_id é obrigatório para DELETE" });
        }
        const response = await fetch(`${baseURL}/${field_id}?survey_type=${survey_type}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      default:
        return res.status(405).json({ error: `Método ${method} não permitido.` });
    }
  } catch (error) {
    console.error("[API][fields] Erro:", error);
    return res.status(500).json({ error: "Erro interno no proxy de fields." });
  }
}
