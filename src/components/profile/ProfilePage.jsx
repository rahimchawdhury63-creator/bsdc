/**
 * src/components/profile/ProfilePage.jsx
 * ---------------------------------------------------------------------------
 * Route: /p/:username
 *
 * Orchestrates header + stats + feed + SEO. Handles:
 *   - Loading state
 *   - Username-not-found state (shows 404 message + suggestions)
 *   - "Edit profile" modal trigger (only on own profile)
 *   - "Message" deep link to /messages?with=<uid>
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserByUsername } from '../../firebase/firestore.js';
import { useAuth } from '../../hooks/useAuth.js';
import ProfileHeader from './ProfileHeader.jsx';
import ProfileFeed from './ProfileFeed.jsx';
import ProfileStats from './ProfileStats.jsx';
import ProfileSEO from './ProfileSEO.jsx';
import EditProfile from './EditProfile.jsx';
import { LoadingCenter } from '../common/Spinner.jsx';
import { IconUser } from '../common/Icons.jsx';

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { profile: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const u = await getUserByUsername(String(username).toLowerCase());
        if (!cancelled) {
          setProfile(u);
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setProfile(null); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [username]);

  if (loading) return <LoadingCenter label="Loading profile…" />;

  if (!profile) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__icon"><IconUser /></div>
        <div className="bsdc-empty__title">No profile for @{username}</div>
        <div className="bsdc-empty__body">
          The user may have changed their username or deleted their account.
        </div>
        <Link to="/" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">Back to home</Link>
      </div>
    );
  }

  return (
    <>
      <ProfileSEO profile={profile} />
      <ProfileHeader
        profile={profile}
        currentUser={me}
        onEdit={() => setEditOpen(true)}
        onMessage={() => navigate(`/messages?with=${profile.uid}`)}
      />

      {/* Mobile: stats above feed; desktop: ProfileStats lives in a side column
          rendered by the parent layout. For simplicity we always render it
          inline here and let pages decide whether to keep it. */}
      <div className="bsdc-mt-md">
        <ProfileStats profile={profile} />
      </div>

      <ProfileFeed profile={profile} />

      {editOpen && me && me.uid === profile.uid && (
        <EditProfile
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            // Live subscription updates the profile automatically, but we
            // also re-fetch in case the user changed their banner.
            getUserByUsername(username).then((u) => u && setProfile(u));
          }}
        />
      )}
    </>
  );
}
