import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, where, type DocumentData, type QueryDocumentSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { ServiceResult } from '@/types';

/** Public story document shape used by the story bar and viewer. */
export interface BSDCStory {
  readonly id: string;
  readonly authorId: string;
  readonly type: 'image' | 'text';
  readonly imageUrl?: string | undefined;
  readonly textContent?: string | undefined;
  readonly backgroundColor?: string | undefined;
  readonly viewerIds: readonly string[];
  readonly viewCount: number;
  readonly expiresAt: Date;
  readonly createdAt: unknown;
}

/** Payload accepted by the story creation form. */
export interface CreateStoryPayload {
  readonly authorId: string;
  readonly textContent: string;
  readonly backgroundColor: string;
}

/** Maps a Firestore story snapshot into a render-safe story object. */
const mapStoryDocument = (snapshot: QueryDocumentSnapshot<DocumentData>): BSDCStory => {
  const data = snapshot.data();
  const expiresAtValue = data.expiresAt?.toDate instanceof Function ? data.expiresAt.toDate() : new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    id: snapshot.id,
    authorId: String(data.authorId || ''),
    type: data.type === 'image' ? 'image' : 'text',
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
    textContent: typeof data.textContent === 'string' ? data.textContent : undefined,
    backgroundColor: typeof data.backgroundColor === 'string' ? data.backgroundColor : '#1B4332',
    viewerIds: Array.isArray(data.viewerIds) ? data.viewerIds : [],
    viewCount: Number(data.viewCount || 0),
    expiresAt: expiresAtValue,
    createdAt: data.createdAt
  };
};

/** Subscribes to non-expired real Firestore stories. */
export const subscribeToActiveStories = (onStories: (stories: readonly BSDCStory[]) => void, onError: (message: string) => void): Unsubscribe => {
  const storiesRef = collection(db, FIRESTORE_COLLECTIONS.stories);
  const storiesQuery = query(storiesRef, where('expiresAt', '>', new Date()), orderBy('expiresAt', 'asc'), limit(50));

  return onSnapshot(
    storiesQuery,
    (snapshot) => onStories(snapshot.docs.map(mapStoryDocument)),
    (error) => onError(error.message)
  );
};

/** Creates a text story that expires after 24 hours using real Firestore writes. */
export const createTextStory = async (payload: CreateStoryPayload): Promise<ServiceResult<string>> => {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.stories), {
      authorId: payload.authorId,
      type: 'text',
      textContent: payload.textContent,
      backgroundColor: payload.backgroundColor,
      viewerIds: [],
      viewCount: 0,
      expiresAt,
      createdAt: serverTimestamp()
    });

    return { ok: true, data: docRef.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to create story.' };
  }
};
