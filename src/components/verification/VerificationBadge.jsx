/**
 * src/components/verification/VerificationBadge.jsx
 * Tiny blue check badge shown next to verified user names.
 */
import React from 'react';
import { IconVerified } from '../common/Icons.jsx';

export default function VerificationBadge({ size = 16 }) {
  return (
    <span className="bsdc-verified-badge" aria-label="Verified BSDC member" title="Verified BSDC member">
      <IconVerified size={size} />
    </span>
  );
}
