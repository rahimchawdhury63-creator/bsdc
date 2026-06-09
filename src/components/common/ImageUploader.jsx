/**
 * src/components/common/ImageUploader.jsx
 * ---------------------------------------------------------------------------
 * Drag-and-drop / tap-to-pick image picker that uploads to ImgBB.
 *
 * Props:
 *   - value     : array of { url, ... } already-uploaded items
 *   - onChange  : called whenever the list changes
 *   - max       : max number of images (default 10)
 *   - disabled
 * ---------------------------------------------------------------------------
 */

import React, { useState, useRef, useCallback } from 'react';
import { uploadImage } from '../../utils/imageUpload.js';
import { toast } from './Toast.jsx';
import Spinner from './Spinner.jsx';
import { IconImage, IconClose, IconPlus } from './Icons.jsx';

export default function ImageUploader({ value = [], onChange, max = 10, disabled = false }) {
  const [busy, setBusy] = useState(false);
  const ref = useRef();

  /** Upload one file at a time so partial failures don't ruin the batch. */
  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      toast.error(`You can upload up to ${max} images per post.`);
      return;
    }
    setBusy(true);
    const next = [...value];
    for (const f of Array.from(files)) {
      try {
        const r = await uploadImage(f);
        next.push(r);
      } catch (err) {
        toast.error(err.message || 'Image upload failed.');
      }
    }
    setBusy(false);
    onChange(next);
  }, [value, max, onChange]);

  const remove = (i) => {
    const next = [...value];
    next.splice(i, 1);
    onChange(next);
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="bsdc-grid-4" style={{ gap: 8, marginBottom: 8 }}>
          {value.map((img, i) => (
            <div key={img.url} style={{ position: 'relative' }}>
              <img
                src={img.thumbUrl || img.url}
                alt=""
                style={{
                  width: '100%', height: 100, objectFit: 'cover',
                  borderRadius: 'var(--radius-md)'
                }}
                loading="lazy"
              />
              <button
                type="button"
                className="bsdc-icon-btn bsdc-icon-btn--sm"
                aria-label="Remove image"
                onClick={() => remove(i)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.92)' }}
              >
                <IconClose size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="bsdc-btn bsdc-btn--outline bsdc-btn--block"
        onClick={() => ref.current?.click()}
        disabled={disabled || busy || value.length >= max}
      >
        {busy ? <Spinner size="sm" /> : <IconImage size={16} />}
        {value.length === 0
          ? 'Add images (ImgBB)'
          : `Add more (${value.length}/${max})`}
        <IconPlus size={14} />
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        style={{ display: 'none' }}
      />
    </div>
  );
}
