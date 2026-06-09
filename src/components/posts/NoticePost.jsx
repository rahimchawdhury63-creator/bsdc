/**
 * Notice / Announcement.
 */
import React, { useState } from 'react';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function NoticePost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Notice headline</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          maxLength={140}
          required
        />
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Details</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          rows={6}
          maxLength={6000}
          required
        />
      </div>
      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={!data.title.trim() || !data.content.trim()}
        onCancel={onCancel}
        label="Post notice"
      />
    </form>
  );
}
