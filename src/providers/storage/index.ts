// src/providers/storage/index.ts
import {
  StorageProvider,
  StorageService,
} from './StorageService';
import { LocalStorageProvider } from './LocalStorageProvider';
import { CloudinaryProvider } from './CloudinaryProvider';
import { envConfig } from '../../config/env';

const instances: Partial<Record<StorageProvider, StorageService>> = {};

export function getStorageService(
  provider: StorageProvider = envConfig.STORAGE_PROVIDER,
): StorageService {
  const existing = instances[provider];
  if (existing) return existing;

  const instance =
    provider === 'cloudinary'
      ? new CloudinaryProvider()
      : new LocalStorageProvider();

  instances[provider] = instance;
  return instance;
}
