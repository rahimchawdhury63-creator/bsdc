/**
 * Q&A Post — Quora/StackOverflow style question.
 * Emits FAQPage JSON-LD on the post page (handled by SEOHead in Response 8).
 */
import React, { useState } from 'react';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function QAPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Your question</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          placeholder="e.g. How do I deploy a Next.js app to Cloudflare Pages?"
          maxLength={160}
          required
        />
        <p className="bsdc-input-help">Phrase as a complete question for best answers + SEO.</p>
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Details</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          placeholder="What have you tried? What's the expected behaviour?"
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
        label="Ask question"
      />
    </form>
  );
}
