export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'ID inválido' });

  const url = `${process.env.API_BASE_URL}/survey-answers/${id}`;

  try {
    if (req.method === 'GET') {
      const response = await fetch(url);
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    if (req.method === 'DELETE') {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao processar a requisição' });
  }
}
