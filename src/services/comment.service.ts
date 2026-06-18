import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { ServiceResult } from '@/types';

/** Firestore comment document used by post discussion and nested replies. */
export interface BSDCComment {
  readonly id: string;
  readonly postId: string;
  readonly authorId: string;
  readonly parentId: string | null;
  readonly content: string;
  readonly likesCount: number;
  readonly repliesCount: number;
  readonly createdAt: unknown;
  readonly updatedAt: unknown;
}

/** Comment creation payload for root comments and replies. */
export interface CreateCommentPayload {
  readonly postId: string;
  readonly authorId: string;
  readonly parentId?: string | null | undefined;
  readonly content: string;
}

/** Maps a Firestore comment document into a render-safe object. */
const mapComment = (snapshot: QueryDocumentSnapshot<DocumentData>): BSDCComment => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    postId: String(data.postId || ''),
    authorId: String(data.authorId || ''),
    parentId: typeof data.parentId === 'string' ? data.parentId : null,
    content: String(data.content || ''),
    likesCount: Number(data.likesCount || 0),
    repliesCount: Number(data.repliesCount || 0),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

/** Subscribes to all comments for a post and lets the UI group nested replies. */
export const subscribeToPostComments = (postId: string, onComments: (comments: readonly BSDCComment[]) => void, onError: (message: string) => void): Unsubscribe => {
  const commentsQuery = query(collection(db, FIRESTORE_COLLECTIONS.comments), where('postId', '==', postId), orderBy('createdAt', 'asc'));
  return onSnapshot(commentsQuery, (snapshot) => onComments(snapshot.docs.map(mapComment)), (error) => onError(error.message));
};

/** Creates a comment and updates related post or parent reply counters. */
export const createComment = async (payload: CreateCommentPayload): Promise<ServiceResult<string>> => {
  try {
    const commentRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.comments), {
      postId: payload.postId,
      authorId: payload.authorId,
      parentId: payload.parentId || null,
      content: payload.content.trim(),
      likesCount: 0,
      repliesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.posts, payload.postId), { commentsCount: increment(1), updatedAt: serverTimestamp() });
    if (payload.parentId) {
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.comments, payload.parentId), { repliesCount: increment(1), updatedAt: serverTimestamp() });
    }

    return { ok: true, data: commentRef.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to create comment.' };
  }
};

/** Deletes a comment through Firestore owner/moderator/admin rules. */
export const deleteComment = async (commentId: string): Promise<ServiceResult<true>> => {
  try {
    await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.comments, commentId));
    return { ok: true, data: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to delete comment.' };
  }
};
