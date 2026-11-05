import { z } from "zod";

export const loginSchema = z.object({
  userEmail: z
    .string()
    .trim()
    .min(1, "userEmail is required")
    .email()
    .transform((value) => value.toLowerCase()),
  userPassword: z.string().min(1, "userPassword is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, "workspaceName must be at least 2 characters")
    .max(255, "workspaceName is too long"),
  userName: z
    .string()
    .trim()
    .min(1, "userName is required")
    .max(255, "userName is too long"),
  userEmail: z
    .string()
    .trim()
    .email("userEmail must be a valid email")
    .max(255)
    .transform((value) => value.toLowerCase()),
  userPassword: z
    .string()
    .min(8, "userPassword must be at least 8 characters")
    .max(72, "userPassword must be at most 72 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const acceptInvitationSchema = z.object({
  token: z
    .string()
    .trim()
    .min(32, "invitation token is required")
    .max(255, "invitation token is invalid"),
  userName: z
    .string()
    .trim()
    .min(1, "userName is required")
    .max(255, "userName is too long"),
  userPassword: z
    .string()
    .min(8, "userPassword must be at least 8 characters")
    .max(72, "userPassword must be at most 72 characters"),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

export const forgotPasswordSchema = z.object({
  userEmail: z
    .string()
    .trim()
    .min(1, "userEmail is required")
    .email("userEmail must be a valid email")
    .max(255)
    .transform((value) => value.toLowerCase()),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(32, "reset token is required")
    .max(255, "reset token is invalid"),
  userPassword: z
    .string()
    .min(8, "userPassword must be at least 8 characters")
    .max(72, "userPassword must be at most 72 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "currentPassword is required"),
  newPassword: z
    .string()
    .min(8, "newPassword must be at least 8 characters")
    .max(72, "newPassword must be at most 72 characters"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .trim()
    .min(32, "verification token is required")
    .max(255, "verification token is invalid"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
