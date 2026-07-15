// src/providers/storage/StorageService.ts
export interface UploadResult {
  storageKey: string;
  storageUrl: string;
  provider: string;
}

export interface StorageService {
  upload(file: Express.Multer.File, folder: string): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
  getStream?(storageKey: string): Promise<NodeJS.ReadableStream>;
}