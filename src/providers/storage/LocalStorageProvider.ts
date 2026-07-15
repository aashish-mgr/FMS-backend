// src/providers/storage/LocalStorageProvider.ts
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { StorageService, UploadResult } from './StorageService';
import { envConfig } from '../../config/env';

export class LocalStorageProvider implements StorageService {
  private basePath = envConfig.LOCAL_UPLOAD_PATH;

  async upload(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const dir = path.join(this.basePath, folder);
    await fs.mkdir(dir, { recursive: true });

    const ext = path.extname(file.originalname);
    const key = `${folder}/${crypto.randomUUID()}${ext}`;
    await fs.writeFile(path.join(this.basePath, key), file.buffer);

    return { storageKey: key, storageUrl: `/uploads/${key}`, provider: 'local' };
  }

  async delete(storageKey: string): Promise<void> {
    await fs.unlink(path.join(this.basePath, storageKey)).catch(() => {}); // idempotent
  }

  async getStream(storageKey: string) {
    return createReadStream(path.join(this.basePath, storageKey));
  }
}