import {z} from "zod"

export const createExpenseSchema = z.object({
  transactionDate: z.coerce.date({ message: "Please provide all the details" }),
  amount: z.coerce.number({ message: "Please provide all the details" }),
  expenseCategoryId: z.string({ message: "Please provide all the details" }).min(1),
  paymentMethod: z.string({ message: "Please provide all the details" }).min(1),
  vendorName: z.string().optional(),
  billNumber: z.string().optional(),
  description: z.string().optional(),
})

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema >;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;