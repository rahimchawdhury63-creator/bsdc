import { useParams } from 'react-router-dom';
import { Spinner } from '@components/ui/Spinner';
import { SEOHead } from '@components/seo/SEOHead';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ProfileHeader } from '@components/profile/ProfileHeader';
import { ProfileAbout } from '@components/profile/ProfileAbout';
import { ProfileFeed } from '@components/profile/ProfileFeed';
import { EditProfileModal } from '@components/profile/EditProfileModal';
import { DeveloperIDCard } from '@components/profile/DeveloperIDCard';

/** Public profile page at /p/:username backed by Firestore users collection. */
export const ProfilePage = () => {
  const { username } = useParams();
  const { firebaseUser } = useAuth();
  const { profile, isLoading, error, updateProfile } = useProfile(username);

  if (isLoading) return <div className="feed-status"><Spinner /></div>;
  if (error) return <div className="feed-status feed-status--error">{error}</div>;
  if (!profile) return <div className="feed-empty"><h1>Profile not found</h1></div>;

  return (
    <div className="profile-page">
      <SEOHead title={`bsdc • ${profile.username}`} description={profile.bio || `${profile.displayName} on Bangladesh Software Development Community`} canonicalPath={`/p/${profile.username}`} image={profile.photoURL || undefined} />
      <ProfileHeader profile={profile} />
      <ProfileAbout profile={profile} />
      <DeveloperIDCard profile={profile} />
      {firebaseUser?.uid === profile.uid ? <EditProfileModal profile={profile} onSave={(payload) => updateProfile(profile.uid, payload)} /> : null}
      <ProfileFeed />
    </div>
  );
};
