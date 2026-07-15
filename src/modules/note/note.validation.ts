import {z} from "zod";

export const createNoteSchema = z.object({
    title: z.string({message: "please provide all the details"}).min(1).max(255),
    description: z.string({message: "please provide all the details"}).min(1),
    colorLabel: z.string().optional(),
    isPinned: z.boolean().optional().default(false),
    isArchived: z.boolean().optional().default(false),
    createdBy: z.string().uuid(),

})

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>