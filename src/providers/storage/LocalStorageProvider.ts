// src/providers/storage/LocalStorageProvider.ts
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  DeleteOptions,
  DownloadUrlOptions,
  StorageService,
  UploadResult,
  UploadedFile,
  inferResourceType,
} from './StorageService';
import { envConfig } from '../../config/env';

export class LocalStorageProvider implements StorageService {
  private basePath = envConfig.LOCAL_UPLOAD_PATH;

  async upload(file: UploadedFile, folder: string): Promise<UploadResult> {
    const dir = path.join(this.basePath, folder);
    await fs.mkdir(dir, { recursive: true });

    const ext = path.extname(file.originalname);
    const key = `${folder}/${crypto.randomUUID()}${ext}`;
    await fs.writeFile(path.join(this.basePath, key), file.buffer);

    return {
      storageKey: key,
      storageUrl: `/uploads/${key}`,
      provider: 'local',
      resourceType: inferResourceType(file.mimetype),
    };
  }

  async delete(storageKey: string, _options?: DeleteOptions): Promise<void> {
    await fs.unlink(path.join(this.basePath, storageKey)).catch(() => {}); // idempotent
  }

  getDownloadUrl(storageKey: string, _options?: DownloadUrlOptions): string {
    return `/uploads/${storageKey}`;
  }

  async getStream(storageKey: string) {
    return createReadStream(path.join(this.basePath, storageKey));
  }
}
