// src/modules/attachment/attachment.service.ts
import { prisma } from '../../config/database'; // your PrismaClient singleton
import { getStorageService } from '../../providers/storage'; // unchanged
// import { writeAuditLog } from '../../services/audit.service';
import { AppError } from '../../utils/AppError';

type EntityType = 'income' | 'expense' | 'reminder';

export async function uploadAttachments(
  entityType: EntityType,
  entityId: string,
  files: Express.Multer.File[],
  userId: string
) {
  const storage = getStorageService();
  const created = [];

  for (const file of files) {
    const { storageKey, storageUrl, provider } = await storage.upload(file, entityType);

    const attachment = await prisma.attachment.create({
      data: {
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

export async function deleteAttachment(attachmentId: string, userId: string) {
  // manual soft-delete filter — no .delete(), and always exclude deletedAt rows on read
  const attachment = await prisma.attachment.findFirst({
    where: { id: attachmentId, deletedAt: null },
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

export async function getAttachmentsForEntity(entityType: EntityType, entityId: string) {
  return prisma.attachment.findMany({
    where: { entityType, entityId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAttachmentById(attachmentId: string) {
  return prisma.attachment.findFirst({
    where: { id: attachmentId, deletedAt: null },
  });
}