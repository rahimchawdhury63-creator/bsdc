import type { BSDCUser } from '@/types';

/** About card showing real profile fields only when the user has provided them. */
export const ProfileAbout = ({ profile }: { readonly profile: BSDCUser }) => (
  <section className="profile-card" aria-labelledby="profile-about-title">
    <h2 id="profile-about-title">About</h2>
    {profile.bio ? <p>{profile.bio}</p> : <p className="text-muted">This developer has not added a bio yet.</p>}
    {profile.location ? <p><strong>Location:</strong> {profile.location}</p> : null}
    {profile.website ? <p><strong>Website:</strong> <a href={profile.website} rel="noreferrer" target="_blank">{profile.website}</a></p> : null}
  </section>
);
