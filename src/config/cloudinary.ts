import { PUBLIC_INTEGRATIONS } from './constants';

/** Cloudinary unsigned image upload endpoint used for profile pictures and fallback uploads. */
export const getCloudinaryUploadUrl = (): string =>
  `https://api.cloudinary.com/v1_1/${encodeURIComponent(PUBLIC_INTEGRATIONS.cloudinaryCloudName)}/image/upload`;

/** Upload preset for unsigned browser uploads. Cloudinary API secret is never used in the client. */
export const CLOUDINARY_UPLOAD_PRESET = PUBLIC_INTEGRATIONS.cloudinaryUploadPreset;

/** Runtime guard for showing a clear upload configuration error to users. */
export const isCloudinaryConfigured = (): boolean =>
  PUBLIC_INTEGRATIONS.cloudinaryCloudName.trim().length > 0 && CLOUDINARY_UPLOAD_PRESET.trim().length > 0;
