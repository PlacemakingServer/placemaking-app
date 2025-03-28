
import { z } from "zod";

export default passwordSchema = z.object({
    newPassword: z.string(),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
});


