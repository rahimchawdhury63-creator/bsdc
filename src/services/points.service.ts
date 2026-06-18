import { collection, onSnapshot, orderBy, query, where, type Unsubscribe } from 'firebase/firestore';
import { onValue, ref, type Unsubscribe as RtdbUnsubscribe } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { db, functions, rtdb } from '@config/firebase';
import { FIRESTORE_COLLECTIONS, RTDB_PATHS } from '@config/constants';
import type { BSDCPointTransaction, ServiceResult } from '@/types';

/** Points transfer payload for bKash-like BSDC wallet sends. */
export interface TransferPointsPayload {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly amount: number;
  readonly description: string;
}

/**
 * Performs a BSDC points transfer through a privileged Firebase Cloud Function.
 * The client never directly edits another user's balance, keeping the wallet
 * secure under production Firestore rules.
 */
export const transferPoints = async (payload: TransferPointsPayload): Promise<ServiceResult<string>> => {
  if (payload.amount <= 0) return { ok: false, error: 'Transfer amount must be greater than zero.' };
  if (payload.fromUserId === payload.toUserId) return { ok: false, error: 'You cannot transfer points to yourself.' };

  try {
    const callable = httpsCallable<TransferPointsPayload, { transactionId: string }>(functions, 'transferPointsCallable');
    const result = await callable(payload);
    return { ok: true, data: result.data.transactionId };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to transfer points.' };
  }
};

/** Subscribes to a user's point transaction history. */
export const subscribeToPointTransactions = (userId: string, callback: (items: readonly BSDCPointTransaction[]) => void): Unsubscribe => {
  const txQuery = query(collection(db, FIRESTORE_COLLECTIONS.pointTransactions), where('toUserId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(txQuery, (snapshot) => callback(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as BSDCPointTransaction))));
};

/** Subscribes to live wallet metadata in Realtime Database. */
export const subscribeToLivePoints = (userId: string, callback: (value: unknown) => void): RtdbUnsubscribe => onValue(ref(rtdb, `${RTDB_PATHS.pointsLive}/${userId}`), (snapshot) => callback(snapshot.val()));
