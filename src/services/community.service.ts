import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, type Timestamp, type Unsubscribe } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { BSDCCommunity, ServiceResult } from '@/types';

/** Community creation payload accepted by the creation form. */
export interface CreateCommunityPayload {
  readonly name: string;
  readonly description: string;
  readonly creatorId: string;
  readonly tags: readonly string[];
  readonly rules: readonly string[];
  readonly isPrivate: boolean;
}

/** Generates an SEO-safe community slug from the requested community name. */
export const createCommunitySlug = (name: string): string => name.toLowerCase().trim().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);

/** Maps a Firestore community document into a typed model. */
const mapCommunity = (id: string, data: Record<string, unknown>): BSDCCommunity => ({
  id,
  name: String(data.name || ''),
  slug: String(data.slug || id),
  description: String(data.description || ''),
  bannerURL: typeof data.bannerURL === 'string' ? data.bannerURL : null,
  iconURL: typeof data.iconURL === 'string' ? data.iconURL : null,
  creatorId: String(data.creatorId || ''),
  moderators: Array.isArray(data.moderators) ? data.moderators.filter((item): item is string => typeof item === 'string') : [],
  membersCount: Number(data.membersCount || 0),
  postsCount: Number(data.postsCount || 0),
  rules: Array.isArray(data.rules) ? data.rules.filter((item): item is string => typeof item === 'string') : [],
  isPrivate: Boolean(data.isPrivate),
  tags: Array.isArray(data.tags) ? data.tags.filter((item): item is string => typeof item === 'string') : [],
  createdAt: data.createdAt as Timestamp
});

/** Creates a real community document in Firestore. */
export const createCommunity = async (payload: CreateCommunityPayload): Promise<ServiceResult<string>> => {
  try {
    const slug = createCommunitySlug(payload.name);
    const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.communities), {
      name: payload.name.trim(),
      slug,
      description: payload.description.trim(),
      bannerURL: null,
      iconURL: null,
      creatorId: payload.creatorId,
      moderators: [payload.creatorId],
      membersCount: 1,
      postsCount: 0,
      rules: payload.rules,
      isPrivate: payload.isPrivate,
      tags: payload.tags,
      createdAt: serverTimestamp()
    });
    await setDoc(doc(db, 'communityMembers', `${docRef.id}_${payload.creatorId}`), { communityId: docRef.id, userId: payload.creatorId, role: 'creator', joinedAt: serverTimestamp() });
    return { ok: true, data: docRef.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to create community.' };
  }
};

/** Subscribes to the public community list. */
export const subscribeToCommunities = (callback: (items: readonly BSDCCommunity[]) => void): Unsubscribe => {
  const communitiesQuery = query(collection(db, FIRESTORE_COLLECTIONS.communities), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(communitiesQuery, (snapshot) => callback(snapshot.docs.map((docSnap) => mapCommunity(docSnap.id, docSnap.data()))));
};

/** Resolves a community by slug. */
export const getCommunityBySlug = async (slug: string): Promise<ServiceResult<BSDCCommunity | null>> => {
  try {
    const communityQuery = query(collection(db, FIRESTORE_COLLECTIONS.communities), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(communityQuery);
    if (snapshot.empty) return { ok: true, data: null };
    const first = snapshot.docs[0];
    return { ok: true, data: first ? mapCommunity(first.id, first.data()) : null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to load community.' };
  }
};

/** Joins or leaves a community through a membership document. */
export const toggleCommunityMembership = async (communityId: string, userId: string): Promise<ServiceResult<boolean>> => {
  try {
    const memberRef = doc(db, 'communityMembers', `${communityId}_${userId}`);
    const existing = await getDoc(memberRef);
    if (existing.exists()) {
      await deleteDoc(memberRef);
      return { ok: true, data: false };
    }
    await setDoc(memberRef, { communityId, userId, role: 'member', joinedAt: serverTimestamp() });
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to update membership.' };
  }
};

/** Updates community rules or metadata through creator/mod/admin Firestore rules. */
export const updateCommunity = async (communityId: string, payload: Partial<Pick<BSDCCommunity, 'description' | 'rules' | 'tags'>>): Promise<ServiceResult<true>> => {
  try {
    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.communities, communityId), payload);
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to update community.' };
  }
};
