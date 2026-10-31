// src/modules/attachment/attachment.controller.ts
import { Response, NextFunction } from 'express';
import * as attachmentService from './attachment.service';
import { sendError, sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types/authTypes';
import { writeLog } from '../../services/audit.service';

export async function uploadHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const entityType = req.entityType!;
    const { entityId } = req.params;
    const files = req.files as Express.Multer.File[];
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return sendError(res, 'User authentication required', 401);
    }

    if (!entityId || Array.isArray(entityId)) {
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
    return sendSuccess(res, 'uploaded attachment', attachments, 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    if (!tenantId || !userId) {
      return sendError(res, 'User authentication required', 401);
    }

    await attachmentService.deleteAttachment(
      tenantId,
      req.params.attachmentId as string,
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
