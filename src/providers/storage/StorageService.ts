// src/providers/storage/StorageService.ts

export type StorageProvider = "local" | "cloudinary";
export type StorageResourceType = "image" | "raw" | "video";

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResult {
  storageKey: string;
  storageUrl: string;
  provider: StorageProvider;
  resourceType: StorageResourceType;
}

export interface DeleteOptions {
  resourceType?: StorageResourceType;
}

export interface DownloadUrlOptions {
  resourceType?: StorageResourceType;
  fileName?: string;
  expiresInSeconds?: number;
}

export interface StorageService {
  upload(file: UploadedFile, folder: string): Promise<UploadResult>;
  delete(storageKey: string, options?: DeleteOptions): Promise<void>;
  getDownloadUrl(storageKey: string, options?: DownloadUrlOptions): string;
  getStream?(storageKey: string): Promise<NodeJS.ReadableStream>;
}

export function inferResourceType(mimeType: string): StorageResourceType {
  if (mimeType.startsWith("image/")) return "image";
  return "raw";
}
