export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Não autorizado: token ausente" });
  }

  const { new_password, confirm_password } = req.body;



  if (!new_password || !confirm_password) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios não preenchidos" });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ error: "As senhas não coincidem" });
  }

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/auth/reset_password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_password,
          confirm_password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ message: "Senha atualizada com sucesso!" });
  } catch (err) {
    console.error("Erro ao mudar a senha:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
