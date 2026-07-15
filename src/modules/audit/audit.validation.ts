import {z} from "zod"


const auditSchema = z.object({
    userId: z.string().uuid().nullable(),

})