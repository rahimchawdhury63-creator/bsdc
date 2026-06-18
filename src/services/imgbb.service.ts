import { getImgBBUploadUrl, isImgBBConfigured } from '@config/imgbb';
import type { ServiceResult } from '@/types';

/** ImgBB successful response subset used by BSDC after browser uploads. */
interface ImgBBUploadResponse {
  readonly success: boolean;
  readonly data?: {
    readonly url?: string;
    readonly display_url?: string;
    readonly delete_url?: string;
  };
  readonly error?: { readonly message?: string };
}

/** Converts a File object into a base64 data URL for ImgBB upload. */
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

/** Uploads a base64 encoded image to ImgBB and returns the public URL. */
export const uploadBase64ToImgBB = async (base64Image: string): Promise<ServiceResult<string>> => {
  if (!isImgBBConfigured()) {
    return { ok: false, error: 'ImgBB upload is not configured.' };
  }

  try {
    const formData = new FormData();
    formData.append('image', base64Image.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, ''));

    const response = await fetch(getImgBBUploadUrl(), { method: 'POST', body: formData });
    const payload = (await response.json()) as ImgBBUploadResponse;

    if (!response.ok || !payload.success || !payload.data?.url) {
      return { ok: false, error: payload.error?.message || 'ImgBB upload failed.' };
    }

    return { ok: true, data: payload.data.url };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'ImgBB upload failed.' };
  }
};

/** Uploads a browser File to ImgBB after validating MIME type and size. */
export const uploadImageFileToImgBB = async (file: File): Promise<ServiceResult<string>> => {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Only image files are allowed.' };
  }

  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: 'Image must be 8 MB or smaller.' };
  }

  const base64 = await fileToBase64(file);
  return uploadBase64ToImgBB(base64);
};
