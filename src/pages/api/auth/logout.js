import { serialize } from "cookie";

export default function handler(req, res) {
  res.setHeader("Set-Cookie", serialize("token", "", {
    path: "/",
    expires: new Date(0),
  }));
  res.status(200).json({ message: "Logout realizado com sucesso" });
}
