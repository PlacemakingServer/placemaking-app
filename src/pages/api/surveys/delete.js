import { parse } from 'cookie';
import { json } from 'stream/consumers';

const handler = async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    const data = JSON.parse(req.body);
    const { id, research_id, survey_type } = data;
    const missingFields = checkMissingFields({ id, research_id, survey_type });
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Os campos são obrigatórios: ${missingFields.join(', ')}` });
    }

    const response = await fetch(`${process.env.SERVER_URL}/research/${research_id}/survey/${id}?survey_type=${encodeURIComponent(survey_type)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    return res.status(200).json({ message: 'Survey deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar survey:', err);
    return res.status(500).json({ error: 'Erro ao conectar com o servidor' });
  }
};

const checkMissingFields = (dataObj) => {
  const requiredFields = ['id', 'research_id', 'survey_type'];
  return requiredFields.filter(field => !dataObj[field]);
};

export default handler;
