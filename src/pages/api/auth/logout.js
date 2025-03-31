import { serialize, parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    res.setHeader("Set-Cookie", serialize("token", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }));
    return res.status(401).json({ message: "Token não encontrado" });
  }

  try {
    const response = await fetch(`${process.env.SERVER_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Erro ao fazer logout no servidor:", await response.text());
    }
  } catch (error) {
    console.error("Erro de conexão com o servidor:", error);
  }

  res.setHeader("Set-Cookie", serialize("token", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }));

  return res.status(200).json({ message: "Logout realizado com sucesso" });
}
