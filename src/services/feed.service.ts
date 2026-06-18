import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';
import type { BSDCPost, PostType } from '@/types';
import { mapPostSnapshot } from './post.service';

/** Feed tabs supported by the Response 3 and Response 4 feed foundation. */
export type FeedType = 'for-you' | 'following' | 'trending' | 'community' | 'nearby' | 'discover' | 'saved';

/** Feed query options accepted by Firestore-backed feed reads. */
export interface FeedQueryOptions {
  readonly feedType: FeedType;
  readonly userId?: string | undefined;
  readonly communityId?: string | undefined;
  readonly postType?: PostType | undefined;
  readonly pageSize?: number;
  readonly cursor?: QueryDocumentSnapshot<DocumentData> | null;
}

/** Feed page response returned by one-shot pagination calls. */
export interface FeedPageResult {
  readonly posts: readonly BSDCPost[];
  readonly cursor: QueryDocumentSnapshot<DocumentData> | null;
}

/** Safely maps a Firestore post document into the strongly typed BSDCPost model. */
export const mapPostDocument = (snapshot: QueryDocumentSnapshot<DocumentData>): BSDCPost => {
  const mapped = mapPostSnapshot(snapshot);
  if (!mapped) {
    throw new Error('Post document unexpectedly disappeared while mapping feed data.');
  }
  return mapped;
};

/** Builds Firestore constraints for public post feeds without demo data. */
const buildPostFeedConstraints = (options: FeedQueryOptions): QueryConstraint[] => {
  const pageSize = options.pageSize ?? 20;
  const constraints: QueryConstraint[] = [where('visibility', '==', 'public')];

  if (options.postType) {
    constraints.push(where('type', '==', options.postType));
  }

  if ((options.feedType === 'following' || options.feedType === 'saved') && !options.userId) {
    constraints.push(where('authorId', '==', '__auth_required__'));
  }

  if (options.feedType === 'following' && options.userId) {
    constraints.push(where('authorId', '==', options.userId));
  }

  if (options.feedType === 'community' && options.communityId) {
    constraints.push(where('communityId', '==', options.communityId));
  }

  if (options.feedType === 'trending') {
    constraints.push(orderBy('viewsCount', 'desc'));
    constraints.push(orderBy('createdAt', 'desc'));
  } else {
    constraints.push(orderBy('createdAt', 'desc'));
  }

  if (options.cursor) {
    constraints.push(startAfter(options.cursor));
  }

  constraints.push(limit(pageSize));
  return constraints;
};

/** Reads saved post documents and resolves each referenced real post document. */
const fetchSavedPosts = async (options: FeedQueryOptions): Promise<FeedPageResult> => {
  if (!options.userId) {
    return { posts: [], cursor: null };
  }

  const pageSize = options.pageSize ?? 20;
  const savedConstraints: QueryConstraint[] = [where('userId', '==', options.userId), orderBy('createdAt', 'desc')];
  if (options.cursor) {
    savedConstraints.push(startAfter(options.cursor));
  }
  savedConstraints.push(limit(pageSize));

  const savedSnapshot = await getDocs(query(collection(db, 'savedPosts'), ...savedConstraints));
  const posts = await Promise.all(
    savedSnapshot.docs.map(async (savedDoc) => {
      const postId = String(savedDoc.data().postId || '');
      const postSnapshot = await getDoc(doc(db, FIRESTORE_COLLECTIONS.posts, postId));
      const post = mapPostSnapshot(postSnapshot);
      return post && post.visibility === 'public' ? post : null;
    })
  );

  return {
    posts: posts.filter((post): post is BSDCPost => post !== null),
    cursor: savedSnapshot.docs.length > 0 ? savedSnapshot.docs[savedSnapshot.docs.length - 1] ?? null : null
  };
};

/** Fetches one feed page from real Firestore collections. */
export const fetchFeedPage = async (options: FeedQueryOptions): Promise<FeedPageResult> => {
  if (options.feedType === 'saved') {
    return fetchSavedPosts(options);
  }

  const postsRef = collection(db, FIRESTORE_COLLECTIONS.posts);
  const feedQuery = query(postsRef, ...buildPostFeedConstraints(options));
  const snapshot = await getDocs(feedQuery);
  const posts = snapshot.docs.map(mapPostDocument);
  const cursor = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] ?? null : null;

  return { posts, cursor };
};

/** Subscribes to saved post references and resolves live public post documents. */
const subscribeToSavedFeed = (options: FeedQueryOptions, onPosts: (posts: readonly BSDCPost[]) => void, onError: (message: string) => void): Unsubscribe => {
  if (!options.userId) {
    onPosts([]);
    return () => undefined;
  }

  const savedQuery = query(collection(db, 'savedPosts'), where('userId', '==', options.userId), orderBy('createdAt', 'desc'), limit(options.pageSize ?? 20));
  return onSnapshot(savedQuery, async (snapshot) => {
    try {
      const posts = await Promise.all(
        snapshot.docs.map(async (savedDoc) => {
          const postSnapshot = await getDoc(doc(db, FIRESTORE_COLLECTIONS.posts, String(savedDoc.data().postId || '')));
          const post = mapPostSnapshot(postSnapshot);
          return post && post.visibility === 'public' ? post : null;
        })
      );
      onPosts(posts.filter((post): post is BSDCPost => post !== null));
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unable to load saved posts.');
    }
  }, (error) => onError(error.message));
};

/** Subscribes to the first page of a real-time feed for instant post updates. */
export const subscribeToFeed = (options: FeedQueryOptions, onPosts: (posts: readonly BSDCPost[]) => void, onError: (message: string) => void): Unsubscribe => {
  if (options.feedType === 'saved') {
    return subscribeToSavedFeed(options, onPosts, onError);
  }

  const postsRef = collection(db, FIRESTORE_COLLECTIONS.posts);
  const feedQuery = query(postsRef, ...buildPostFeedConstraints({ ...options, cursor: null }));

  return onSnapshot(
    feedQuery,
    (snapshot) => onPosts(snapshot.docs.map(mapPostDocument)),
    (error) => onError(error.message)
  );
};
