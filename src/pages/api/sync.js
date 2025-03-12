// pages/api/sync.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { names } = req.body;

    if (!names || !Array.isArray(names)) {
      console.error("Erro: 'names' não é um array válido:", names);
      return res.status(400).json({ message: 'Dados inválidos: "names" deve ser array' });
    }

    try {
      const { data, error } = await supabase
        .from('names')
        .insert(names.map((name) => ({ name })));

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        return res.status(500).json({ message: 'Erro ao salvar no Supabase', error });
      }

      return res.status(200).json({ message: 'Nomes sincronizados com sucesso', data });
    } catch (err) {
      console.error("Exceção ao inserir dados no Supabase:", err);
      return res.status(500).json({ message: 'Erro de servidor', error: err });
    }
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('names')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error("Erro ao buscar dados do Supabase:", error);
        return res.status(500).json({ message: 'Erro ao buscar dados do Supabase', error });
      }

      return res.status(200).json(data);
    } catch (err) {
      console.error("Exceção ao buscar dados do Supabase:", err);
      return res.status(500).json({ message: 'Erro de servidor', error: err });
    }
  }

  // Caso o método não seja GET ou POST
  return res.status(405).json({ message: 'Método não permitido' });
}
