import { useEffect } from 'react';
import { subscribeToAuthProfile } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

/**
 * Subscribes once to Firebase Auth and synchronizes the Zustand auth store.
 * Rendering null keeps this component invisible while still enabling every route
 * guard and navigation item to react to real authentication state changes.
 */
export const AuthStateListener = () => {
  const setAuthState = useAuthStore((state) => state.setAuthState);
  const setError = useAuthStore((state) => state.setError);

  useEffect(() => {
    const unsubscribe = subscribeToAuthProfile(
      (authProfile) => {
        if (!authProfile) {
          setAuthState(null, null);
          return;
        }
        setAuthState(authProfile.firebaseUser, authProfile.profile);
      },
      (message) => setError(message)
    );

    return () => unsubscribe();
  }, [setAuthState, setError]);

  return null;
};
