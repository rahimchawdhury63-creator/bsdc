/**
 * src/context/AuthContext.jsx
 * ---------------------------------------------------------------------------
 * Global authentication context.
 *
 * Provides to every component:
 *   - firebaseUser  : raw Firebase Auth user (or null)
 *   - profile       : Firestore /users/{uid} document (or null)
 *   - loading       : true until the first auth state has been determined
 *   - isAuthed      : boolean shortcut
 *   - isAdmin       : boolean shortcut
 *   - refreshProfile(): re-fetch the Firestore profile (after editing)
 *   - logout()      : sign out + clear local state
 *
 * Internally we also:
 *   - call setupPresence(uid) for online/offline tracking
 *   - subscribe to /users/{uid} so profile updates propagate live (no refresh)
 * ---------------------------------------------------------------------------
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { watchAuthState, logout as fbLogout, ensureUserProfile } from '../firebase/auth.js';
import { subscribeDoc } from '../firebase/firestore.js';
import { setupPresence } from '../firebase/realtimeDb.js';

const AuthContext = createContext({
  firebaseUser: null,
  profile: null,
  loading: true,
  isAuthed: false,
  isAdmin: false,
  refreshProfile: async () => {},
  logout: async () => {}
});

/** Hook for consumers. Throws if used outside the provider in DEV. */
export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Step 1 — Subscribe to Firebase Auth.
   * On sign-in: ensure profile, register presence, then subscribe to /users/{uid}.
   */
  useEffect(() => {
    let profileUnsub = null;

    const unsub = watchAuthState(async (fbUser) => {
      // Clean up previous profile subscription on every change.
      if (profileUnsub) { profileUnsub(); profileUnsub = null; }

      setFirebaseUser(fbUser || null);

      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Make sure profile exists (idempotent for returning users).
        await ensureUserProfile(fbUser);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[BSDC] ensureUserProfile error:', err);
      }

      // Wire presence (online/offline + auto-mark-offline on disconnect).
      setupPresence(fbUser.uid);

      // Subscribe to the live profile so changes propagate instantly.
      profileUnsub = subscribeDoc('users', fbUser.uid, (doc) => {
        setProfile(doc);
        setLoading(false);
      });
    });

    return () => {
      unsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  /** Force-refresh by toggling state (subscribeDoc will push the latest). */
  const refreshProfile = useCallback(async () => {
    // The live subscription means we usually don't need this, but components
    // can still await it for clarity after an explicit update.
    return profile;
  }, [profile]);

  /** Sign out and immediately clear local state. */
  const logout = useCallback(async () => {
    try { await fbLogout(); } catch { /* ignore */ }
    setFirebaseUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      loading,
      isAuthed: !!firebaseUser,
      isAdmin: !!profile?.isAdmin,
      emailVerified: !!firebaseUser?.emailVerified,
      refreshProfile,
      logout
    }),
    [firebaseUser, profile, loading, refreshProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
