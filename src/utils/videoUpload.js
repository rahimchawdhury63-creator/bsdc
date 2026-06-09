/**
 * src/utils/videoUpload.js
 * ---------------------------------------------------------------------------
 * Cloudinary unsigned uploader — used for:
 *   - Profile pictures (avatars)
 *   - Video posts
 *   - Cover videos / animated banners
 *
 * Why unsigned: we never expose CLOUDINARY_API_SECRET to the browser.
 * Configure an "Upload preset" in your Cloudinary dashboard named
 * `bsdc_unsigned` (see DEPLOYMENT.md) with:
 *   - Mode: Unsigned
 *   - Folder: bsdc/
 *   - Allowed formats: image, video
 *
 * Cloudinary returns a `secure_url` we persist in Firestore.
 * ---------------------------------------------------------------------------
 */

const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dpemuwrpz';
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bsdc_unsigned';

/**
 * Upload a file to Cloudinary.
 *
 * @param {File} file
 * @param {Object} [opts]
 * @param {'image'|'video'|'auto'} [opts.resourceType='auto']
 * @param {string} [opts.folder='bsdc']
 * @param {Function} [opts.onProgress] - (0..1) callback
 * @returns {Promise<{url:string, publicId:string, width:number, height:number, duration:number}>}
 */
export function uploadToCloudinary(file, {
  resourceType = 'auto',
  folder = 'bsdc',
  onProgress
} = {}) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided.'));

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    fd.append('folder', folder);

    // We use XHR (not fetch) because it gives us upload progress for big videos.
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (evt) => {
      if (onProgress && evt.lengthComputable) {
        onProgress(evt.loaded / evt.total);
      }
    };

    xhr.onerror = () => reject(new Error('Network error while uploading.'));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve({
            url: json.secure_url,
            publicId: json.public_id,
            width: json.width,
            height: json.height,
            duration: json.duration || 0,
            format: json.format,
            resourceType: json.resource_type
          });
        } catch (err) {
          reject(err);
        }
      } else {
        let msg = `Cloudinary upload failed (${xhr.status})`;
        try { msg = JSON.parse(xhr.responseText)?.error?.message || msg; } catch {}
        reject(new Error(msg));
      }
    };

    xhr.send(fd);
  });
}

/** Convenience for avatars (always images, smaller size). */
export function uploadAvatar(file, onProgress) {
  if (file.size > 8 * 1024 * 1024) {
    return Promise.reject(new Error('Avatar must be 8MB or less.'));
  }
  return uploadToCloudinary(file, {
    resourceType: 'image',
    folder: 'bsdc/avatars',
    onProgress
  });
}

/** Convenience for videos (≤100MB per spec). */
export function uploadVideo(file, onProgress) {
  if (file.size > 100 * 1024 * 1024) {
    return Promise.reject(new Error('Video must be 100MB or less.'));
  }
  return uploadToCloudinary(file, {
    resourceType: 'video',
    folder: 'bsdc/videos',
    onProgress
  });
}
