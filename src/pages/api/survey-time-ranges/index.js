export default async function handler(req, res) {
  const baseUrl = `${process.env.API_BASE_URL}/survey-time-ranges`;

  if (req.method === 'GET') {
    try {
      const response = await fetch(baseUrl);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar faixas de horário' });
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao criar faixa de horário' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
