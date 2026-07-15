import { prisma } from "../../config/database";
import { CreateNoteInput, UpdateNoteInput } from "./note.validation";
import { httpError } from "../../utils/httpError";
import { removeUndefinedFields } from "../income/income.service";

class NoteService {
  async create(data: CreateNoteInput) {
    return prisma.note.create({ data: removeUndefinedFields(data) });
  }

  async findAll() {
    return prisma.note.findMany({ where: { deletedAt: null } });
  }

  async findById(id: string) {
    return prisma.note.findFirst({ where: { id } });
  }

  async update(id: string, data: UpdateNoteInput) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const sanitizedData = removeUndefinedFields(data);
    if (Object.keys(sanitizedData).length === 0) {
      return existing;
    }

    return prisma.note.update({ where: { id }, data: sanitizedData });
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    return prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async togglePin(id: string, isPinned: boolean) {
    const existing = await this.findById(id);
    if (!existing) return null;

    return prisma.note.update({ where: { id }, data: { isPinned } });
  }

  async toggleArchive(id: string, isArchived: boolean, userId: string) {
    const existing = await this.findById(id);
    if (!existing) return null;
    return prisma.note.update({ where: { id }, data: { isArchived } });
  }
}

export default new NoteService();