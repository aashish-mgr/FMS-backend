// src/modules/attachment/attachment.service.ts
import { prisma } from '../../config/database'; // your PrismaClient singleton
import { getStorageService } from '../../providers/storage'; // unchanged
// import { writeAuditLog } from '../../services/audit.service';
import { AppError } from '../../utils/AppError';

export type EntityType = 'income' | 'expense' | 'reminder';

async function assertEntityBelongsToTenant(
  tenantId: string,
  entityType: EntityType,
  entityId: string,
) {
  const where = { id: entityId, tenantId, deletedAt: null };

  const entity =
    entityType === 'income'
      ? await prisma.income.findFirst({ where })
      : entityType === 'expense'
        ? await prisma.expense.findFirst({ where })
        : await prisma.remainder.findFirst({ where });

  if (!entity) {
    throw new AppError('NOT_FOUND', `${entityType} not found`, 404);
  }
}

export async function uploadAttachments(
  tenantId: string,
  entityType: EntityType,
  entityId: string,
  files: Express.Multer.File[],
  userId: string
) {
  await assertEntityBelongsToTenant(tenantId, entityType, entityId);

  const storage = getStorageService();
  const created = [];

  for (const file of files) {
    // Prefix the storage path with the tenant id so files from different
    // workspaces cannot collide, even if they share an entity id.
    const { storageKey, storageUrl, provider } = await storage.upload(
      file,
      `${tenantId}/${entityType}`,
    );

    const attachment = await prisma.attachment.create({
      data: {
        tenantId,
        entityType,
        entityId,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storageKey,
        storageUrl,
        provider,
        uploadedBy: userId,
      },
    });

    // await writeAuditLog({
    //   userId,
    //   action: 'ATTACHMENT_UPLOADED',
    //   entityType: 'attachment',
    //   entityId: attachment.id,
    //   newValues: attachment,
    // });

    created.push(attachment);
  }

  return created;
}

export async function deleteAttachment(
  tenantId: string,
  attachmentId: string,
  userId: string
) {
  // manual soft-delete filter — no .delete(), and always exclude deletedAt rows on read
  const attachment = await prisma.attachment.findFirst({
    where: { id: attachmentId, tenantId, deletedAt: null },
  });
  if (!attachment) throw new AppError('NOT_FOUND', 'Attachment not found', 404);

  const deleted = await prisma.attachment.update({
    where: { id: attachmentId },
    data: { deletedAt: new Date() },
  });

//   await writeAuditLog({
//     userId,
//     action: 'ATTACHMENT_DELETED',
//     entityType: 'attachment',
//     entityId: attachment.id,
//     oldValues: attachment,
//   });

  return deleted;
}

export async function getAttachmentsForEntity(
  tenantId: string,
  entityType: EntityType,
  entityId: string
) {
  return prisma.attachment.findMany({
    where: { tenantId, entityType, entityId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAttachmentById(tenantId: string, attachmentId: string) {
  return prisma.attachment.findFirst({
    where: { id: attachmentId, tenantId, deletedAt: null },
  });
}
