/**
 * src/components/layout/RightSidebar.jsx
 * ---------------------------------------------------------------------------
 * Right sidebar — visible from 1280px+. Shows:
 *   - Trending tags
 *   - Suggested users to follow
 *   - Live community stats (online users, total posts)
 *
 * Data props are passed in by Layout.jsx; component itself is pure and
 * has no Firebase calls (testable + reusable).
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  IconTrending, IconUserPlus, IconUsers, IconFire, IconVerified
} from '../common/Icons.jsx';
import FollowButton from '../profile/FollowButton.jsx'; // arrives in Response 3

/**
 * @param {Object} props
 * @param {Array}  [props.trendingTags]    - [{ tag, count }]
 * @param {Array}  [props.suggestedUsers]  - [{ uid, username, displayName, photoURL, title, isVerified }]
 * @param {Object} [props.liveCounters]    - { onlineUsers, totalPosts, totalUsers }
 * @param {Object} [props.currentUser]     - to disable "Follow" on yourself
 */
export default function RightSidebar({
  trendingTags = [],
  suggestedUsers = [],
  liveCounters = null,
  currentUser = null
}) {
  return (
    <aside className="bsdc-right-sidebar" aria-label="Discover and stats">
      {/* Live counters */}
      {liveCounters && (
        <div className="bsdc-suggestion-card">
          <h3 className="bsdc-suggestion-card__title">
            <IconUsers size={16} /> Community Pulse
          </h3>
          <div className="bsdc-flex bsdc-justify-between bsdc-mt-sm">
            <PulseStat label="Online now" value={liveCounters.onlineUsers || 0} dot />
            <PulseStat label="Total members" value={formatNumber(liveCounters.totalUsers || 0)} />
            <PulseStat label="Total posts" value={formatNumber(liveCounters.totalPosts || 0)} />
          </div>
        </div>
      )}

      {/* Trending */}
      <div className="bsdc-suggestion-card">
        <h3 className="bsdc-suggestion-card__title">
          <IconTrending size={16} /> Trending in Bangladesh
        </h3>
        {trendingTags.length === 0 ? (
          <p className="bsdc-text-muted bsdc-text-sm bsdc-mt-sm">
            No trends right now. Be the first to start one.
          </p>
        ) : (
          trendingTags.slice(0, 6).map((t) => (
            <Link key={t.tag} to={`/tags/${encodeURIComponent(t.tag)}`} className="bsdc-trending-tag">
              <div>
                <div className="bsdc-trending-tag__name">#{t.tag}</div>
                <div className="bsdc-trending-tag__count">{formatNumber(t.count)} posts</div>
              </div>
              <IconFire size={16} color="#f57c00" />
            </Link>
          ))
        )}
      </div>

      {/* Suggested users */}
      <div className="bsdc-suggestion-card">
        <h3 className="bsdc-suggestion-card__title">
          <IconUserPlus size={16} /> Who to follow
        </h3>
        {suggestedUsers.length === 0 ? (
          <p className="bsdc-text-muted bsdc-text-sm bsdc-mt-sm">
            Discover more developers as the community grows.
          </p>
        ) : (
          suggestedUsers.slice(0, 5).map((u) => (
            <div key={u.uid} className="bsdc-suggestion-item">
              <Link to={`/p/${u.username}`}>
                <span className="bsdc-avatar bsdc-avatar--sm">
                  {u.photoURL
                    ? <img src={u.photoURL} alt="" loading="lazy" />
                    : (u.displayName || u.username || 'U').slice(0, 1).toUpperCase()}
                </span>
              </Link>
              <div className="bsdc-suggestion-item__body">
                <div className="bsdc-suggestion-item__name">
                  <Link to={`/p/${u.username}`}>{u.displayName || u.username}</Link>
                  {u.isVerified && (
                    <span className="bsdc-verified-badge" aria-label="Verified">
                      <IconVerified size={12} />
                    </span>
                  )}
                </div>
                <div className="bsdc-suggestion-item__sub">@{u.username}</div>
              </div>
              {currentUser && currentUser.uid !== u.uid && (
                <FollowButton
                  meUid={currentUser.uid}
                  themUid={u.uid}
                  size="sm"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer mini-links (legal etc.) */}
      <nav className="bsdc-suggestion-card" aria-label="Footer links">
        <div className="bsdc-flex bsdc-flex-wrap bsdc-gap-sm bsdc-text-xs bsdc-text-muted">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/about#contact">Contact</Link>
          <span>© {new Date().getFullYear()} BSDC</span>
        </div>
      </nav>
    </aside>
  );
}

/** Internal sub-component for the live pulse strip. */
function PulseStat({ label, value, dot }) {
  return (
    <div className="bsdc-text-center">
      <div className="bsdc-flex bsdc-items-center bsdc-justify-center bsdc-gap-xs">
        {dot && <span className="bsdc-badge--dot bsdc-badge bsdc-badge--success bsdc-anim-glow" />}
        <span className="bsdc-text-bold">{value}</span>
      </div>
      <div className="bsdc-text-xs bsdc-text-muted">{label}</div>
    </div>
  );
}

/** Pretty-print large numbers: 1500 → "1.5K". */
function formatNumber(n) {
  if (typeof n !== 'number') n = Number(n) || 0;
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}
