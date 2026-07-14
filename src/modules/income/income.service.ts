import { prisma } from "../../config/database";
import { CreateIncomeInput, UpdateIncomeInput } from "./income.validation";

function removeUndefinedFields<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as { [K in keyof T]-?: Exclude<T[K], undefined> };
}

// Every read filters `deletedAt: null` — this is the manual equivalent of
// Sequelize's `paranoid: true`, which Prisma doesn't provide natively.
// Copy this pattern into any future module that needs soft deletes
// (expense, note, reminder all have a deletedAt column ready for it).
class IncomeService {
  create(data: CreateIncomeInput) {
    return prisma.income.create({ data: removeUndefinedFields(data) });
  }

  findAll() {
    return prisma.income.findMany({ where: { deletedAt: null } });
  }

  findById(id: string) {
    return prisma.income.findFirst({ where: { id, deletedAt: null } });
  }

  async update(id: string, data: UpdateIncomeInput) {
    // findFirst + update instead of a blind `update` so a soft-deleted or
    // missing record doesn't throw a raw Prisma "record not found" error.
    const existing = await this.findById(id);
    if (!existing) return null;

    return prisma.income.update({ where: { id }, data: removeUndefinedFields(data) });
  }

  // Completes the `deleteIncome` method, which was left as an incomplete
  // stub (`async deleteIncome` with no body) in the original
  // incomeController.ts. Soft-deletes by setting deletedAt, matching the
  // paranoid-mode behavior used everywhere else in the project.
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
