/**
 * src/components/common/Avatar.jsx
 * ---------------------------------------------------------------------------
 * Reusable avatar with image fallback to initials.
 *
 * Variants: xs | sm | md (default) | lg | xl | xxl
 * Optional: showStatus (online dot), verified (blue check)
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { IconVerified } from './Icons.jsx';

export default function Avatar({
  src,
  name = '',
  size = 'md',
  showStatus = false,
  isOnline = false,
  isVerified = false,
  className = '',
  alt
}) {
  const sizeClass = size && size !== 'md' ? `bsdc-avatar--${size}` : '';
  const initials = (name || 'B').split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join('') || 'B';

  return (
    <span className={`bsdc-avatar ${sizeClass} ${className}`.trim()} aria-hidden={alt ? undefined : true}>
      {src
        ? <img src={src} alt={alt || name || 'avatar'} loading="lazy" />
        : initials}
      {showStatus && (
        <span
          className={`bsdc-avatar__status ${isOnline ? 'bsdc-avatar__status--online' : ''}`}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
      {isVerified && (
        <span
          className="bsdc-verified-badge"
          style={{ position: 'absolute', bottom: -2, right: -2, background: '#fff', borderRadius: '50%' }}
          aria-label="Verified"
        >
          <IconVerified size={14} />
        </span>
      )}
    </span>
  );
}
