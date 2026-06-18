import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc, where, type Unsubscribe } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { ServiceResult } from '@/types';

/** Verification request document stored in Firestore. */
export interface BSDCVerificationRequest {
  readonly id: string;
  readonly userId: string;
  readonly idType: 'nid' | 'birth_certificate';
  readonly idImageUrl: string;
  readonly phoneNumber: string;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly reviewedBy?: string | null;
  readonly reviewNote?: string | null;
  readonly createdAt: unknown;
  readonly updatedAt: unknown;
}

/** Payload submitted by the verification form. */
export interface CreateVerificationPayload {
  readonly userId: string;
  readonly idType: 'nid' | 'birth_certificate';
  readonly idImageUrl: string;
  readonly phoneNumber: string;
}

/** Creates a real verification request in Firestore. */
export const createVerificationRequest = async (payload: CreateVerificationPayload): Promise<ServiceResult<string>> => {
  try {
    const verificationRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.verifications), {
      ...payload,
      status: 'pending',
      reviewedBy: null,
      reviewNote: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { ok: true, data: verificationRef.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to submit verification request.' };
  }
};

/** Subscribes to a user's verification requests. */
export const subscribeToUserVerifications = (userId: string, callback: (items: readonly BSDCVerificationRequest[]) => void): Unsubscribe => {
  const verificationQuery = query(collection(db, FIRESTORE_COLLECTIONS.verifications), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(verificationQuery, (snapshot) => callback(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as BSDCVerificationRequest))));
};

/** Admin-only status update helper protected by Firestore rules. */
export const reviewVerificationRequest = async (verificationId: string, reviewedBy: string, status: 'approved' | 'rejected', reviewNote: string): Promise<ServiceResult<true>> => {
  try {
    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.verifications, verificationId), { status, reviewedBy, reviewNote, updatedAt: serverTimestamp() });
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to review verification request.' };
  }
};
