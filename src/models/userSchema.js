import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "research"]),
  status: z.enum(["active", "inactive"]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
