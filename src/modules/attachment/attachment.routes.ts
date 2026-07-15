// src/modules/attachment/attachment.routes.ts
import { Router } from 'express';
import { uploadAttachment } from '../../middleware/upload.middleware';
import { uploadHandler, deleteHandler } from './attachment.controller';
import authGuard from '../../middleware/authGuard';

const router = Router({ mergeParams: true });

router.post('/', authGuard.isAuthenticated, uploadAttachment.array('files', 10), uploadHandler);
router.delete('/:attachmentId', authGuard.isAuthenticated, deleteHandler);

export default router;