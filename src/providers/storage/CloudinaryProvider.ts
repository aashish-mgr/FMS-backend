// src/providers/storage/CloudinaryProvider.ts
import crypto from 'crypto';
import path from 'path';
import {
  v2 as cloudinary,
  type UploadApiOptions,
  type UploadApiResponse,
} from 'cloudinary';
import { envConfig } from '../../config/env';
import {
  DeleteOptions,
  DownloadUrlOptions,
  StorageResourceType,
  StorageService,
  UploadResult,
  UploadedFile,
  inferResourceType,
} from './StorageService';

const DEFAULT_DOWNLOAD_EXPIRY_SECONDS = 5 * 60;

function requireCloudinaryConfig() {
  const cloudName = envConfig.cloudinaryCloudName;
  const apiKey = envConfig.cloudinaryApiKey;
  const apiSecret = envConfig.cloudinaryApiSecret;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary storage is selected but CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET is missing',
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function uploadBuffer(
  buffer: Buffer,
  options: UploadApiOptions,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result) {
        reject(new Error('Cloudinary upload returned no result'));
        return;
      }

      resolve(result);
    });

    upload.end(buffer);
  });
}

function fileExtension(fileName: string): string {
  return path.extname(fileName).replace(/^\./, '').toLowerCase();
}

function downloadFormat(fileName: string, mimeType?: string): string {
  const extension = fileExtension(fileName);
  if (extension === 'jpeg') return 'jpg';
  if (extension) return extension;

  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'jpg';

  return 'bin';
}

export class CloudinaryProvider implements StorageService {
  constructor() {
    const { cloudName, apiKey, apiSecret } = requireCloudinaryConfig();

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async upload(file: UploadedFile, folder: string): Promise<UploadResult> {
    const resourceType = inferResourceType(file.mimetype);
    const extension = fileExtension(file.originalname);

    // Raw assets keep their extension as part of the public ID. Image assets
    // let Cloudinary infer the format from the uploaded bytes.
    const publicId =
      resourceType === 'raw' && extension
        ? `${crypto.randomUUID()}.${extension}`
        : crypto.randomUUID();

    const result = await uploadBuffer(file.buffer, {
      folder: `${envConfig.cloudinaryFolder}/${folder}`,
      public_id: publicId,
      resource_type: resourceType,
      type: 'authenticated',
      overwrite: false,
      invalidate: true,
    });

    return {
      storageKey: result.public_id,
      storageUrl: result.secure_url,
      provider: 'cloudinary',
      resourceType: (result.resource_type as StorageResourceType) ?? resourceType,
    };
  }

  async delete(
    storageKey: string,
    options: DeleteOptions = {},
  ): Promise<void> {
    const resourceType = options.resourceType ?? 'image';
    const result = await cloudinary.uploader.destroy(storageKey, {
      resource_type: resourceType,
      type: 'authenticated',
      invalidate: true,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary delete failed: ${result.result}`);
    }
  }

  getDownloadUrl(
    storageKey: string,
    options: DownloadUrlOptions = {},
  ): string {
    const resourceType = options.resourceType ?? 'image';
    // Raw assets keep their extension in the public ID, so signing a separate
    // format would produce a duplicated extension. Image assets need it.
    const format =
      resourceType === 'raw'
        ? ''
        : downloadFormat(options.fileName ?? storageKey);
    const expiresAt =
      Math.floor(Date.now() / 1000) +
      (options.expiresInSeconds ?? DEFAULT_DOWNLOAD_EXPIRY_SECONDS);

    return cloudinary.utils.private_download_url(storageKey, format, {
      resource_type: resourceType,
      type: 'authenticated',
      expires_at: expiresAt,
      attachment: true,
    });
  }
}
