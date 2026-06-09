/**
 * src/components/profile/ProfileHeader.jsx
 * ---------------------------------------------------------------------------
 * The banner + avatar + bio + meta + stats + action buttons block at the
 * top of every profile page.
 *
 * Pure presentational component — receives all data via props.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar.jsx';
import FollowButton from './FollowButton.jsx';
import VerificationBadge from '../verification/VerificationBadge.jsx';
import {
  IconMapPin, IconLink, IconGithub, IconLinkedin, IconTwitter,
  IconCalendar, IconEdit, IconMessage, IconCoin, IconAward
} from '../common/Icons.jsx';
import { rankFromPoints, formatPoints } from '../../utils/pointsCalculator.js';

export default function ProfileHeader({
  profile,
  currentUser,
  onEdit,
  onMessage
}) {
  if (!profile) return null;

  const isMe = currentUser && currentUser.uid === profile.uid;
  const rank = rankFromPoints(profile.bsdcPoints || 0);
  const joinedDate = formatJoined(profile.createdAt);

  return (
    <div className="bsdc-profile bsdc-anim-fade-in">
      {/* Banner */}
      <div
        className="bsdc-profile__banner"
        style={profile.bannerURL ? { backgroundImage: `url(${profile.bannerURL})` } : undefined}
        aria-hidden="true"
      />

      {/* Body */}
      <div className="bsdc-profile__header">
        <div className="bsdc-profile__avatar">
          <Avatar src={profile.photoURL} name={profile.displayName} size="xxl" />
        </div>

        <div className="bsdc-profile__name-row">
          <h1 className="bsdc-profile__name">
            {profile.displayName || profile.username}
            {profile.isVerified && <VerificationBadge size={20} />}
          </h1>
          <span className="bsdc-profile__username">@{profile.username}</span>
          <span className="bsdc-badge" style={{ background: rank.color, color: '#fff' }}>
            <IconAward size={12} /> {rank.label}
          </span>
        </div>

        {profile.title && <div className="bsdc-profile__title">{profile.title}</div>}
        {profile.bio && <p className="bsdc-profile__bio">{profile.bio}</p>}

        {/* Meta strip */}
        <div className="bsdc-profile__meta">
          {profile.location && (
            <span className="bsdc-profile__meta-item"><IconMapPin size={14} /> {profile.location}</span>
          )}
          {profile.socialLinks?.website && (
            <a
              href={profile.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bsdc-profile__meta-item bsdc-text-primary"
            >
              <IconLink size={14} /> {humanHost(profile.socialLinks.website)}
            </a>
          )}
          {profile.socialLinks?.github && (
            <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="bsdc-profile__meta-item">
              <IconGithub size={14} /> GitHub
            </a>
          )}
          {profile.socialLinks?.linkedin && (
            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="bsdc-profile__meta-item">
              <IconLinkedin size={14} /> LinkedIn
            </a>
          )}
          {profile.socialLinks?.twitter && (
            <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="bsdc-profile__meta-item">
              <IconTwitter size={14} /> Twitter
            </a>
          )}
          {joinedDate && (
            <span className="bsdc-profile__meta-item"><IconCalendar size={14} /> Joined {joinedDate}</span>
          )}
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bsdc-flex bsdc-flex-wrap bsdc-gap-xs bsdc-mt-md">
            {profile.skills.slice(0, 12).map((s) => (
              <Link key={s} to={`/tags/${encodeURIComponent(s)}`} className="bsdc-chip">#{s}</Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="bsdc-profile__stats">
          <Link to={`/p/${profile.username}/followers`} className="bsdc-profile__stat">
            <div className="bsdc-profile__stat-num">{formatPoints(profile.followers || 0)}</div>
            <div className="bsdc-profile__stat-label">Followers</div>
          </Link>
          <Link to={`/p/${profile.username}/following`} className="bsdc-profile__stat">
            <div className="bsdc-profile__stat-num">{formatPoints(profile.following || 0)}</div>
            <div className="bsdc-profile__stat-label">Following</div>
          </Link>
          <div className="bsdc-profile__stat">
            <div className="bsdc-profile__stat-num">{formatPoints(profile.postsCount || 0)}</div>
            <div className="bsdc-profile__stat-label">Posts</div>
          </div>
          <div className="bsdc-profile__stat">
            <div className="bsdc-profile__stat-num" style={{ color: 'var(--color-primary)' }}>
              <IconCoin size={16} /> {formatPoints(profile.bsdcPoints || 0)}
            </div>
            <div className="bsdc-profile__stat-label">BSDC Points</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bsdc-profile__actions">
          {isMe ? (
            <>
              <button type="button" className="bsdc-btn bsdc-btn--primary" onClick={onEdit}>
                <IconEdit size={16} /> Edit profile
              </button>
              <Link to="/points" className="bsdc-btn bsdc-btn--outline">
                <IconCoin size={16} /> Points dashboard
              </Link>
            </>
          ) : (
            <>
              <FollowButton meUid={currentUser?.uid} themUid={profile.uid} />
              <button
                type="button"
                className="bsdc-btn bsdc-btn--outline"
                onClick={onMessage}
                disabled={!currentUser}
              >
                <IconMessage size={16} /> Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Strip protocol + trailing slash for a clean display. */
function humanHost(url) {
  try { return new URL(url).host.replace(/^www\./, ''); }
  catch { return url; }
}

/** Format Firestore timestamp into "Mar 2024". */
function formatJoined(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
}
