/**
 * src/components/profile/ProfileStats.jsx
 * ---------------------------------------------------------------------------
 * Sidebar widget showing rank progress, BSDC Points, badges, achievements.
 * Used on the profile page (right column on desktop, inline on mobile).
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { rankFromPoints, rankProgress, RANKS, formatPoints } from '../../utils/pointsCalculator.js';
import { IconAward, IconCoin, IconStar, IconTrophy } from '../common/Icons.jsx';

export default function ProfileStats({ profile }) {
  if (!profile) return null;
  const rank = rankFromPoints(profile.bsdcPoints || 0);
  const progress = rankProgress(profile.bsdcPoints || 0);
  const idx = RANKS.findIndex((r) => r.id === rank.id);
  const nextRank = RANKS[idx + 1];

  return (
    <div className="bsdc-card">
      <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-mb-md">
        <span style={{
          width: 40, height: 40, borderRadius: 12,
          background: rank.color, color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <IconTrophy size={20} />
        </span>
        <div>
          <div className="bsdc-text-bold">{rank.label} Rank</div>
          <div className="bsdc-text-xs bsdc-text-muted">
            <IconCoin size={12} /> {formatPoints(profile.bsdcPoints || 0)} BSDC Points
          </div>
        </div>
      </div>

      {/* Progress bar to next rank */}
      <div>
        <div className="bsdc-flex bsdc-justify-between bsdc-text-xs bsdc-text-muted">
          <span>{rank.label}</span>
          <span>{nextRank ? nextRank.label : 'Max'}</span>
        </div>
        <div style={{ height: 6, background: 'var(--color-accent)', borderRadius: 4, marginTop: 6 }}>
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: rank.color,
              borderRadius: 4,
              transition: 'width 300ms ease'
            }}
          />
        </div>
        {nextRank && (
          <p className="bsdc-text-xs bsdc-text-muted bsdc-mt-sm">
            {formatPoints(nextRank.min - (profile.bsdcPoints || 0))} more points to {nextRank.label}.
          </p>
        )}
      </div>

      <div className="bsdc-divider" />

      {/* Quick badge row */}
      <div className="bsdc-flex bsdc-gap-sm bsdc-flex-wrap">
        {profile.isVerified && (
          <span className="bsdc-badge bsdc-badge--primary"><IconStar size={12} /> Verified</span>
        )}
        {(profile.postsCount || 0) >= 10 && (
          <span className="bsdc-badge"><IconAward size={12} /> 10+ posts</span>
        )}
        {(profile.followers || 0) >= 100 && (
          <span className="bsdc-badge"><IconAward size={12} /> 100+ followers</span>
        )}
        {(profile.bsdcPoints || 0) >= 1000 && (
          <span className="bsdc-badge"><IconAward size={12} /> 1K club</span>
        )}
      </div>
    </div>
  );
}
