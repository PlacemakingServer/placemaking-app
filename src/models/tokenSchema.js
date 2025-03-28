import { z } from "zod";

export const TokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_at: z.string(),
});
