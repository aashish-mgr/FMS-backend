// src/modules/attachment/attachment.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as attachmentService from './attachment.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types/authTypes';
import { writeLog } from '../../services/audit.service';

export async function uploadHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
     const entityType = req.entityType!;
    const { entityId } = req.params;
    const files = req.files as Express.Multer.File[];
    console.log('params:', req.params);

    if (!files?.length) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILES', message: 'At least one file is required' } });
    }

    const attachments = await attachmentService.uploadAttachments(entityType, entityId as string, files, req.user!.id);
    await writeLog({ userId: req.user?.id ?? null, action: "ATTACHMENT_UPLOADED", entityType: "attachment"});
    return res.status(201).json(sendSuccess(res,"uploaded attacment",attachments));
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await attachmentService.deleteAttachment(req.params.attachmentId as string, req.user!.id);
    await writeLog({ userId: req.user?.id ?? null, action: "ATTACHMENT_DELETED", entityType: "attachment"});
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}