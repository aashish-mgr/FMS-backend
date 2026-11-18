// src/modules/attachment/attachment.controller.ts
import { Response, NextFunction } from 'express';
import * as attachmentService from './attachment.service';
import { sendError, sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types/authTypes';
import { writeLog } from '../../services/audit.service';

function routeEntityId(req: AuthRequest): string | null {
  const { entityId } = req.params;
  return typeof entityId === 'string' ? entityId : null;
}

export async function uploadHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const entityType = req.entityType!;
    const entityId = routeEntityId(req);
    const files = req.files as Express.Multer.File[];
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return sendError(res, 'User authentication required', 401);
    }

    if (!entityId) {
      return sendError(res, 'entityId is required');
    }

    if (!files?.length) {
      return sendError(res, 'At least one file is required');
    }

    const attachments = await attachmentService.uploadAttachments(
      tenantId,
      entityType,
      entityId,
      files,
      userId,
    );
    await writeLog({
      tenantId,
      userId,
      action: "ATTACHMENT_UPLOADED",
      entityType: "attachment",
    });
    return sendSuccess(
      res,
      'uploaded attachment',
      attachments.map(attachmentService.toAttachmentResponse),
      201,
    );
  } catch (err) {
    next(err);
  }
}

export async function listHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const entityType = req.entityType!;
    const entityId = routeEntityId(req);
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return sendError(res, 'User authentication required', 401);
    }

    if (!entityId) {
      return sendError(res, 'entityId is required');
    }

    const attachments = await attachmentService.getAttachmentsForEntity(
      tenantId,
      entityType,
      entityId,
    );
    return sendSuccess(
      res,
      'attachments fetched successfully',
      attachments.map(attachmentService.toAttachmentResponse),
    );
  } catch (err) {
    next(err);
  }
}

export async function downloadHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const entityType = req.entityType!;
    const entityId = routeEntityId(req);
    const attachmentId = req.params.attachmentId;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return sendError(res, 'User authentication required', 401);
    }

    if (!entityId || typeof attachmentId !== 'string') {
      return sendError(res, 'entityId and attachmentId are required');
    }

    const { downloadUrl } = await attachmentService.getAttachmentDownload(
      tenantId,
      attachmentId,
      entityType,
      entityId,
    );

    return res.redirect(302, downloadUrl);
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    const entityId = routeEntityId(req);
    const attachmentId = req.params.attachmentId;

    if (!tenantId || !userId) {
      return sendError(res, 'User authentication required', 401);
    }

    if (!entityId || typeof attachmentId !== 'string') {
      return sendError(res, 'entityId and attachmentId are required');
    }

    await attachmentService.deleteAttachment(
      tenantId,
      attachmentId,
      req.entityType!,
      entityId,
      userId,
    );
    await writeLog({
      tenantId,
      userId,
      action: "ATTACHMENT_DELETED",
      entityType: "attachment",
    });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
