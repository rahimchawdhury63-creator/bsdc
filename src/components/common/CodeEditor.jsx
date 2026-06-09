/**
 * src/components/common/CodeEditor.jsx
 * Minimal multi-line code editor (textarea with monospace styling).
 *
 * We deliberately avoid heavy syntax highlighters in the editor (they hurt
 * mobile performance). Read-only display uses react-syntax-highlighter
 * inside CodeSnippetView.
 */

import React from 'react';

const LANGUAGES = [
  'javascript','typescript','jsx','tsx','python','java','kotlin','swift',
  'cpp','c','csharp','go','rust','ruby','php','html','css','scss','sql',
  'bash','json','yaml','markdown','dart','elixir','dockerfile','plaintext'
];

export default function CodeEditor({
  value, onChange,
  language = 'javascript', onLanguageChange,
  rows = 10
}) {
  return (
    <div>
      <div className="bsdc-flex bsdc-items-center bsdc-justify-between bsdc-mb-sm">
        <label className="bsdc-input-label" style={{ margin: 0 }}>Code</label>
        <select
          className="bsdc-select"
          style={{ maxWidth: 180, minHeight: 32, padding: '4px 8px' }}
          value={language}
          onChange={(e) => onLanguageChange?.(e.target.value)}
        >
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <textarea
        className="bsdc-textarea"
        style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.55 }}
        spellCheck="false"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`// Paste your ${language} snippet here…`}
        onKeyDown={(e) => {
          // Tab inserts 2 spaces instead of jumping focus.
          if (e.key === 'Tab') {
            e.preventDefault();
            const ta = e.currentTarget;
            const s = ta.selectionStart;
            const next = ta.value.slice(0, s) + '  ' + ta.value.slice(ta.selectionEnd);
            onChange(next);
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
          }
        }}
      />
    </div>
  );
}
