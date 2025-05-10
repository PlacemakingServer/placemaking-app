// pages/api/survey-answers/index.js
export default async function handler(req, res) {

  if (req.method === 'POST') {
    const {
      survey_id,
      survey_type,
      contributor_id,
      answers
    } = req.body;

    if (!survey_id || !survey_type || !contributor_id || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Payload inválido' });
    }

    const url = new URL(`${process.env.API_BASE_URL}/survey/${survey_id}/answers`);
    url.searchParams.set('survey_type', survey_type);
    url.searchParams.set('contributor_id', contributor_id);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers), // só o array de answers
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err) {
      console.error('Erro ao criar resposta da survey:', err);
      return res.status(500).json({ error: 'Erro ao criar resposta da survey' });
    }
  }

  // opcionalmente mantenha GET se precisar
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/survey-answers`);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      console.error('Erro ao buscar respostas da survey:', err);
      return res.status(500).json({ error: 'Erro ao buscar respostas da survey' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
