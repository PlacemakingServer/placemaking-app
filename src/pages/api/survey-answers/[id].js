import { parse } from "cookie";

export default async function handler(req, res) {
  const { id } = req.query;
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token; // seu JWT

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const base = process.env.SERVER_URL;
  if (!base) {
    console.error('[handler] SERVER_URL não definido!');
    return res.status(500).json({ error: 'Configuração inválida do servidor' });
  }

  const url = `${base}/survey/${id}/answers`;
  console.log('[handler] Chamando URL:', url);

  // Monta os headers incluindo o token, se existir
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const options = {
    method: req.method,
    headers
  };
  if (req.method !== 'GET') {
    options.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(url, options);

    let payload;
    try {
      payload = await response.json();
    } catch (jsonErr) {
      const text = await response.text();
      console.error('[handler] Falha ao parsear JSON:', jsonErr, '— corpo:', text);
      return res.status(response.status).send(text);
    }

    if (!response.ok) {
      console.error('[handler] Resposta não OK:', response.status, payload);
    }

    return res.status(response.status).json(payload);
  } catch (err) {
    console.error('[handler] Erro no fetch:', err);
    return res.status(500).json({ error: err.message || 'Erro ao processar a requisição' });
  }
}
