/**
 * Blog Post — long-form article with cover image + body. Article schema.
 */
import React, { useState } from 'react';
import ImageUploader from '../common/ImageUploader.jsx';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function BlogPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', images: [], tags: [],
    language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Article title</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          placeholder="A clear, descriptive headline"
          maxLength={120}
          required
        />
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Cover image (optional)</label>
        <ImageUploader value={data.images} onChange={(v) => change('images', v)} max={3} />
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Body (Markdown supported)</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          placeholder={'## Introduction\n\nWrite your article here. Use **bold**, *italics*, `code`, [links](https://example.com), and lists.'}
          rows={14}
          maxLength={60000}
          required
        />
        <p className="bsdc-input-help">
          {data.content.length} chars · ~{Math.max(1, Math.round(data.content.split(/\s+/).length / 200))} min read
        </p>
      </div>
      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={!data.title.trim() || data.content.trim().length < 100}
        onCancel={onCancel}
        label="Publish article"
      />
    </form>
  );
}
