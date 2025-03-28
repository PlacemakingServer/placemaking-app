import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { code } = req.body;

  try {
    const response = await fetch(`${process.env.SERVER_URL}/auth/validate_code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: code }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const { token, expires_at } = data.access_token;

    const expiresDate = new Date(expires_at);

    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresDate,
      })
    );

    return res.status(200).json(data);

  } catch (err) {
    console.error("[verify-code]", err);
    return res.status(500).json({ message: "Erro ao verificar código" });
  }
}
