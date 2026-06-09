/**
 * src/components/common/Spinner.jsx
 * Spinner + Loading wrapper.
 */
import React from 'react';

export default function Spinner({ size = 'md', label }) {
  const cls = size === 'sm' ? 'bsdc-spinner--sm' : size === 'lg' ? 'bsdc-spinner--lg' : '';
  return (
    <span role="status" aria-label={label || 'Loading'}>
      <span className={`bsdc-spinner ${cls}`} />
      {label && <span className="bsdc-sr-only">{label}</span>}
    </span>
  );
}

export function LoadingCenter({ label = 'Loading…' }) {
  return (
    <div className="bsdc-loading-center">
      <Spinner /> <span>{label}</span>
    </div>
  );
}
