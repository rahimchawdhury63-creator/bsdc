import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import type { BSDCUser } from '@/types';

/** Inline profile editor form for owner profile updates. */
export const EditProfileModal = ({ profile, onSave }: { readonly profile: BSDCUser; readonly onSave: (payload: { displayName: string; bio: string; title: string; location: string; website: string }) => Promise<boolean> }) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [title, setTitle] = useState(profile.title);
  const [location, setLocation] = useState(profile.location);
  const [website, setWebsite] = useState(profile.website);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    const ok = await onSave({ displayName, bio, title, location, website });
    setMessage(ok ? 'Profile updated.' : 'Unable to update profile.');
  };

  return (
    <section className="profile-card" aria-labelledby="edit-profile-title">
      <h2 id="edit-profile-title">Edit profile</h2>
      <div className="auth-form">
        <Input id="profile-display-name" label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        <Input id="profile-title" label="Professional title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input id="profile-location" label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
        <Input id="profile-website" label="Website" value={website} onChange={(event) => setWebsite(event.target.value)} />
        <textarea className="form-input" rows={4} value={bio} onChange={(event) => setBio(event.target.value)} />
        <Button type="button" onClick={() => void submit()}>Save profile</Button>
        {message ? <p className="form-helper">{message}</p> : null}
      </div>
    </section>
  );
};
