import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  auth,
  db,
  onAuthStateChanged,
  googleProvider,
  githubProvider,
  yahooProvider,
} from './firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

const AuthContext = createContext(null);

/* ═══════════════════════════════════════════
   PROVIDER MAPPING
═══════════════════════════════════════════ */
const PROVIDER_MAP = {
  'google.com': { instance: googleProvider, name: 'Google',  color: '#4285F4' },
  'github.com': { instance: githubProvider, name: 'GitHub',  color: '#333333' },
  'yahoo.com':  { instance: yahooProvider,  name: 'Yahoo',   color: '#6001D2' },
  'password':   { instance: null,           name: 'Email',   color: '#006A4E' },
};

function getProviderName(id) {
  return (PROVIDER_MAP[id] && PROVIDER_MAP[id].name) || id;
}

function getProviderInstance(id) {
  return (PROVIDER_MAP[id] && PROVIDER_MAP[id].instance) || googleProvider;
}

/* ═══════════════════════════════════════════
   CREATE/UPDATE USER PROFILE — RESILIENT
═══════════════════════════════════════════ */
async function ensureUserProfile(user, extraData = {}) {
  if (!user || !user.uid) return null;

  try {
    const ref  = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // Create new profile
      const profileData = {
        uid:         user.uid,
        displayName: user.displayName || extraData.displayName || (user.email ? user.email.split('@')[0] : 'Developer'),
        email:       user.email || '',
        photoURL:    user.photoURL || '',
        bio:         '',
        skills:      [],
        github:      '',
        linkedin:    '',
        website:     '',
        location:    'Bangladesh',
        role:        'member',
        reputation:  0,
        postCount:   0,
        joinedAt:    serverTimestamp(),
        updatedAt:   serverTimestamp(),
        ...extraData,
      };
      await setDoc(ref, profileData);
      return profileData;
    } else {
      // Update existing — non-blocking sync
      const updates = { updatedAt: serverTimestamp() };

      // Sync photo if changed
      if (user.photoURL && !snap.data().photoURL) {
        updates.photoURL = user.photoURL;
      }
      // Sync display name if missing
      if (user.displayName && !snap.data().displayName) {
        updates.displayName = user.displayName;
      }

      if (Object.keys(updates).length > 1) {
        await updateDoc(ref, updates).catch(e => console.warn('Profile sync skipped:', e.message));
      }

      return snap.data();
    }
  } catch (err) {
    console.warn('Profile creation skipped (non-critical):', err.message);
    return null;
  }
}

/* ═══════════════════════════════════════════
   PARSE FIREBASE AUTH ERRORS
═══════════════════════════════════════════ */
export function parseAuthError(err) {
  if (!err) return 'An unknown error occurred. Please try again.';

  const code = err.code || '';

  const messages = {
    'auth/user-not-found':              'No account found with this email. Try registering instead.',
    'auth/wrong-password':              'Incorrect password. Please try again.',
    'auth/invalid-email':               'Please enter a valid email address.',
    'auth/email-already-in-use':        'This email is already registered. Try signing in.',
    'auth/weak-password':               'Password must be at least 6 characters.',
    'auth/invalid-credential':          'Invalid email or password. Please try again.',
    'auth/too-many-requests':           'Too many attempts. Please wait a few minutes.',
    'auth/popup-closed-by-user':        '',  // silent — user just closed
    'auth/cancelled-popup-request':     '',  // silent
    'auth/popup-blocked':               'Popup blocked. Please allow popups for this site.',
    'auth/network-request-failed':      'Network error. Please check your internet connection.',
    'auth/operation-not-allowed':       'This sign-in method is not enabled.',
    'auth/user-disabled':               'This account has been disabled.',
    'auth/requires-recent-login':       'Please sign in again to continue.',
    'auth/account-exists-with-different-credential': 'AUTOLINK', // Special handling
  };

  if (code in messages) {
    return messages[code];
  }

  // Permission-denied is from Firestore not Auth — usually non-critical
  if (code === 'permission-denied' || code.includes('permission')) {
    return ''; // silent — usually means profile create succeeded but read denied
  }

  return err.message || 'Sign-in failed. Please try again.';
}

/* ═══════════════════════════════════════════
   AUTH PROVIDER COMPONENT
═══════════════════════════════════════════ */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Auth state listener ── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const prof = await ensureUserProfile(firebaseUser);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /* ── Refresh profile from Firestore ── */
  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (snap.exists()) setProfile(snap.data());
    } catch (e) {
      console.warn('Profile refresh:', e.message);
    }
  }, []);

  /* ── Update profile ── */
  const updateUserProfile = useCallback(async (data) => {
    if (!auth.currentUser) return;
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    await refreshProfile();
  }, [refreshProfile]);

  /* ═══════════════════════════════════════════
     SOCIAL SIGN-IN WITH AUTO-LINKING
  ═══════════════════════════════════════════ */
  const socialSignIn = useCallback(async (providerInstance) => {
    try {
      const result = await signInWithPopup(auth, providerInstance);
      await ensureUserProfile(result.user);
      return { success: true, user: result.user };

    } catch (err) {
      // Handle account-exists-with-different-credential
      if (err.code === 'auth/account-exists-with-different-credential') {
        const email = err.customData && err.customData.email;
        if (!email) {
          return { success: false, error: 'Could not retrieve email from provider.' };
        }

        // Find what providers are registered for this email
        let methods = [];
        try {
          methods = await fetchSignInMethodsForEmail(auth, email);
        } catch (e) {
          // Some Firebase configs return empty — assume google.com
          methods = ['google.com'];
        }

        const existingProviderId = methods[0] || 'google.com';

        // Extract pending credential to link later
        let pendingCredential = null;
        try {
          if (providerInstance === githubProvider) {
            pendingCredential = GithubAuthProvider.credentialFromError(err);
          } else if (providerInstance === googleProvider) {
            pendingCredential = GoogleAuthProvider.credentialFromError(err);
          } else if (providerInstance === yahooProvider) {
            pendingCredential = OAuthProvider.credentialFromError(err);
          }
        } catch (e) {
          // ignore credential extraction failure
        }

        return {
          success: false,
          needsLinking: true,
          email,
          existingProviderId,
          existingProviderName: getProviderName(existingProviderId),
          pendingCredential,
        };
      }

      // Silent errors (user cancelled)
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return { success: false, cancelled: true };
      }

      return { success: false, error: parseAuthError(err) };
    }
  }, []);

  /* ── Auto-link two providers ── */
  const linkAccounts = useCallback(async (existingProviderId, pendingCredential) => {
    try {
      if (existingProviderId === 'password') {
        return {
          success: false,
          error: 'Please sign in with your email and password first.',
        };
      }

      // Sign in with the existing provider
      const existingProvider = getProviderInstance(existingProviderId);
      const result = await signInWithPopup(auth, existingProvider);

      // Link the pending credential
      if (pendingCredential && auth.currentUser) {
        try {
          await linkWithCredential(auth.currentUser, pendingCredential);
        } catch (linkErr) {
          // Already linked or other minor issue — not critical
          console.warn('Link warning:', linkErr.code);
        }
      }

      await ensureUserProfile(result.user);
      return { success: true, user: result.user };

    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return { success: false, cancelled: true };
      }
      return { success: false, error: parseAuthError(err) };
    }
  }, []);

  /* ═══════════════════════════════════════════
     INDIVIDUAL PROVIDERS
  ═══════════════════════════════════════════ */
  const loginWithGoogle = useCallback(() => socialSignIn(googleProvider), [socialSignIn]);
  const loginWithGithub = useCallback(() => socialSignIn(githubProvider), [socialSignIn]);
  const loginWithYahoo  = useCallback(() => socialSignIn(yahooProvider),  [socialSignIn]);

  /* ── Email login ── */
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(result.user);
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, error: parseAuthError(err) };
    }
  }, []);

  /* ── Email registration ── */
  const register = useCallback(async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && result.user) {
        try {
          await updateProfile(result.user, { displayName });
        } catch (e) {
          console.warn('DisplayName update skipped:', e.message);
        }
      }

      await ensureUserProfile(result.user, { displayName });
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, error: parseAuthError(err) };
    }
  }, []);

  /* ── Reset password ── */
  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      return { success: false, error: parseAuthError(err) };
    }
  }, []);

  /* ── Logout ── */
  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = {
    user,
    profile,
    loading,
    refreshProfile,
    updateUserProfile,
    loginWithGoogle,
    loginWithGithub,
    loginWithYahoo,
    loginWithEmail,
    linkAccounts,
    register,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
