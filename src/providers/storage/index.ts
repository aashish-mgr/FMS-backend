// src/providers/storage/index.ts
import { StorageService } from './StorageService';
import { LocalStorageProvider } from './LocalStorageProvider';
import { envConfig } from '../../config/env';

let instance: StorageService | null = null;

export function getStorageService(): StorageService {
  if (instance) return instance;
  switch (envConfig.STORAGE_PROVIDER) {
    case 'cloudinary':
      // instance = new CloudinaryProvider(); — add when you're ready to wire this in
      throw new Error('CloudinaryProvider not yet implemented');
    case 'local':
    default:
      instance = new LocalStorageProvider();
  }
  return instance;
}