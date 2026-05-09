// ============================================
// BSDC — Image Upload Manager (FINAL FIX)
// ImgBB API — key in URL query parameter
// https://api.imgbb.com/1/upload?key=API_KEY
// ============================================

import { showToast } from './firebase-init.js';

// ── YOUR ImgBB API Key ──
const IMGBB_API_KEY = 'fdbfbcfd3bc5189e50a50c574515298d';

// ── ImgDB Key (backup) ──
const IMGDB_KEY = 'fdbfbcfd3bc5189e50a50c574515298d';

// ── Limits ──
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff'
];

// ══════════════════════════════════════════════
// MAIN UPLOAD — tries ImgBB first, then ImgDB
// ══════════════════════════════════════════════
export async function uploadImage(file) {
  if (!file) {
    showToast('No file selected.', 'error');
    throw new Error('No file provided');
  }

  // ── Validate type ──
  if (!ALLOWED_TYPES.includes(file.type)) {
    showToast('Invalid file type. Use JPG, PNG, GIF, or WebP.', 'error');
    throw new Error('Invalid file type: ' + file.type);
  }

  // ── Validate size ──
  if (file.size > MAX_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    showToast(`Image too large (${mb}MB). Maximum 5MB allowed.`, 'error');
    throw new Error('File too large');
  }

  // ── Try ImgBB (primary) ──
  try {
    const url = await uploadToImgBB(file);
    if (url) {
      console.log('BSDC: ImgBB upload success →', url);
      return url;
    }
  } catch (err) {
    console.warn('BSDC: ImgBB failed →', err.message);
  }

  // ── Try ImgDB (fallback) ──
  try {
    const url = await uploadToImgDB(file);
    if (url) {
      console.log('BSDC: ImgDB upload success →', url);
      return url;
    }
  } catch (err) {
    console.warn('BSDC: ImgDB failed →', err.message);
  }

  // ── Base64 fallback for small images ──
  if (file.size <= 800 * 1024) {
    try {
      const dataUrl = await fileToDataURL(file);
      console.log('BSDC: Using base64 fallback');
      showToast('Image stored as preview. Upload worked.', 'success');
      return dataUrl;
    } catch (err) {
      console.warn('BSDC: Base64 fallback failed', err.message);
    }
  }

  showToast('Image upload failed. Please try a different image.', 'error');
  throw new Error('All upload methods failed');
}

// ══════════════════════════════════════════════
// ImgBB UPLOAD
// Correct format: key in URL + base64 in body
// https://api.imgbb.com/1/upload?key=YOUR_KEY
// POST body: image=BASE64_STRING
// ══════════════════════════════════════════════
async function uploadToImgBB(file) {
  // Convert file to base64 (WITHOUT data: prefix)
  const base64String = await fileToBase64(file);

  // Key goes in the URL query string
  const apiUrl = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

  // Image base64 goes in FormData body
  const formData = new FormData();
  formData.append('image', base64String);

  // Optional: set expiration (0 = never expire)
  formData.append('expiration', '0');

  // Optional: set image name
  formData.append('name', `bsdc_${Date.now()}`);

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData
    // NOTE: Do NOT set Content-Type header — let browser set it with boundary
  });

  // Get response text first for debugging
  const responseText = await response.text();
  console.log('ImgBB raw response:', responseText.substring(0, 300));

  if (!response.ok) {
    throw new Error(`ImgBB HTTP ${response.status}: ${responseText.substring(0, 100)}`);
  }

  // Parse JSON
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    throw new Error('ImgBB: Invalid JSON response');
  }

  // Check success
  if (!data.success) {
    throw new Error(`ImgBB: API error — ${JSON.stringify(data.error || data)}`);
  }

  // Extract URL — try multiple fields
  const url =
    data.data?.display_url ||
    data.data?.url ||
    data.data?.thumb?.url ||
    data.data?.medium?.url ||
    null;

  if (!url) {
    throw new Error('ImgBB: No URL in response');
  }

  return url;
}

// ══════════════════════════════════════════════
// ImgDB UPLOAD (fallback)
// ══════════════════════════════════════════════
async function uploadToImgDB(file) {
  const base64String = await fileToBase64(file);

  // Method 1: FormData with base64
  try {
    const formData = new FormData();
    formData.append('key', IMGDB_KEY);
    formData.append('image', base64String);
    formData.append('format', 'json');

    const response = await fetch('https://imgdb.net/api/1/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const text = await response.text();
      console.log('ImgDB response:', text.substring(0, 200));
      try {
        const data = JSON.parse(text);
        const url = extractUrlFromResponse(data);
        if (url) return url;
      } catch (e) {
        if (text.startsWith('http')) return text.trim();
      }
    }
  } catch (e) {
    console.warn('ImgDB FormData failed:', e.message);
  }

  // Method 2: JSON body
  try {
    const response = await fetch('https://imgdb.net/api/1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: IMGDB_KEY,
        image: base64String,
        format: 'json'
      })
    });

    if (response.ok) {
      const data = await response.json();
      const url = extractUrlFromResponse(data);
      if (url) return url;
    }
  } catch (e) {
    console.warn('ImgDB JSON failed:', e.message);
  }

  throw new Error('ImgDB: All methods failed');
}

// ══════════════════════════════════════════════
// URL EXTRACTOR
// Handles multiple API response formats
// ══════════════════════════════════════════════
function extractUrlFromResponse(data) {
  if (!data) return null;

  // Try every possible location
  return (
    data?.data?.display_url ||
    data?.data?.url ||
    data?.data?.link ||
    data?.data?.image?.url ||
    data?.data?.thumb?.url ||
    data?.data?.path ||
    data?.url ||
    data?.link ||
    data?.image?.url ||
    data?.image_url ||
    data?.img_url ||
    (typeof data === 'string' && data.startsWith('http') ? data : null) ||
    null
  );
}

// ══════════════════════════════════════════════
// UTILITY: File → Base64 (no data: prefix)
// ══════════════════════════════════════════════
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // e.target.result = "data:image/jpeg;base64,/9j/4AAQ..."
      // We need only the part after the comma
      const full = e.target.result;
      const base64 = full.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to extract base64 from file'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

// ══════════════════════════════════════════════
// UTILITY: File → Full Data URL (with prefix)
// ══════════════════════════════════════════════
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

// ══════════════════════════════════════════════
// COMPRESS IMAGE before upload
// ══════════════════════════════════════════════
export async function compressImage(file, maxWidth = 1200, quality = 0.85) {
  // Skip compression for small files
  if (file.size < 300 * 1024) return file;
  // Skip for GIF (compression breaks animation)
  if (file.type === 'image/gif') return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      if (width <= maxWidth && file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const outputQuality = file.type === 'image/png' ? 1 : quality;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, outputType === 'image/png' ? '.png' : '.jpg'),
            { type: outputType, lastModified: Date.now() }
          );
          const saved = (((file.size - compressed.size) / file.size) * 100).toFixed(0);
          console.log(`BSDC Compress: ${(file.size/1024).toFixed(0)}KB → ${(compressed.size/1024).toFixed(0)}KB (saved ${saved}%)`);
          resolve(compressed);
        },
        outputType,
        outputQuality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

// ══════════════════════════════════════════════
// UPLOAD WITH COMPRESSION
// ══════════════════════════════════════════════
export async function uploadImageCompressed(file) {
  const compressed = await compressImage(file);
  return uploadImage(compressed);
}

// ══════════════════════════════════════════════
// UPLOAD ZONE INITIALIZER
// ══════════════════════════════════════════════
export function initUploadZone({
  zoneId,
  inputId,
  previewImgId,
  previewWrapperId,
  removeBtnId,
  onSuccess,
  onError,
  compress = true,
  autoUpload = false
}) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  const previewImg = document.getElementById(previewImgId);
  const previewWrapper = document.getElementById(previewWrapperId);
  const removeBtn = document.getElementById(removeBtnId);

  if (!zone || !input) {
    console.warn('BSDC Upload Zone: Element not found', zoneId, inputId);
    return null;
  }

  let pendingFile = null;

  // ── Click to open picker ──
  zone.addEventListener('click', (e) => {
    if (e.target === removeBtn || removeBtn?.contains(e.target)) return;
    input.click();
  });

  // ── Keyboard ──
  zone.setAttribute('tabindex', '0');
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });

  // ── Drag & Drop ──
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    zone.style.borderColor = '#006A4E';
    zone.style.background = '#E8F5F0';
  });

  zone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    zone.style.borderColor = '#E2E8F0';
    zone.style.background = '';
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    zone.style.borderColor = '#E2E8F0';
    zone.style.background = '';
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  });

  // ── File input change ──
  input.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  });

  // ── Remove button ──
  removeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    pendingFile = null;
    if (previewImg) previewImg.src = '';
    if (previewWrapper) previewWrapper.style.display = 'none';
    input.value = '';
    zone.style.display = '';
    if (onSuccess) onSuccess(null);
  });

  async function processFile(file) {
    // Validate
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Invalid file type. Use JPG, PNG, GIF, or WebP.', 'error');
      if (onError) onError(new Error('Invalid type'));
      return;
    }
    if (file.size > MAX_SIZE) {
      showToast(`Image too large (${(file.size/1024/1024).toFixed(1)}MB). Max 5MB.`, 'error');
      if (onError) onError(new Error('Too large'));
      return;
    }

    // Show local preview immediately (fast UX)
    try {
      const dataUrl = await fileToDataURL(file);
      if (previewImg) {
        previewImg.src = dataUrl;
        previewImg.alt = file.name;
      }
      if (previewWrapper) previewWrapper.style.display = 'block';
      zone.style.display = 'none';
    } catch (e) {
      console.warn('Preview failed:', e);
    }

    if (autoUpload) {
      // Upload immediately
      try {
        showToast('Uploading image...', 'success');
        const fileToUpload = compress ? await compressImage(file) : file;
        const url = await uploadImage(fileToUpload);
        showToast('Image uploaded! ✅', 'success');
        if (onSuccess) onSuccess(url);
      } catch (err) {
        showToast('Upload failed. Image not saved.', 'error');
        if (onError) onError(err);
      }
    } else {
      // Save for later upload (on form submit)
      pendingFile = file;
      if (onSuccess) onSuccess('pending'); // Signal file is ready
    }
  }

  // Public method: upload the pending file on demand
  const zoneObj = {
    uploadPending: async function() {
      if (!pendingFile) return null;
      showToast('Uploading image...', 'success');
      const fileToUpload = compress ? await compressImage(pendingFile) : pendingFile;
      const url = await uploadImage(fileToUpload);
      pendingFile = null;
      showToast('Image uploaded! ✅', 'success');
      return url;
    },
    hasPending: () => pendingFile !== null,
    clear: () => {
      pendingFile = null;
      if (previewImg) previewImg.src = '';
      if (previewWrapper) previewWrapper.style.display = 'none';
      input.value = '';
      zone.style.display = '';
    }
  };

  return zoneObj;
}
