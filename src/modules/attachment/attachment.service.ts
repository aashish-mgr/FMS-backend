// src/modules/attachment/attachment.service.ts
import type { Attachment } from '@prisma/client';
import { prisma } from '../../config/database';
import { getStorageService } from '../../providers/storage';
import {
  StorageProvider,
  StorageResourceType,
  UploadedFile,
  inferResourceType,
} from '../../providers/storage/StorageService';
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

function providerFor(provider: string): StorageProvider {
  return provider === 'cloudinary' ? 'cloudinary' : 'local';
}

function resourceTypeFor(attachment: Attachment): StorageResourceType {
  const stored = attachment.resourceType;
  if (stored === 'image' || stored === 'raw' || stored === 'video') {
    return stored;
  }

  return inferResourceType(attachment.mimeType);
}

export function toAttachmentResponse(attachment: Attachment) {
  return {
    id: attachment.id,
    tenantId: attachment.tenantId,
    entityType: attachment.entityType,
    entityId: attachment.entityId,
    fileName: attachment.fileName,
    fileSize: attachment.fileSize,
    mimeType: attachment.mimeType,
    provider: attachment.provider,
    resourceType: attachment.resourceType,
    uploadedBy: attachment.uploadedBy,
    createdAt: attachment.createdAt,
    deletedAt: attachment.deletedAt,
    downloadUrl: `/api/${attachment.entityType}/${attachment.entityId}/attachments/${attachment.id}/download`,
  };
}

export async function uploadAttachments(
  tenantId: string,
  entityType: EntityType,
  entityId: string,
  files: UploadedFile[],
  userId: string
) {
  await assertEntityBelongsToTenant(tenantId, entityType, entityId);

  const storage = getStorageService();
  const created: Attachment[] = [];

  for (const file of files) {
    // Prefix the storage path with the tenant id so files from different
    // workspaces cannot collide, even if they share an entity id.
    const uploaded = await storage.upload(
      file,
      `${tenantId}/${entityType}`,
    );

    try {
      const attachment = await prisma.attachment.create({
        data: {
          tenantId,
          entityType,
          entityId,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          storageKey: uploaded.storageKey,
          storageUrl: uploaded.storageUrl,
          provider: uploaded.provider,
          resourceType: uploaded.resourceType,
          uploadedBy: userId,
        },
      });

      created.push(attachment);
    } catch (error) {
      // Do not leave an orphaned Cloudinary asset if the database write fails.
      await storage
        .delete(uploaded.storageKey, { resourceType: uploaded.resourceType })
        .catch((cleanupError) => {
          console.error('Failed to clean up uploaded attachment:', cleanupError);
        });
      throw error;
    }
  }

  return created;
}

export async function deleteAttachment(
  tenantId: string,
  attachmentId: string,
  entityType: EntityType,
  entityId: string,
  userId: string
) {
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      tenantId,
      entityType,
      entityId,
      deletedAt: null,
    },
  });
  if (!attachment) throw new AppError('NOT_FOUND', 'Attachment not found', 404);

  const storage = getStorageService(providerFor(attachment.provider));
  try {
    await storage.delete(attachment.storageKey, {
      resourceType: resourceTypeFor(attachment),
    });
  } catch (error) {
    console.error('Failed to delete attachment from storage:', error);
    throw new AppError(
      'STORAGE_ERROR',
      'Unable to delete attachment file',
      502,
    );
  }

  const deleted = await prisma.attachment.update({
    where: { id: attachmentId },
    data: { deletedAt: new Date() },
  });

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

export async function getAttachmentDownload(
  tenantId: string,
  attachmentId: string,
  entityType: EntityType,
  entityId: string,
) {
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      tenantId,
      entityType,
      entityId,
      deletedAt: null,
    },
  });

  if (!attachment) throw new AppError('NOT_FOUND', 'Attachment not found', 404);

  const storage = getStorageService(providerFor(attachment.provider));

  // Local files are not publicly served. Stream them through this authenticated
  // route instead of redirecting to a static path.
  if (attachment.provider === 'local' && storage.getStream) {
    return {
      attachment,
      stream: await storage.getStream(attachment.storageKey),
    };
  }

  const downloadUrl = storage.getDownloadUrl(attachment.storageKey, {
    resourceType: resourceTypeFor(attachment),
    fileName: attachment.fileName,
  });

  return { attachment, downloadUrl };
}
