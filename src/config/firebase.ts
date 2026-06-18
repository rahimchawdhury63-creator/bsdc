import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getFunctions, type Functions } from 'firebase/functions';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

/**
 * Strongly typed Firebase web configuration.
 * Firebase Web API keys are public identifiers; privileged operations remain
 * protected by Firebase Security Rules and server-side Cloud Functions.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

/** Initializes Firebase exactly once across Vite hot reloads and production. */
export const firebaseApp: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/** Authentication instance for email/password and OAuth providers. */
export const auth: Auth = getAuth(firebaseApp);

/** Firestore instance for all durable community data. */
export const db: Firestore = getFirestore(firebaseApp);

/** Realtime Database instance for presence, typing, messages, and live counters. */
export const rtdb: Database = getDatabase(firebaseApp);

/** Cloud Functions instance for privileged operations such as point transfers. */
export const functions: Functions = getFunctions(firebaseApp, 'us-central1');

/** Google provider used by auth service with explicit account selection. */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** GitHub provider used by auth service for developer-friendly sign in. */
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

/** Yahoo provider implemented through Firebase's generic OAuth provider. */
export const yahooProvider = new OAuthProvider('yahoo.com');
yahooProvider.addScope('profile');
yahooProvider.addScope('email');

/**
 * Lazily resolves Analytics only in supported browser environments.
 * Cloudflare preview, SSR-like tests, and privacy-restricted browsers may not
 * support analytics, so callers receive null instead of a runtime exception.
 */
export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  const supported = await isSupported();
  return supported ? getAnalytics(firebaseApp) : null;
};
