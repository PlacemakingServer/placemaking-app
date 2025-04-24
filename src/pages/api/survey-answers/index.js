export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/survey-answers`);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar respostas da survey' });
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/survey-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao criar resposta da survey' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
