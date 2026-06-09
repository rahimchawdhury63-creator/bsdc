/**
 * src/components/posts/_formShell.jsx
 * ---------------------------------------------------------------------------
 * Reusable bits for every post-type sub-form: the bottom action bar with
 * Cancel + Submit, plus a tag/community/location strip.
 *
 * Each sub-form returns its own JSX but pulls these helpers to stay DRY.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import TagInput from '../common/TagInput.jsx';
import Spinner from '../common/Spinner.jsx';
import { IconMapPin, IconHash, IconUsers, IconGlobe } from '../common/Icons.jsx';

/** Shared metadata strip (tags + community + location + language). */
export function MetaStrip({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="bsdc-mt-md">
      <div className="bsdc-input-group">
        <label className="bsdc-input-label"><IconHash size={14} /> Tags</label>
        <TagInput value={value.tags || []} onChange={(t) => set('tags', t)} max={10} />
      </div>

      <div className="bsdc-grid-2">
        <div className="bsdc-input-group">
          <label className="bsdc-input-label"><IconUsers size={14} /> Community (optional)</label>
          <input
            type="text"
            className="bsdc-input"
            value={value.community || ''}
            onChange={(e) => set('community', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="e.g. nextjs-bd"
            maxLength={40}
          />
        </div>
        <div className="bsdc-input-group">
          <label className="bsdc-input-label"><IconMapPin size={14} /> Location (optional)</label>
          <input
            type="text"
            className="bsdc-input"
            value={value.location || ''}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Dhaka, Bangladesh"
            maxLength={60}
          />
        </div>
      </div>

      <div className="bsdc-grid-2">
        <div className="bsdc-input-group">
          <label className="bsdc-input-label"><IconGlobe size={14} /> Language</label>
          <select
            className="bsdc-select"
            value={value.language || 'en'}
            onChange={(e) => set('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="bn">বাংলা (Bangla)</option>
          </select>
        </div>
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Privacy</label>
          <select
            className="bsdc-select"
            value={value.privacy || 'public'}
            onChange={(e) => set('privacy', e.target.value)}
          >
            <option value="public">Public (anyone can see)</option>
            <option value="followers">Followers only</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/** Bottom submit/cancel bar. */
export function SubmitBar({ submitting, disabled, onCancel, label = 'Publish' }) {
  return (
    <div className="bsdc-flex bsdc-justify-end bsdc-gap-sm bsdc-mt-md">
      <button type="button" className="bsdc-btn bsdc-btn--ghost" onClick={onCancel} disabled={submitting}>
        Cancel
      </button>
      <button type="submit" className="bsdc-btn bsdc-btn--primary" disabled={submitting || disabled}>
        {submitting && <Spinner size="sm" />} {label}
      </button>
    </div>
  );
}
