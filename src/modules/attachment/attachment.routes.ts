// src/modules/attachment/attachment.routes.ts
import { Router } from 'express';
import { uploadAttachment } from '../../middleware/upload.middleware';
import {
  uploadHandler,
  listHandler,
  downloadHandler,
  deleteHandler,
} from './attachment.controller';
import authGuard from '../../middleware/authGuard';
import requirePermission from '../../middleware/requirePermission';
import { PERMISSIONS } from '../../config/permissions';

const router = Router({ mergeParams: true });

router.get(
  '/',
  authGuard.isAuthenticated,
  requirePermission(PERMISSIONS.ATTACHMENT_READ),
  listHandler,
);
router.post(
  '/',
  authGuard.isAuthenticated,
  requirePermission(PERMISSIONS.ATTACHMENT_CREATE),
  uploadAttachment.array('files', 10),
  uploadHandler,
);
router.get(
  '/:attachmentId/download',
  authGuard.isAuthenticated,
  requirePermission(PERMISSIONS.ATTACHMENT_READ),
  downloadHandler,
);
router.delete(
  '/:attachmentId',
  authGuard.isAuthenticated,
  requirePermission(PERMISSIONS.ATTACHMENT_DELETE),
  deleteHandler,
);

export default router;
