import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
  type UserCredential
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, type DocumentData } from 'firebase/firestore';
import { auth, db, githubProvider, googleProvider, yahooProvider } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { BSDCUser, ServiceResult, UserLanguage, UserNotificationPreferences, UserPreferences, UserRole } from '@/types';

/** OAuth provider identifiers supported by the BSDC login page. */
export type AuthProviderId = 'google' | 'github' | 'yahoo';

/** Email/password registration payload accepted by the auth service. */
export interface RegisterWithEmailPayload {
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
  readonly language: UserLanguage;
}

/** Email/password login payload with explicit session persistence control. */
export interface LoginWithEmailPayload {
  readonly email: string;
  readonly password: string;
  readonly rememberDevice: boolean;
}

/** Public auth profile returned to stores and hooks after Firebase state changes. */
export interface AuthProfile {
  readonly firebaseUser: User;
  readonly profile: BSDCUser | null;
}

/** Default notification preferences for newly registered users. */
const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  follows: true,
  likes: true,
  comments: true,
  replies: true,
  mentions: true,
  messages: true,
  points: true,
  verification: true,
  push: false,
  sound: true
};

/** Default user preferences stored in Firestore for every new account. */
const createDefaultPreferences = (language: UserLanguage): UserPreferences => ({
  language,
  theme: 'system',
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
  feedType: 'for-you'
});

/** Converts a display name or email prefix into a Firestore-safe username base. */
const createUsernameBase = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);

  return normalized.length >= 3 ? normalized : `bsdc-${normalized || 'user'}`;
};

/** Creates a deterministic username candidate without querying fake data. */
const createUsernameCandidate = (user: User, preferredName?: string): string => {
  const baseSource = preferredName || user.displayName || user.email?.split('@')[0] || user.uid;
  const base = createUsernameBase(baseSource);
  const suffix = user.uid.slice(0, 6).toLowerCase();
  return `${base}-${suffix}`.slice(0, 32);
};

/** Safely converts a Firestore document into a BSDCUser object. */
const mapUserDocument = (uid: string, data: DocumentData): BSDCUser => ({
  uid,
  username: String(data.username || ''),
  displayName: String(data.displayName || ''),
  email: String(data.email || ''),
  photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
  bannerURL: typeof data.bannerURL === 'string' ? data.bannerURL : null,
  bio: String(data.bio || ''),
  title: String(data.title || ''),
  location: String(data.location || ''),
  website: String(data.website || ''),
  links: Array.isArray(data.links) ? data.links : [],
  role: (data.role || 'user') as UserRole,
  isVerified: Boolean(data.isVerified),
  verificationBadge: typeof data.verificationBadge === 'string' ? data.verificationBadge : null,
  bsdcPoints: Number(data.bsdcPoints || 0),
  bsdcPointsTotal: Number(data.bsdcPointsTotal || 0),
  followersCount: Number(data.followersCount || 0),
  followingCount: Number(data.followingCount || 0),
  postsCount: Number(data.postsCount || 0),
  isMonetized: Boolean(data.isMonetized),
  monetizationTier: typeof data.monetizationTier === 'string' ? data.monetizationTier : null,
  devices: Array.isArray(data.devices) ? data.devices : [],
  preferences: (data.preferences || createDefaultPreferences('bn')) as UserPreferences,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt
});

/** Reads the Firestore profile for a Firebase Auth user. */
export const getUserProfile = async (uid: string): Promise<BSDCUser | null> => {
  const userRef = doc(db, FIRESTORE_COLLECTIONS.users, uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? mapUserDocument(uid, snapshot.data()) : null;
};

/**
 * Ensures a user document exists after any successful Firebase sign-in.
 * Existing documents keep their server-controlled role and counters untouched.
 */
export const ensureUserProfile = async (user: User, language: UserLanguage = 'bn'): Promise<BSDCUser> => {
  const userRef = doc(db, FIRESTORE_COLLECTIONS.users, user.uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    await updateDoc(userRef, {
      email: user.email || '',
      displayName: user.displayName || existing.data().displayName || '',
      photoURL: user.photoURL || existing.data().photoURL || null,
      updatedAt: serverTimestamp()
    });

    const refreshed = await getDoc(userRef);
    return mapUserDocument(user.uid, refreshed.data() || existing.data());
  }

  const username = createUsernameCandidate(user);
  const displayName = user.displayName || user.email?.split('@')[0] || 'BSDC Member';

  await setDoc(userRef, {
    username,
    displayName,
    email: user.email || '',
    photoURL: user.photoURL || null,
    bannerURL: null,
    bio: '',
    title: '',
    location: '',
    website: '',
    links: [],
    role: 'user',
    isVerified: false,
    verificationBadge: null,
    bsdcPoints: 0,
    bsdcPointsTotal: 0,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isMonetized: false,
    monetizationTier: null,
    devices: [],
    preferences: createDefaultPreferences(language),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  const created = await getDoc(userRef);
  return mapUserDocument(user.uid, created.data() || {});
};

/** Applies local or session persistence before signing in with email/password. */
export const loginWithEmail = async (payload: LoginWithEmailPayload): Promise<ServiceResult<AuthProfile>> => {
  try {
    await setPersistence(auth, payload.rememberDevice ? browserLocalPersistence : browserSessionPersistence);
    const credential = await signInWithEmailAndPassword(auth, payload.email, payload.password);
    const profile = await ensureUserProfile(credential.user);
    return { ok: true, data: { firebaseUser: credential.user, profile } };
  } catch (error) {
    return normalizeAuthError(error);
  }
};

/** Registers a user with email/password, creates the Firestore profile, and sends verification email. */
export const registerWithEmail = async (payload: RegisterWithEmailPayload): Promise<ServiceResult<AuthProfile>> => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
    await updateProfile(credential.user, { displayName: payload.displayName });
    await sendEmailVerification(credential.user);
    const profile = await ensureUserProfile(credential.user, payload.language);
    return { ok: true, data: { firebaseUser: credential.user, profile } };
  } catch (error) {
    return normalizeAuthError(error);
  }
};

/** Signs in with a configured OAuth provider and guarantees Firestore profile creation. */
export const loginWithProvider = async (providerId: AuthProviderId): Promise<ServiceResult<AuthProfile>> => {
  try {
    const provider = providerId === 'google' ? googleProvider : providerId === 'github' ? githubProvider : yahooProvider;
    const credential: UserCredential = await signInWithPopup(auth, provider);
    const profile = await ensureUserProfile(credential.user);
    return { ok: true, data: { firebaseUser: credential.user, profile } };
  } catch (error) {
    return normalizeAuthError(error);
  }
};

/** Sends a Firebase password reset email without revealing whether accounts exist. */
export const requestPasswordReset = async (email: string): Promise<ServiceResult<true>> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { ok: true, data: true };
  } catch (error) {
    return normalizeAuthError(error);
  }
};

/** Sends a new verification email for the active Firebase user. */
export const resendVerificationEmail = async (): Promise<ServiceResult<true>> => {
  try {
    if (!auth.currentUser) {
      return { ok: false, error: 'You must be signed in to request email verification.', code: 'auth/not-signed-in' };
    }

    await sendEmailVerification(auth.currentUser);
    return { ok: true, data: true };
  } catch (error) {
    return normalizeAuthError(error);
  }
};

/** Signs out the current user from Firebase Auth. */
export const logout = async (): Promise<ServiceResult<true>> => {
  try {
    await signOut(auth);
    return { ok: true, data: true };
  } catch (error) {
    return normalizeAuthError(error);
  }
};

/** Subscribes to Firebase Auth state and resolves the matching Firestore profile. */
export const subscribeToAuthProfile = (callback: (profile: AuthProfile | null) => void, onError: (message: string) => void) =>
  onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          callback(null);
          return;
        }

        const profile = await ensureUserProfile(firebaseUser);
        callback({ firebaseUser, profile });
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Unable to load the authenticated BSDC profile.');
      }
    },
    (error) => onError(error.message)
  );

/** Converts Firebase and unknown errors into a consistent ServiceResult failure. */
const normalizeAuthError = <TData>(error: unknown): ServiceResult<TData> => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
  const message = typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: unknown }).message) : 'Authentication request failed.';
  return code ? { ok: false, error: message, code } : { ok: false, error: message };
};
