import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { BSDCUser, ServiceResult } from '@/types';
import { getUserProfile } from './auth.service';

/** Public profile update payload controlled by the profile edit modal. */
export interface UpdateProfilePayload {
  readonly displayName: string;
  readonly bio: string;
  readonly title: string;
  readonly location: string;
  readonly website: string;
  readonly photoURL?: string | null | undefined;
  readonly bannerURL?: string | null | undefined;
}

/** Resolves a public profile by username using the real users collection. */
export const getProfileByUsername = async (username: string): Promise<ServiceResult<BSDCUser | null>> => {
  try {
    const usersQuery = query(collection(db, FIRESTORE_COLLECTIONS.users), where('username', '==', username), limit(1));
    const snapshot = await getDocs(usersQuery);
    if (snapshot.empty) {
      return { ok: true, data: null };
    }
    return { ok: true, data: await getUserProfile(snapshot.docs[0]?.id || '') };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to load profile.' };
  }
};

/** Updates the authenticated user's public profile document. */
export const updateProfileDocument = async (uid: string, payload: UpdateProfilePayload): Promise<ServiceResult<true>> => {
  try {
    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.users, uid), { ...payload, updatedAt: serverTimestamp() });
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to update profile.' };
  }
};

/** Creates or removes a follow relationship document and returns the new state. */
export const toggleFollow = async (followerId: string, followingId: string): Promise<ServiceResult<boolean>> => {
  try {
    if (followerId === followingId) {
      return { ok: false, error: 'You cannot follow your own profile.' };
    }

    const followId = `${followerId}_${followingId}`;
    const followRef = doc(db, FIRESTORE_COLLECTIONS.follows, followId);
    const existing = await getDoc(followRef);

    if (existing.exists()) {
      await deleteDoc(followRef);
      return { ok: true, data: false };
    }

    await setDoc(followRef, { followerId, followingId, createdAt: serverTimestamp() });
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to update follow status.' };
  }
};
