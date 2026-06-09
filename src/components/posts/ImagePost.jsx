/**
 * Image Post — up to 10 ImgBB images + caption.
 */
import React, { useState } from 'react';
import ImageUploader from '../common/ImageUploader.jsx';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function ImagePost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    content: '', images: [], tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Images</label>
        <ImageUploader value={data.images} onChange={(v) => change('images', v)} max={10} />
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Caption</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          placeholder="Write a caption…"
          maxLength={2000}
          rows={3}
        />
      </div>
      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={data.images.length === 0}
        onCancel={onCancel}
      />
    </form>
  );
}
