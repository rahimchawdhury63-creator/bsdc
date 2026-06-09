/**
 * src/firebase/auth.js
 * ---------------------------------------------------------------------------
 * All authentication helpers. Pure functions — no React state here.
 * (React state lives in src/context/AuthContext.jsx and src/hooks/useAuth.js)
 *
 * WHY this is separated:
 *  - Easier to unit-test pure functions.
 *  - Components import only what they need (tree-shaking friendly).
 *  - The auth surface is intentionally small: sign in, sign out, register,
 *    reset password, ensure user document exists in Firestore.
 * ---------------------------------------------------------------------------
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider, yahooProvider } from './config.js';

/**
 * Generate a URL-safe, unique-ish username from an email or display name.
 * We slugify, lowercase, strip non-alphanumerics, and append a 4-char suffix.
 *
 * @param {string} seed - typically email local-part or display name
 * @returns {string} candidate username (caller should still check uniqueness)
 */
export function generateUsername(seed = 'user') {
  const base = String(seed)
    .toLowerCase()
    .split('@')[0]
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 16) || 'user';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}${suffix}`;
}

/**
 * Ensure /users/{uid} exists in Firestore. Called after EVERY successful
 * sign-in (Google, GitHub, Yahoo, Email). Returns the user document data.
 *
 * Why merge:true: existing users keep their data; new users get a default
 * profile. Idempotent and safe to call repeatedly.
 */
export async function ensureUserProfile(firebaseUser, extras = {}) {
  if (!firebaseUser) return null;
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    // Update lastSeen + isOnline on every sign-in.
    await setDoc(
      userRef,
      { lastSeen: serverTimestamp(), isOnline: true },
      { merge: true }
    );
    return snap.data();
  }

  // First-time login — create default profile.
  const defaultUsername = generateUsername(firebaseUser.email || firebaseUser.displayName);
  const newProfile = {
    uid: firebaseUser.uid,
    username: extras.username || defaultUsername,
    displayName: firebaseUser.displayName || extras.displayName || defaultUsername,
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    bannerURL: '',
    bio: '',
    title: '',
    location: '',
    skills: [],
    socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
    bsdcPoints: 0,
    rank: 'bronze',
    isVerified: false,
    verificationBadge: 'none',
    isAdmin: false,
    language: 'en',
    followers: 0,
    following: 0,
    postsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    isOnline: true,
    oneSignalPlayerId: '',
    seoTitle: `bsdc • ${defaultUsername} | Bangladesh Software Development Community`,
    seoDescription: `${firebaseUser.displayName || defaultUsername} on BSDC — Bangladesh Software Development Community.`,
    feedPreferences: { categories: [], languages: ['en', 'bn'], postTypes: [] }
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

/**
 * Sign in with email + password.
 * Throws if credentials are wrong — caller should catch and show toast.
 */
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  return cred.user;
}

/**
 * Register a new email/password user, send verification email,
 * and create the Firestore profile.
 */
export async function registerWithEmail({ email, password, displayName, username }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  await sendEmailVerification(cred.user);
  await ensureUserProfile(cred.user, { displayName, username });
  return cred.user;
}

/** Send password reset email. */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/** Re-send verification email to the currently signed-in user. */
export function resendVerificationEmail() {
  if (!auth.currentUser) throw new Error('Not signed in');
  return sendEmailVerification(auth.currentUser);
}

/** Sign in with Google popup. */
export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(cred.user);
  return cred.user;
}

/** Sign in with GitHub popup. */
export async function loginWithGithub() {
  const cred = await signInWithPopup(auth, githubProvider);
  await ensureUserProfile(cred.user);
  return cred.user;
}

/** Sign in with Yahoo popup. */
export async function loginWithYahoo() {
  const cred = await signInWithPopup(auth, yahooProvider);
  await ensureUserProfile(cred.user);
  return cred.user;
}

/** Sign out. */
export function logout() {
  return fbSignOut(auth);
}

/** Subscribe to auth state changes (returns unsubscribe). */
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
