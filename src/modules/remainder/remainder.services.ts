import { prisma } from "../../config/database";
import { CreateRemainderInput, UpdateRemainderInput } from "./remainder.validation";
import { removeUndefinedFields } from "../income/income.service";

class RemainderService {
  async create(data: CreateRemainderInput, tenantId: string) {
    return prisma.remainder.create({
      data: { ...removeUndefinedFields(data), tenantId },
    });
  }

  async findAll(tenantId: string) {
    return prisma.remainder.findMany({ where: { tenantId, deletedAt: null } });
  }

  async findById(id: string, tenantId: string) {
    return prisma.remainder.findFirst({ where: { id, tenantId, deletedAt: null } });
  }

  async update(id: string, tenantId: string, data: UpdateRemainderInput) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    const sanitizedData = removeUndefinedFields(data);
    // Ownership is assigned from the authenticated user, never from the body.
    delete (sanitizedData as { createdBy?: unknown }).createdBy;
    if (Object.keys(sanitizedData).length === 0) {
      return existing;
    }

    return prisma.remainder.update({ where: { id }, data: sanitizedData });
  }

  async delete(id: string, tenantId: string) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    return prisma.remainder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async markComplete(id: string, tenantId: string) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    return prisma.remainder.update({ where: { id }, data: { status: "COMPLETED" } });
  }
}

export default new RemainderService();
