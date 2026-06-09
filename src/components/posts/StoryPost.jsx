/**
 * Story Post — single image (ImgBB) + optional caption. Auto-expires in 24h.
 */
import React, { useState } from 'react';
import ImageUploader from '../common/ImageUploader.jsx';
import { SubmitBar } from './_formShell.jsx';

export default function StoryPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    content: '', images: [], tags: [], language: 'en', privacy: 'public'
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <p className="bsdc-text-muted bsdc-text-sm">
        Stories disappear after 24 hours. Add one image and an optional caption.
      </p>
      <div className="bsdc-input-group">
        <ImageUploader
          value={data.images}
          onChange={(v) => setData({ ...data, images: v.slice(0, 1) })}
          max={1}
        />
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Caption</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.content}
          onChange={(e) => setData({ ...data, content: e.target.value })}
          maxLength={140}
        />
      </div>
      <SubmitBar
        submitting={submitting}
        disabled={data.images.length === 0}
        onCancel={onCancel}
        label="Share story"
      />
    </form>
  );
}
