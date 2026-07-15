import { prisma } from "../../config/database";
import { CreateRemainderInput, UpdateRemainderInput } from "./remainder.validation";
import { httpError } from "../../utils/httpError";
import { removeUndefinedFields } from "../income/income.service";
import { STATUS } from "./remainder.validation";

class RemainderService {
  async create(data: CreateRemainderInput) {
    return prisma.remainder.create({ data: removeUndefinedFields(data) });
  }

  async findAll() {
    return prisma.remainder.findMany({ where: { deletedAt: null } });
  }

  async findById(id: string) {
    return prisma.remainder.findFirst({ where: { id, deletedAt: null } });
  }

  async update(id: string, data: UpdateRemainderInput) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const sanitizedData = removeUndefinedFields(data);
    if (Object.keys(sanitizedData).length === 0) {
      return existing;
    }

    return prisma.remainder.update({ where: { id }, data: sanitizedData });
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    return prisma.remainder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async markComplete(id: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    return prisma.remainder.update({where: {id}, data: {status: "COMPLETED"}})
  }

}

export default new RemainderService();