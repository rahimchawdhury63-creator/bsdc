import { collection, doc, getDocs, limit, orderBy, query, updateDoc, deleteDoc, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { AdminMetricCard, BSDCUser, BSDCPost, BSDCCommunity, ServiceResult } from '@/types';
import type { BSDCAd } from './ads.service';
import type { BSDCVerificationRequest } from './verification.service';

/** Admin passkey value requested by the project owner. Client passkey gates UI only; Firestore rules still enforce real admin authority. */
const ADMIN_PASSKEY = 'RahimRahim';
/** Browser session key that remembers successful admin passkey entry for the current tab session. */
const ADMIN_SESSION_KEY = 'bsdc.admin.passkey.session';

/** Checks the admin passkey and stores a session-only flag when valid. */
export const verifyAdminPasskey = (passkey: string): boolean => {
  const ok = passkey === ADMIN_PASSKEY;
  if (ok && typeof sessionStorage !== 'undefined') sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  return ok;
};

/** Returns whether the passkey UI gate has been satisfied. */
export const hasAdminPasskeySession = (): boolean => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';

/** Clears the passkey UI session. */
export const clearAdminPasskeySession = (): void => { if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(ADMIN_SESSION_KEY); };

/** Loads basic admin dashboard metrics from real Firestore collections. */
export const loadAdminMetrics = async (): Promise<ServiceResult<readonly AdminMetricCard[]>> => {
  try {
    const [users, posts, communities, verifications] = await Promise.all([
      getDocs(query(collection(db, FIRESTORE_COLLECTIONS.users), limit(1000))),
      getDocs(query(collection(db, FIRESTORE_COLLECTIONS.posts), limit(1000))),
      getDocs(query(collection(db, FIRESTORE_COLLECTIONS.communities), limit(1000))),
      getDocs(query(collection(db, FIRESTORE_COLLECTIONS.verifications), where('status', '==', 'pending'), limit(1000)))
    ]);
    return { ok: true, data: [
      { id: 'users', label: 'Users', value: users.size, changePercent: 0 },
      { id: 'posts', label: 'Posts', value: posts.size, changePercent: 0 },
      { id: 'communities', label: 'Communities', value: communities.size, changePercent: 0 },
      { id: 'pending-verifications', label: 'Pending verifications', value: verifications.size, changePercent: 0 }
    ] };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to load admin metrics.' }; }
};

/** Loads recent users for admin user management. */
export const loadAdminUsers = async (): Promise<ServiceResult<readonly BSDCUser[]>> => {
  try { const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.users), orderBy('createdAt', 'desc'), limit(100))); return { ok: true, data: snap.docs.map((d) => ({ uid: d.id, ...d.data() } as BSDCUser)) }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to load users.' }; }
};

/** Loads recent posts for admin post management. */
export const loadAdminPosts = async (): Promise<ServiceResult<readonly BSDCPost[]>> => {
  try { const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.posts), orderBy('createdAt', 'desc'), limit(100))); return { ok: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() } as BSDCPost)) }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to load posts.' }; }
};

/** Loads recent communities for admin community management. */
export const loadAdminCommunities = async (): Promise<ServiceResult<readonly BSDCCommunity[]>> => {
  try { const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.communities), orderBy('createdAt', 'desc'), limit(100))); return { ok: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() } as BSDCCommunity)) }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to load communities.' }; }
};

/** Loads verification requests for admin review. */
export const loadAdminVerifications = async (): Promise<ServiceResult<readonly BSDCVerificationRequest[]>> => {
  try { const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.verifications), orderBy('createdAt', 'desc'), limit(100))); return { ok: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() } as BSDCVerificationRequest)) }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to load verifications.' }; }
};

/** Loads advertisements for admin approval and status review. */
export const loadAdminAds = async (): Promise<ServiceResult<readonly BSDCAd[]>> => {
  try { const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.ads), orderBy('createdAt', 'desc'), limit(100))); return { ok: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() } as BSDCAd)) }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to load ads.' }; }
};

/** Updates a user role through Firestore admin-only rules. */
export const updateUserRole = async (uid: string, role: BSDCUser['role']): Promise<ServiceResult<true>> => { try { await updateDoc(doc(db, FIRESTORE_COLLECTIONS.users, uid), { role, updatedAt: serverTimestamp() }); return { ok: true, data: true }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to update user role.' }; } };

/** Deletes a post through Firestore admin/owner rules. */
export const adminDeletePost = async (postId: string): Promise<ServiceResult<true>> => { try { await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.posts, postId)); return { ok: true, data: true }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to delete post.' }; } };

/** Updates verification status through Firestore admin-only rules. */
export const adminReviewVerification = async (id: string, reviewedBy: string, status: 'approved' | 'rejected', reviewNote: string): Promise<ServiceResult<true>> => { try { await updateDoc(doc(db, FIRESTORE_COLLECTIONS.verifications, id), { status, reviewedBy, reviewNote, updatedAt: serverTimestamp() }); return { ok: true, data: true }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to review verification.' }; } };

/** Updates advertisement status through Firestore admin-only rules. */
export const adminUpdateAdStatus = async (id: string, status: BSDCAd['status']): Promise<ServiceResult<true>> => { try { await updateDoc(doc(db, FIRESTORE_COLLECTIONS.ads, id), { status }); return { ok: true, data: true }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to update ad.' }; } };

/** Stores a broadcast request in Firestore; push sending is handled by Cloud Functions later. */
export const createAdminBroadcast = async (adminId: string, title: string, message: string): Promise<ServiceResult<string>> => { try { const ref = await addDoc(collection(db, 'broadcasts'), { adminId, title, message, status: 'queued', createdAt: serverTimestamp() }); return { ok: true, data: ref.id }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to create broadcast.' }; } };
