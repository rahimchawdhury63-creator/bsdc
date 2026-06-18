import { useState } from 'react';
import { toggleFollow } from '@/services/profile.service';

/** Small hook that performs real follow/unfollow writes in Firestore. */
export const useFollow = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async (followerId: string, followingId: string) => {
    setIsSaving(true);
    const result = await toggleFollow(followerId, followingId);
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    setError(null);
    return result.data;
  };

  return { toggle, isSaving, error };
};
