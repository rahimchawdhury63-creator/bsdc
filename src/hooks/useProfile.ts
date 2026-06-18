import { useCallback, useEffect, useState } from 'react';
import { getProfileByUsername, updateProfileDocument, type UpdateProfilePayload } from '@/services/profile.service';
import type { BSDCUser } from '@/types';

/** Hook return object for public profile pages and edit flows. */
export interface UseProfileResult {
  readonly profile: BSDCUser | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly updateProfile: (uid: string, payload: UpdateProfilePayload) => Promise<boolean>;
  readonly reload: () => Promise<void>;
}

/** Loads a real Firestore profile by username and exposes update helpers. */
export const useProfile = (username?: string): UseProfileResult => {
  const [profile, setProfile] = useState<BSDCUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(username));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);
    const result = await getProfileByUsername(username);
    setIsLoading(false);
    if (result.ok) {
      setProfile(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
  }, [username]);

  useEffect(() => { void reload(); }, [reload]);

  const updateProfile = useCallback(async (uid: string, payload: UpdateProfilePayload) => {
    const result = await updateProfileDocument(uid, payload);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    await reload();
    return true;
  }, [reload]);

  return { profile, isLoading, error, updateProfile, reload };
};
