import { Request,Response } from "express";
import { CreateExpenseInput, createExpenseSchema, UpdateExpenseInput } from "./expense.validation";
import { httpError } from "../../utils/httpError";

import { prisma } from "../../config/database";

function removeUndefinedFields<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as { [K in keyof T]-?: Exclude<T[K], undefined> };
}

class ExpenseService {
    
       async create(data: CreateExpenseInput) {
           const existingCategory = await prisma.expenseCategory.findUnique({
             where: { id: data.expenseCategoryId },
             select: { id: true },
           });
       
           if (!existingCategory) {
             throw httpError("Selected expense category does not exist", 400);
           }
       
           try {
             return await prisma.expense.create({ data: removeUndefinedFields(data) });
           } catch (error: unknown) {
             if (
               typeof error === "object" &&
               error !== null &&
               "code" in error &&
               (error as { code?: string }).code === "P2003"
             ) {
               throw httpError("Selected expense category does not exist", 400);
             }
       
             throw error;
           }
         }
    

    async findAll() {
        return prisma.expense.findMany({where: {deletedAt: null}});
    }

    async findById(id: string) {
        
        return prisma.expense.findFirst({where: {id, deletedAt: null}});
    }

    async update(data: UpdateExpenseInput,id: string) {
        const existing = prisma.expense.findFirst({where: {id}});
        if(!existing) {
            return null;
        }
        return prisma.expense.update({data: removeUndefinedFields(data), where: {id, deletedAt: null}})
    }

  async softDelete(id: string) {
   const existing = prisma.expense.findFirst({where: {id}});
    if (!existing) return null;

    return prisma.income.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default new ExpenseService()