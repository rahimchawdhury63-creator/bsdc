/**
 * src/firebase/config.js
 * ---------------------------------------------------------------------------
 * Single source of truth for Firebase initialization.
 *
 * WHY this exists:
 *  - Firebase SDK v9+ is modular; we initialize ONCE here and export the
 *    instances. Importing `getAuth()` etc. elsewhere would re-instantiate
 *    and waste memory.
 *  - All secrets are read from Vite env vars (VITE_*) which are baked at
 *    build-time on Cloudflare Pages. The .env file is NEVER committed.
 *  - We use `initializeApp` defensively because Vite HMR can re-import
 *    this module — `getApps()` check prevents "duplicate app" errors.
 * ---------------------------------------------------------------------------
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

/**
 * Firebase configuration object.
 * In production these come from Cloudflare Pages env vars.
 * In local dev they come from .env (see .env.example).
 *
 * The values shown as fallbacks here MATCH the credentials provided
 * for the BSDC project so the app boots even before env vars are wired.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBNXVLt5eVghQAFySnGEKy6P8H407hwA1E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'bsdc-bd.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'bsdc-bd',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'bsdc-bd.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || '1041487418449',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1041487418449:web:350786ca8caf66266a9470',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://bsdc-bd-default-rtdb.asia-southeast1.firebasedatabase.app/'
};

/**
 * Initialize Firebase exactly once. The getApps() guard prevents
 * the "Firebase App named [DEFAULT] already exists" error during HMR.
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** Auth instance — used everywhere we need a signed-in user. */
export const auth = getAuth(app);

/** Firestore — structured data (users, posts, comments, etc). */
export const db = getFirestore(app);

/** Realtime Database — chat, presence, live counters, points alerts. */
export const rtdb = getDatabase(app);

/** OAuth providers — exported as singletons. */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

// Yahoo uses the generic OAuthProvider in Firebase.
export const yahooProvider = new OAuthProvider('yahoo.com');
yahooProvider.addScope('profile');
yahooProvider.addScope('email');

/** Convenience re-export so callers don't import from two files. */
export { serverTimestamp };

/** Export the raw app in case advanced features (Functions, etc.) need it. */
export default app;
