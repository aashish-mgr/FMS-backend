import { z } from "zod";


export const createIncomeSchema = z.object({
  transactionDate: z.coerce.date({ message: "Please provide all the details" }),
  amount: z.coerce.number({ message: "Please provide all the details" }),
  incomeCategoryId: z.string({ message: "Please provide all the details" }).uuid({ message: "Please provide a valid income category id" }),
  paymentMethod: z.string({ message: "Please provide all the details" }).min(1),
  incomeSource: z.string().optional(),
  clientName: z.string().optional(),
  referenceNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  description: z.string().optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
