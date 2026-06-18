import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where, type Unsubscribe } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { ServiceResult } from '@/types';

/** Advertisement document stored in Firestore ads collection. */
export interface BSDCAd { readonly id: string; readonly advertiserId: string; readonly title: string; readonly content: string; readonly imageUrl: string; readonly targetUrl: string; readonly pointsCost: number; readonly status: 'pending' | 'active' | 'paused' | 'completed'; readonly impressions: number; readonly clicks: number; }

/** Creates an ad request paid with BSDC points after admin approval. */
export const createAd = async (ad: Omit<BSDCAd, 'id' | 'status' | 'impressions' | 'clicks'>): Promise<ServiceResult<string>> => {
  try { const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.ads), { ...ad, status: 'pending', impressions: 0, clicks: 0, createdAt: serverTimestamp() }); return { ok: true, data: docRef.id }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unable to create ad.' }; }
};

/** Subscribes to current user's ads. */
export const subscribeToUserAds = (userId: string, callback: (ads: readonly BSDCAd[]) => void): Unsubscribe => onSnapshot(query(collection(db, FIRESTORE_COLLECTIONS.ads), where('advertiserId', '==', userId), orderBy('createdAt', 'desc')), (snapshot) => callback(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as BSDCAd))));
