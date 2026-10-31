import { prisma } from "../../config/database";
import { CreateNoteInput, UpdateNoteInput } from "./note.validation";
import { removeUndefinedFields } from "../income/income.service";

class NoteService {
  async create(data: CreateNoteInput, tenantId: string) {
    return prisma.note.create({
      data: { ...removeUndefinedFields(data), tenantId },
    });
  }

  async findAll(tenantId: string) {
    return prisma.note.findMany({ where: { tenantId, deletedAt: null } });
  }

  async findById(id: string, tenantId: string) {
    return prisma.note.findFirst({ where: { id, tenantId, deletedAt: null } });
  }

  async update(id: string, tenantId: string, data: UpdateNoteInput) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    const sanitizedData = removeUndefinedFields(data);
    // Ownership is assigned from the authenticated user, never from the body.
    delete (sanitizedData as { createdBy?: unknown }).createdBy;
    if (Object.keys(sanitizedData).length === 0) {
      return existing;
    }

    return prisma.note.update({ where: { id }, data: sanitizedData });
  }

  async delete(id: string, tenantId: string) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    return prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async togglePin(id: string, tenantId: string, isPinned: boolean) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    return prisma.note.update({ where: { id }, data: { isPinned } });
  }

  async toggleArchive(id: string, tenantId: string, isArchived: boolean) {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;
    return prisma.note.update({ where: { id }, data: { isArchived } });
  }
}

export default new NoteService();
