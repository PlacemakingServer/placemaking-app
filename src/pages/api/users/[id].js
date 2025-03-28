export default async function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { id } = req.query;
  
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Token não encontrado" });
  
    try {
      const response = await fetch(`${process.env.SERVER_URL}/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || "Erro ao buscar usuário" });
      }
  
      return res.status(200).json({ user: data });
    } catch (err) {
      console.error("[GET /api/users/[id]]", err);
      return res.status(500).json({ error: "Erro interno ao buscar usuário" });
    }
  }
  