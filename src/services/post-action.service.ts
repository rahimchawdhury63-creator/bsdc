import { addDoc, collection, deleteDoc, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { ServiceResult } from '@/types';

/** Creates deterministic like document IDs to prevent duplicate likes per user. */
const getLikeId = (userId: string, targetId: string): string => `${userId}_${targetId}`;

/** Toggles a post like and keeps the aggregate counter updated. */
export const togglePostLike = async (userId: string, postId: string): Promise<ServiceResult<boolean>> => {
  try {
    const likeRef = doc(db, FIRESTORE_COLLECTIONS.likes, getLikeId(userId, postId));
    const likeSnapshot = await getDoc(likeRef);
    const postRef = doc(db, FIRESTORE_COLLECTIONS.posts, postId);

    if (likeSnapshot.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1), updatedAt: serverTimestamp() });
      return { ok: true, data: false };
    }

    await setDoc(likeRef, { userId, postId, type: 'post', createdAt: serverTimestamp() });
    await updateDoc(postRef, { likesCount: increment(1), updatedAt: serverTimestamp() });
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to update like.' };
  }
};

/** Adds the current user to a post's savedBy array-like bookmark document. */
export const savePost = async (userId: string, postId: string): Promise<ServiceResult<true>> => {
  try {
    await setDoc(doc(db, 'savedPosts', `${userId}_${postId}`), { userId, postId, createdAt: serverTimestamp() });
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to save post.' };
  }
};

/** Creates a report document for moderator/admin review. */
export const reportPost = async (userId: string, postId: string, reason: string): Promise<ServiceResult<string>> => {
  try {
    const reportRef = await addDoc(collection(db, 'reports'), { userId, postId, reason, status: 'pending', createdAt: serverTimestamp() });
    return { ok: true, data: reportRef.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to report post.' };
  }
};

/** Increments a share counter after the user copies or opens a share target. */
export const recordPostShare = async (postId: string): Promise<ServiceResult<true>> => {
  try {
    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.posts, postId), { sharesCount: increment(1), updatedAt: serverTimestamp() });
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to record share.' };
  }
};
