// pages/api/survey/answers/batch.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Método não permitido' });
    }
  
    try {
      const { answers } = req.body;
  
      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: 'Formato de dados inválido' });
      }

    try {
        const cookies = parse(req.headers.cookie || "");
        const token = cookies.token;
    
        if (!token) {
        return res.status(401).json({ error: "Token não fornecido" });
        }
    } catch (error) {
        console.error('Erro ao processar cookies:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
      
  
      // Validar cada resposta
      for (const answer of answers) {
        const { field_id, value, survey_id, survey_type, contributor_id, survey_group_id } = answer;
        
        if (!field_id || !survey_id || !survey_type || !contributor_id || !survey_group_id) {
          return res.status(400).json({ 
            message: 'Dados incompletos em uma ou mais respostas',
            invalid: answer 
          });
        }
      }
  
      // Processar todas as respostas em paralelo
      const results = await Promise.all(
        answers.map(async (answer) => {
          const { field_id, value, survey_id, survey_type, contributor_id, survey_group_id } = answer;
          
          const response = await fetch(`${process.env.SERVER_URL}/survey/${survey_id}/answer`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
              field_id,
              value,
              survey_id,
              survey_type,
              contributor_id,
              survey_group_id
            })
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao processar resposta para campo ${field_id}: ${errorData.message}`);
          }
  
          return await response.json();
        })
      );
  
      return res.status(200).json({ 
        success: true, 
        message: 'Todas as respostas foram processadas com sucesso',
        results 
      });
      
    } catch (error) {
      console.error('Erro ao processar respostas em lote:', error);
      return res.status(500).json({ 
        success: false,
        message: error.message || 'Erro interno do servidor ao processar respostas' 
      });
    }
  }