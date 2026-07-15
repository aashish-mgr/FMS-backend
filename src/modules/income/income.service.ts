import { prisma } from "../../config/database";
import { CreateIncomeInput, UpdateIncomeInput } from "./income.validation";
import { httpError } from "../../utils/httpError";

function removeUndefinedFields<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as { [K in keyof T]-?: Exclude<T[K], undefined> };
}



class IncomeService {
  async create(data: CreateIncomeInput) {
    const existingCategory = await prisma.incomeCategory.findUnique({
      where: { id: data.incomeCategoryId },
      select: { id: true },
    });

    if (!existingCategory) {
      throw httpError("Selected income category does not exist", 400);
    }

    try {
      return await prisma.income.create({ data: removeUndefinedFields(data) });
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

  findAll() {
    return prisma.income.findMany({ where: { deletedAt: null } });
  }

  findById(id: string) {
    return prisma.income.findFirst({ where: { id, deletedAt: null } });
  }

  async update(id: string, data: UpdateIncomeInput) {

    const existing = await this.findById(id);
    if (!existing) return null;

    return prisma.income.update({ where: { id }, data: removeUndefinedFields(data) });
  }

  async softDelete(id: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    return prisma.income.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default new IncomeService();
