/**
 * src/components/common/TagInput.jsx
 * Simple tag entry — enter / comma to add, X to remove, max cap.
 */
import React, { useState } from 'react';
import { IconX, IconHash } from './Icons.jsx';

export default function TagInput({
  value = [],
  onChange,
  max = 10,
  placeholder = 'Add a tag and press Enter'
}) {
  const [input, setInput] = useState('');

  const add = (raw) => {
    const t = String(raw || input).toLowerCase().trim()
      .replace(/^#/, '')
      .replace(/[^a-z0-9+#.\u0980-\u09ff]/g, '');
    if (!t || value.includes(t) || value.length >= max) {
      setInput('');
      return;
    }
    onChange([...value, t]);
    setInput('');
  };

  const remove = (t) => onChange(value.filter((v) => v !== t));

  return (
    <div>
      <div className="bsdc-flex bsdc-flex-wrap bsdc-gap-xs bsdc-mb-sm">
        {value.map((t) => (
          <span key={t} className="bsdc-chip">
            <IconHash size={12} />{t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => remove(t)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <IconX size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="bsdc-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !input && value.length) {
            remove(value[value.length - 1]);
          }
        }}
        onBlur={() => add()}
        placeholder={placeholder}
        maxLength={24}
        disabled={value.length >= max}
      />
      <p className="bsdc-input-help">{value.length}/{max} tags</p>
    </div>
  );
}
