import { prisma } from "../../config/database";
import { CreateIncomeInput, UpdateIncomeInput } from "./income.validation";
import { httpError } from "../../utils/httpError";

export function removeUndefinedFields<T extends object>(data: T | null | undefined) {
  if (!data || typeof data !== "object") {
    return {} as { [K in keyof T]-?: Exclude<T[K], undefined> };
  }

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as { [K in keyof T]-?: Exclude<T[K], undefined> };
}

class IncomeService {
  async create(data: CreateIncomeInput, tenantId: string) {
    const existingCategory = await prisma.incomeCategory.findFirst({
      where: { id: data.incomeCategoryId, tenantId },
      select: { id: true },
    });

    if (!existingCategory) {
      throw httpError("Selected income category does not exist", 400);
    }

    try {
      return await prisma.income.create({
        data: { ...removeUndefinedFields(data), tenantId },
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2003"
      ) {
        throw httpError("Selected income category does not exist", 400);
      }

      throw error;
    }
  }

  findAll(tenantId: string) {
    return prisma.income.findMany({ where: { tenantId, deletedAt: null } });
  }

  findById(id: string, tenantId: string) {
    return prisma.income.findFirst({ where: { id, tenantId, deletedAt: null } });
  }

  async update(
    id: string,
    tenantId: string,
    data: UpdateIncomeInput | null | undefined,
  ) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    const sanitizedData = removeUndefinedFields(data);
    // Ownership is assigned from the authenticated user, never from the body.
    delete (sanitizedData as { createdBy?: unknown }).createdBy;
    if (Object.keys(sanitizedData).length === 0) {
      return existing;
    }

    if (sanitizedData.incomeCategoryId) {
      const category = await prisma.incomeCategory.findFirst({
        where: { id: sanitizedData.incomeCategoryId, tenantId },
        select: { id: true },
      });
      if (!category) {
        throw httpError("Selected income category does not exist", 400);
      }
    }

    return prisma.income.update({ where: { id }, data: sanitizedData });
  }

  async softDelete(id: string, tenantId: string) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    return prisma.income.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default new IncomeService();
