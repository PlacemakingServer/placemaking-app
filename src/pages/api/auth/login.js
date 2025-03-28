import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const response = await fetch(`${process.env.SERVER_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();

    const expiresDate = new Date(data.access_token.expires_at);
    res.setHeader(
      "Set-Cookie",
      serialize("token", data.access_token.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresDate,
      })
    );


    return res.status(200).json(data);

  } catch (err) {
    console.error("[Login Error]", err);
    return res
      .status(500)
      .json({ error: "Erro ao conectar com o servidor de autenticação." });
  }
}
