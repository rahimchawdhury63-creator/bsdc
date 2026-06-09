/**
 * Poll Post — 2-6 options. Vote counts stored on the post doc.
 */
import React, { useState } from 'react';
import { MetaStrip, SubmitBar } from './_formShell.jsx';
import { IconPlus, IconX } from '../common/Icons.jsx';

export default function PollPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', tags: [], language: 'en', privacy: 'public',
    pollOptions: [{ text: '', votes: 0 }, { text: '', votes: 0 }]
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const setOption = (i, text) => {
    const next = [...data.pollOptions];
    next[i] = { ...next[i], text };
    change('pollOptions', next);
  };
  const addOption = () => {
    if (data.pollOptions.length >= 6) return;
    change('pollOptions', [...data.pollOptions, { text: '', votes: 0 }]);
  };
  const removeOption = (i) => {
    if (data.pollOptions.length <= 2) return;
    const next = [...data.pollOptions];
    next.splice(i, 1);
    change('pollOptions', next);
  };

  const valid = data.title.trim() && data.pollOptions.every((o) => o.text.trim());

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Question</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          maxLength={160}
          required
        />
      </div>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Options ({data.pollOptions.length}/6)</label>
        {data.pollOptions.map((opt, i) => (
          <div key={i} className="bsdc-flex bsdc-gap-sm" style={{ marginBottom: 6 }}>
            <input
              type="text"
              className="bsdc-input"
              value={opt.text}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              maxLength={80}
              required
            />
            {data.pollOptions.length > 2 && (
              <button
                type="button"
                className="bsdc-icon-btn"
                onClick={() => removeOption(i)}
                aria-label={`Remove option ${i + 1}`}
              >
                <IconX size={16} />
              </button>
            )}
          </div>
        ))}
        {data.pollOptions.length < 6 && (
          <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm" onClick={addOption}>
            <IconPlus size={14} /> Add option
          </button>
        )}
      </div>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Context (optional)</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          rows={3}
          maxLength={2000}
        />
      </div>

      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={!valid}
        onCancel={onCancel}
        label="Launch poll"
      />
    </form>
  );
}
