/**
 * Wiki Post — collaborative page. Lives at /wiki/:slug.
 */
import React, { useState } from 'react';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function WikiPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Wiki page title</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          placeholder="e.g. Bangladesh tech meetups"
          maxLength={120}
          required
        />
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Page body (Markdown)</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          placeholder="Start the page. Others can suggest edits later."
          rows={12}
          maxLength={60000}
          required
        />
      </div>
      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={!data.title.trim() || data.content.trim().length < 50}
        onCancel={onCancel}
        label="Create wiki page"
      />
    </form>
  );
}
