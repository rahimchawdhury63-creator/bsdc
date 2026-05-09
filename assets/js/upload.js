// ============================================
// BSDC — Image Upload Manager
// Uses: ImgDB API
// ============================================

import { showToast } from './firebase-init.js';

const IMGDB_API_KEY = 'fdbfbcfd3bc5189e50a50c574515298d';
const IMGDB_ENDPOINT = 'https://api.imgdb.net/upload';
const MAX_SIZE_MB = 5;

/**
 * Upload image to ImgDB and return URL
 * @param {File} file - Image file object
 * @returns {Promise<string>} - Image URL
 */
export async function uploadImage(file) {
  if (!file) throw new Error('No file provided');

  // Validate size
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    showToast(`Image too large. Maximum size is ${MAX_SIZE_MB}MB.`, 'error');
    throw new Error('File too large');
  }

  // Validate type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    showToast('Invalid file type. Use JPG, PNG, GIF, or WebP.', 'error');
    throw new Error('Invalid file type');
  }

  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGDB_API_KEY);

    const response = await fetch(IMGDB_ENDPOINT, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.data && data.data.url) {
      return data.data.url;
    } else if (data && data.url) {
      return data.url;
    } else if (data && data.link) {
      return data.link;
    } else {
      throw new Error('Invalid response from image host');
    }

  } catch(err) {
    console.error('Image upload error:', err);
    showToast('Image upload failed. Please try again.', 'error');
    throw err;
  }
}

/**
 * Convert file to base64 data URL for preview
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before upload (client-side)
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
export function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob || file);
      }, file.type, quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Upload with compression
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadImageCompressed(file) {
  const compressed = await compressImage(file);
  const compressedFile = new File([compressed], file.name, { type: file.type });
  return uploadImage(compressedFile);
}
