/**
 * src/components/chat/ChatMedia.jsx
 * ---------------------------------------------------------------------------
 * Image attachment picker for the chat input. Uploads to ImgBB and
 * calls onSend({ imageURL }) when ready.
 *
 * Kept as a small dedicated component so the parent input bar stays clean.
 * ---------------------------------------------------------------------------
 */

import React, { useRef, useState } from 'react';
import { uploadImage } from '../../utils/imageUpload.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import { IconImage } from '../common/Icons.jsx';

export default function ChatMedia({ onSend, disabled = false }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    try {
      const r = await uploadImage(f, { maxSizeMB: 16 });
      await onSend({ imageURL: r.url, type: 'image' });
    } catch (err) {
      toast.error(err?.message || 'Could not upload image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="bsdc-icon-btn"
        onClick={() => ref.current?.click()}
        aria-label="Attach image"
        disabled={disabled || busy}
      >
        {busy ? <Spinner size="sm" /> : <IconImage />}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={pick}
        style={{ display: 'none' }}
      />
    </>
  );
}
