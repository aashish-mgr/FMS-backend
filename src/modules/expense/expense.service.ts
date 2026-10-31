import { CreateExpenseInput, UpdateExpenseInput } from "./expense.validation";
import { httpError } from "../../utils/httpError";
import { prisma } from "../../config/database";

function removeUndefinedFields<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as { [K in keyof T]-?: Exclude<T[K], undefined> };
}

class ExpenseService {
  async create(data: CreateExpenseInput, tenantId: string) {
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: { id: data.expenseCategoryId, tenantId },
      select: { id: true },
    });

    if (!existingCategory) {
      throw httpError("Selected expense category does not exist", 400);
    }

    try {
      return await prisma.expense.create({
        data: { ...removeUndefinedFields(data), tenantId },
      });
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

  async findAll(tenantId: string) {
    return prisma.expense.findMany({ where: { tenantId, deletedAt: null } });
  }

  async findById(id: string, tenantId: string) {
    return prisma.expense.findFirst({ where: { id, tenantId, deletedAt: null } });
  }

  async update(id: string, tenantId: string, data: UpdateExpenseInput) {
    const existing = await this.findById(id, tenantId);
    if (!existing) {
      return null;
    }

    const sanitizedData = removeUndefinedFields(data);
    // Ownership is assigned from the authenticated user, never from the body.
    delete (sanitizedData as { createdBy?: unknown }).createdBy;

    if (sanitizedData.expenseCategoryId) {
      const category = await prisma.expenseCategory.findFirst({
        where: { id: sanitizedData.expenseCategoryId, tenantId },
        select: { id: true },
      });
      if (!category) {
        throw httpError("Selected expense category does not exist", 400);
      }
    }

    return prisma.expense.update({ where: { id }, data: sanitizedData });
  }

  async softDelete(id: string, tenantId: string) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    return prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default new ExpenseService();
