/**
 * src/utils/imageUpload.js
 * ---------------------------------------------------------------------------
 * ImgBB upload utility — ALL user-generated images go through here
 * (banners, post images, comment images, NID/birth-certificate proofs).
 *
 * IMPORTANT (per spec):
 *   - Method: POST
 *   - Endpoint:  https://api.imgbb.com/1/upload?key=<API_KEY>   (key in URL)
 *   - Body: FormData with field "image" set to BASE64 STRING (NOT data: URI)
 *   - Response: { data: { url, display_url, ... }, success: true }
 *
 * Returns the public URL to be persisted in Firestore.
 *
 * NOTE for profile pictures + videos: use videoUpload.js (Cloudinary).
 * ---------------------------------------------------------------------------
 */

const IMGBB_API_KEY =
  import.meta.env.VITE_IMGBB_API_KEY || 'fdbfbcfd3bc5189e50a50c574515298d';
const IMGBB_ENDPOINT = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

/**
 * Convert a File/Blob to a base64 STRING (no data URI prefix).
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      // Strip the "data:image/jpeg;base64," prefix — ImgBB only wants the payload.
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a single image File to ImgBB.
 *
 * @param {File}   file              - browser File or Blob
 * @param {Object} [opts]
 * @param {Number} [opts.maxSizeMB]  - reject if larger (default 32MB — ImgBB's hard limit)
 * @param {Number} [opts.expirationSec] - auto-delete after N seconds (omit for permanent)
 * @returns {Promise<{url:string, displayUrl:string, deleteUrl:string, width:number, height:number}>}
 */
export async function uploadImage(file, { maxSizeMB = 32, expirationSec } = {}) {
  if (!file) throw new Error('No file provided.');
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are accepted.');
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`Image is too large (max ${maxSizeMB}MB).`);
  }

  const base64 = await fileToBase64(file);

  // ImgBB expects body fields, NOT JSON. key stays in URL.
  const body = new FormData();
  body.append('image', base64);
  if (file.name) body.append('name', file.name);

  // Optional expiration (seconds) — useful for temp uploads like Story previews
  const url = expirationSec
    ? `${IMGBB_ENDPOINT}&expiration=${expirationSec}`
    : IMGBB_ENDPOINT;

  const res = await fetch(url, { method: 'POST', body });
  const json = await res.json().catch(() => null);

  if (!res.ok || !json || !json.success) {
    const reason = json?.error?.message || `HTTP ${res.status}`;
    throw new Error(`ImgBB upload failed: ${reason}`);
  }

  // The shape we expose to the rest of the app.
  return {
    url: json.data.url,
    displayUrl: json.data.display_url,
    deleteUrl: json.data.delete_url,
    width: json.data.width,
    height: json.data.height,
    thumbUrl: json.data.thumb?.url || json.data.url,
    mediumUrl: json.data.medium?.url || json.data.url
  };
}

/**
 * Upload many files in parallel. Rejects on first failure.
 * For very large batches, callers can chunk this themselves.
 */
export async function uploadImages(files, opts) {
  const results = await Promise.all(
    Array.from(files).map((f) => uploadImage(f, opts))
  );
  return results;
}
