import { z } from "zod";

export const loginSchema = z.object({
  userEmail: z.string().min(1, "userEmail is required").email(),
  userPassword: z.string().min(1, "userPassword is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
