// pages/api/fields/index.js
import cookie from "cookie";

export default async function handler(req, res) {
  const { method, query } = req;
  const { survey_id, survey_type, field_id } = query;
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || "";
  const SERVER_URL = process.env.SERVER_URL;
  const baseURL = `${SERVER_URL}/api/v1/surveys/${survey_id}/fields`;

  try {
    switch (method) {
      case "GET": {
        const response = await fetch(`${baseURL}?survey_type=${survey_type}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case "POST": {
        const response = await fetch(`${baseURL}?survey_type=${survey_type}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case "PUT": {
        if (!field_id)
          return res.status(400).json({ error: "field_id é obrigatório para PUT" });

        const response = await fetch(`${baseURL}/${field_id}?survey_type=${survey_type}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case "DELETE": {
        if (!field_id)
          return res.status(400).json({ error: "field_id é obrigatório para DELETE" });

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
  } catch (err) {
    console.error("[API][fields] erro:", err);
    return res.status(500).json({ error: "Erro interno no proxy de fields." });
  }
}
