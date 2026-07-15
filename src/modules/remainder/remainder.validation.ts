import {z} from "zod";

const PRIORITY = ["LOW","MEDIUM","HIGH"] as const;
export const STATUS = ["PENDING","COMPLETED"] as const
const REPEAT = ["NONE","DAILY","WEEKLY","MONTHLY","YEARLY"] as const

export const createRemainderSchema = z.object({
    title: z.string({message: "please provide all the details"}).min(1).max(255),
    description: z.string({message: "please provide all the details"}).min(1).optional(),
    remainderDate: z.coerce.date({ message: "Please provide all the details" }),
    remainderTime: z.string().optional(),
    priority: z.enum(PRIORITY),
    status: z.enum(STATUS).default(STATUS[1]),
    repeat: z.enum(REPEAT).default(REPEAT[0]).optional(),
    createdBy: z.string().uuid().optional(),

})

export const updateRemainderSchema = createRemainderSchema.partial();

export type CreateRemainderInput = z.infer<typeof createRemainderSchema>
export type UpdateRemainderInput = z.infer<typeof updateRemainderSchema>