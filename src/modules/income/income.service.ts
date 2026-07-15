import { prisma } from "../../config/database";
import { CreateIncomeInput, UpdateIncomeInput } from "./income.validation";

function removeUndefinedFields<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as { [K in keyof T]-?: Exclude<T[K], undefined> };
}


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
