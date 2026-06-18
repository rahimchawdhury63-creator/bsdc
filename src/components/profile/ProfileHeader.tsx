import type { BSDCUser } from '@/types';
import { VerifiedBadge } from './VerifiedBadge';
import { ProfileStats } from './ProfileStats';
import { FollowButton } from './FollowButton';

/** Public profile header with banner, avatar, identity, and counters. */
export const ProfileHeader = ({ profile }: { readonly profile: BSDCUser }) => (
  <header className="profile-header">
    <div className="profile-banner">{profile.bannerURL ? <img src={profile.bannerURL} alt={`${profile.displayName} profile banner`} loading="lazy" /> : null}</div>
    <div className="profile-header__body">
      <div className="profile-avatar">{profile.photoURL ? <img src={profile.photoURL} alt={`${profile.displayName} avatar`} loading="lazy" /> : profile.displayName.slice(0, 1).toUpperCase()}</div>
      <div className="profile-identity">
        <h1>{profile.displayName}</h1>
        <p className="text-muted">bsdc • {profile.username}</p>
        {profile.isVerified ? <VerifiedBadge /> : null}
        {profile.title ? <p>{profile.title}</p> : null}
      </div>
      <FollowButton targetUserId={profile.uid} />
    </div>
    <ProfileStats profile={profile} />
  </header>
);
