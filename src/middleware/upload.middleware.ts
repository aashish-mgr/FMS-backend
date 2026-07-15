// src/middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../config/env';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types/authTypes';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (!mimeOk || !extOk) {
    return cb(new AppError('UNSUPPORTED_FILE_TYPE', 'Only PDF, JPG, JPEG, PNG are allowed', 400));
  }
  cb(null, true);
};

export const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: envConfig.MAX_ATTACHMENT_SIZE_MB * 1024 * 1024,
    files: 10, 
  },
});

export const withEntityType = (type: 'income' | 'expense' | 'reminder') => (req: AuthRequest, res: Response, next: NextFunction) => {
  req.entityType = type;
  next();
};