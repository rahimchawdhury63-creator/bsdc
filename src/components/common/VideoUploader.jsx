/**
 * src/components/common/VideoUploader.jsx
 * ---------------------------------------------------------------------------
 * Single-video uploader (Cloudinary). Shows progress bar during upload.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useRef } from 'react';
import { uploadVideo } from '../../utils/videoUpload.js';
import { toast } from './Toast.jsx';
import { IconVideo, IconClose } from './Icons.jsx';

export default function VideoUploader({ value, onChange, disabled = false }) {
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const ref = useRef();

  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    setProgress(0);
    try {
      const result = await uploadVideo(f, (p) => setProgress(Math.round(p * 100)));
      onChange(result);
    } catch (err) {
      toast.error(err.message || 'Video upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {value ? (
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <video
            src={value.url}
            controls
            playsInline
            style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: 360, background: '#000' }}
          />
          <button
            type="button"
            className="bsdc-icon-btn"
            aria-label="Remove video"
            onClick={() => onChange(null)}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.92)' }}
          >
            <IconClose size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="bsdc-btn bsdc-btn--outline bsdc-btn--block"
          onClick={() => ref.current?.click()}
          disabled={disabled || busy}
        >
          <IconVideo size={16} />
          {busy ? `Uploading… ${progress}%` : 'Add video (Cloudinary)'}
        </button>
      )}

      {busy && (
        <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 4, marginTop: 8 }}>
          <div
            style={{
              width: `${progress}%`, height: '100%',
              background: 'var(--color-primary)', borderRadius: 4,
              transition: 'width 200ms ease'
            }}
          />
        </div>
      )}

      <input
        ref={ref}
        type="file"
        accept="video/*"
        onChange={pick}
        style={{ display: 'none' }}
      />
    </div>
  );
}
