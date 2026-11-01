// src/modules/attachment/attachment.routes.ts
import { Router } from 'express';
import { uploadAttachment } from '../../middleware/upload.middleware';
import { uploadHandler, deleteHandler } from './attachment.controller';
import authGuard from '../../middleware/authGuard';
import requirePermission from '../../middleware/requirePermission';
import { PERMISSIONS } from '../../config/permissions';

const router = Router({ mergeParams: true });

router.post(
  '/',
  authGuard.isAuthenticated,
  requirePermission(PERMISSIONS.ATTACHMENT_CREATE),
  uploadAttachment.array('files', 10),
  uploadHandler,
);
router.delete(
  '/:attachmentId',
  authGuard.isAuthenticated,
  requirePermission(PERMISSIONS.ATTACHMENT_DELETE),
  deleteHandler,
);

export default router;