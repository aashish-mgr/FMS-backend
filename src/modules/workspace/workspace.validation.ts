import { z } from "zod";

const workspaceSettingsSchema = z
  .object({
    currency: z.string().trim().min(1, "currency is required").max(10).optional(),
    timezone: z.string().trim().min(1, "timezone is required").max(100).optional(),
  })
  .strict();

export const updateWorkspaceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "workspace name must be at least 2 characters")
      .max(255, "workspace name is too long")
      .optional(),
    settings: workspaceSettingsSchema.optional(),
  })
  .refine((value) => value.name !== undefined || value.settings !== undefined, {
    message: "at least one workspace field is required",
  });

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
