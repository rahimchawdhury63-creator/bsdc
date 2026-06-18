import { PUBLIC_INTEGRATIONS } from './constants';

/** ImgBB upload endpoint builder. The key is passed as the documented query parameter. */
export const getImgBBUploadUrl = (): string =>
  `https://api.imgbb.com/1/upload?key=${encodeURIComponent(PUBLIC_INTEGRATIONS.imgbbApiKey)}`;

/** Safe client-side readiness check used by uploader hooks before network calls. */
export const isImgBBConfigured = (): boolean => PUBLIC_INTEGRATIONS.imgbbApiKey.trim().length > 0;
