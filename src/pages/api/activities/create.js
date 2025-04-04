export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    
    try {
      const { activity_type_id, title, description, activity_time, research_id } = req.body;
      if (!research_id) {
        return res.status(400).json({ error: "research_id não fornecido" });
      }


      if (!activity_type_id || !title) {
          return res
          .status(400)
          .json({ error: "Os campos activity_type_id e title são obrigatórios." });
      }
  
      const url = `${process.env.SERVER_URL}/research/${research_id}/activities`;


      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ activity_type_id, title, description, activity_time })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Erro no handler de criação de atividade:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
  