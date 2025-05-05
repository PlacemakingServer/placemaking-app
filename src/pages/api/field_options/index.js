import { parse } from "cookie";

const checkMissingFields = (dataObj, requiredFields) => {
  return requiredFields.filter((field) => !dataObj[field]);
};

export default async function handler(req, res) {
  const { method, query, body } = req;
  const { field_id, option_id } = query;
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token || "";

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const baseURL = `${process.env.SERVER_URL}/fields/${field_id}/options`;

  try {
    switch (method) {
      case "GET": {
        const missing = checkMissingFields({ field_id }, ["field_id"]);
        if (missing.length > 0)
          return res.status(400).json({ error: `Faltam campos: ${missing.join(", ")}` });

        const response = await fetch(baseURL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case "POST": {
        const response = await fetch(baseURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case "PUT": {
        if (!option_id)
          return res.status(400).json({ error: "option_id é obrigatório para PUT" });

        const response = await fetch(`${baseURL}/${option_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case "DELETE": {
        if (!option_id)
          return res.status(400).json({ error: "option_id é obrigatório para DELETE" });

        const response = await fetch(`${baseURL}/${option_id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      default:
        return res.status(405).json({ error: `Método ${method} não permitido.` });
    }
  } catch (err) {
    console.error("[API][field_options] erro:", err);
    return res.status(500).json({ error: "Erro interno ao conectar com o servidor." });
  }
}
