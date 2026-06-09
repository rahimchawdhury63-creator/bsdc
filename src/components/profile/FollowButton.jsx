/**
 * src/components/profile/FollowButton.jsx
 * ---------------------------------------------------------------------------
 * Real follow button — connects to Firestore via toggleFollow().
 *
 * Visual states:
 *   - "Follow"       : not following yet
 *   - "Following"    : already following (hover shows "Unfollow")
 *   - "Sign in to follow" : when meUid is null
 *
 * Updates the local "following" flag immediately for snappy UX, then
 * reconciles with the backend response. Reverts on error.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleFollow, isFollowing } from '../../firebase/firestore.js';
import { awardPoints } from '../../firebase/points.js';
import { useAuth } from '../../hooks/useAuth.js';
import { notifyFollow } from '../../utils/notificationSender.js';
import { POINTS_RULES } from '../../utils/pointsCalculator.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import { IconUserPlus, IconUserCheck } from '../common/Icons.jsx';

export default function FollowButton({ meUid, themUid, size = 'md', onChange }) {
  const { profile: meProfile } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);

  // Initial state check.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!meUid || !themUid || meUid === themUid) {
        setLoading(false);
        return;
      }
      try {
        const yes = await isFollowing(meUid, themUid);
        if (!cancelled) {
          setFollowing(yes);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [meUid, themUid]);

  // Self → no button at all.
  if (meUid && themUid && meUid === themUid) return null;

  // Signed-out users see a "sign in" prompt.
  if (!meUid) {
    return (
      <Link
        to={`/login?next=${encodeURIComponent(window.location.pathname)}`}
        className={`bsdc-btn bsdc-btn--outline ${size === 'sm' ? 'bsdc-btn--sm' : ''}`}
      >
        <IconUserPlus size={16} /> Follow
      </Link>
    );
  }

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    const prev = following;
    setFollowing(!prev); // optimistic
    try {
      const res = await toggleFollow(meUid, themUid);
      setFollowing(res.following);
      if (onChange) onChange(res.following);
      // Side-effects on FOLLOW (skip on UNFOLLOW).
      if (res.following && meProfile) {
        notifyFollow({ toUid: themUid, fromUser: meProfile });
        awardPoints(themUid, POINTS_RULES.follower, `new follower @${meProfile.username}`).catch(() => {});
      }
    } catch (err) {
      setFollowing(prev);
      toast.error(err?.message || 'Could not update follow state.');
    } finally {
      setBusy(false);
    }
  };

  const sizeClass = size === 'sm' ? 'bsdc-btn--sm' : '';
  const variant = following
    ? (hover ? 'bsdc-btn--danger' : 'bsdc-btn--secondary')
    : 'bsdc-btn--primary';

  return (
    <button
      type="button"
      className={`bsdc-btn ${variant} ${sizeClass}`}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={loading || busy}
      aria-pressed={following}
    >
      {busy
        ? <Spinner size="sm" />
        : following
          ? (hover ? 'Unfollow' : <><IconUserCheck size={16} /> Following</>)
          : <><IconUserPlus size={16} /> Follow</>}
    </button>
  );
}
