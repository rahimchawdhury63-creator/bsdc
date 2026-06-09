/**
 * Documentation Post — TechArticle schema. Like BlogPost but signals tech docs.
 */
import React, { useState } from 'react';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function DocPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Document title</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          placeholder="e.g. REST API reference"
          maxLength={120}
          required
        />
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Content (Markdown)</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          placeholder={'# Endpoint: GET /users\n\nReturns a paginated list of users.\n\n## Query parameters\n- `limit` (int)\n- `cursor` (string)\n\n## Example response\n```json\n{ "items": [] }\n```'}
          rows={14}
          maxLength={60000}
          required
        />
      </div>
      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={!data.title.trim() || !data.content.trim()}
        onCancel={onCancel}
        label="Publish docs"
      />
    </form>
  );
}
