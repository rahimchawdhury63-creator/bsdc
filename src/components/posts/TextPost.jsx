/**
 * Text Post — short status. Title optional.
 */
import React, { useState } from 'react';
import { MetaStrip, SubmitBar } from './_formShell.jsx';
import { bsdcAutoGrow } from '../../scripts/interactions.js';

export default function TextPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({ content: '', tags: [], language: 'en', privacy: 'public' });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">What's on your mind?</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => { change('content', e.target.value); bsdcAutoGrow(e.target); }}
          placeholder="Share an update, a quick thought, or a question…"
          maxLength={2000}
          required
          rows={5}
        />
        <p className="bsdc-input-help">{data.content.length}/2000</p>
      </div>
      <MetaStrip value={data} onChange={setData} />
      <SubmitBar submitting={submitting} disabled={!data.content.trim()} onCancel={onCancel} />
    </form>
  );
}
