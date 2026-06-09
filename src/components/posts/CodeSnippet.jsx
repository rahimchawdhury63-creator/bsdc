/**
 * Code Snippet — language + code + optional explanation.
 * SoftwareSourceCode schema emitted on the post page.
 */
import React, { useState } from 'react';
import CodeEditor from '../common/CodeEditor.jsx';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function CodeSnippet({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', codeLanguage: 'javascript', codeContent: '',
    tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Title</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          placeholder="e.g. Debounce hook in React"
          maxLength={120}
          required
        />
      </div>

      <CodeEditor
        value={data.codeContent}
        onChange={(v) => change('codeContent', v)}
        language={data.codeLanguage}
        onLanguageChange={(v) => change('codeLanguage', v)}
        rows={12}
      />

      <div className="bsdc-input-group bsdc-mt-md">
        <label className="bsdc-input-label">Explanation (optional)</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          placeholder="How does this work? When would you use it?"
          rows={4}
          maxLength={4000}
        />
      </div>

      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={!data.title.trim() || !data.codeContent.trim()}
        onCancel={onCancel}
        label="Share snippet"
      />
    </form>
  );
}
