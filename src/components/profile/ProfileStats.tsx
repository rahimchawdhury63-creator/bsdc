import type { BSDCUser } from '@/types';

/** Displays public profile counters stored in Firestore users/{uid}. */
export const ProfileStats = ({ profile }: { readonly profile: BSDCUser }) => (
  <dl className="profile-stats">
    <div><dt>Posts</dt><dd>{profile.postsCount}</dd></div>
    <div><dt>Followers</dt><dd>{profile.followersCount}</dd></div>
    <div><dt>Following</dt><dd>{profile.followingCount}</dd></div>
    <div><dt>BSDC Points</dt><dd>{profile.bsdcPoints}</dd></div>
  </dl>
);
