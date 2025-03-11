import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const filePath = path.resolve('./public/names.json');
    
    const existingData = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : [];

    const newData = [...existingData, ...req.body.names];

    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));

    res.status(200).json({ message: 'Dados sincronizados com sucesso' });
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
