/**
 * src/firebase/firestore.js
 * ---------------------------------------------------------------------------
 * Generic Firestore CRUD helpers + domain-specific helpers used across BSDC.
 *
 * Design notes:
 *  - We expose small, composable functions rather than a giant "DAL" class.
 *  - All writes use serverTimestamp() so client clock-drift doesn't break
 *    the feed ordering algorithm.
 *  - All "list" helpers return arrays (already mapped from snapshots) and
 *    accept a `lastDoc` cursor for pagination — used by useInfiniteScroll.
 *  - Counters (likes, followers, etc.) use Firestore increment() to avoid
 *    read-modify-write races.
 * ---------------------------------------------------------------------------
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from './config.js';

/* ===========================================================================
 *  GENERIC CRUD
 * =========================================================================*/

/** Create a doc with an auto-generated ID. Returns the new doc ID. */
export async function createDoc(collectionName, data) {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  // Patch the ID inside the document too so reads don't have to remember it.
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

/** Create or overwrite a doc with a known ID. */
export async function setDocById(collectionName, id, data, merge = true) {
  await setDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge });
  return id;
}

/** Fetch a single doc by ID. Returns null if not found. */
export async function getDocById(collectionName, id) {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Update a single doc (partial). */
export function updateDocById(collectionName, id, data) {
  return updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/** Hard delete. Use sparingly — soft-delete (status:'deleted') is preferred. */
export function deleteDocById(collectionName, id) {
  return deleteDoc(doc(db, collectionName, id));
}

/* ===========================================================================
 *  USERS
 * =========================================================================*/

/** Get user by Firebase UID. */
export function getUser(uid) {
  return getDocById('users', uid);
}

/** Find user by their public @username. Returns null if not found. */
export async function getUserByUsername(username) {
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

/** Check if a username is available. Case-insensitive. */
export async function isUsernameAvailable(username) {
  const existing = await getUserByUsername(username.toLowerCase());
  return existing === null;
}

/** Update user profile fields. */
export function updateUser(uid, data) {
  return updateDocById('users', uid, data);
}

/* ===========================================================================
 *  POSTS
 * =========================================================================*/

/**
 * Create a post. Auto-increments the author's postsCount.
 * Returns the new post ID.
 */
export async function createPost(authorUid, postData) {
  const batch = writeBatch(db);
  const postRef = doc(collection(db, 'posts'));

  batch.set(postRef, {
    ...postData,
    id: postRef.id,
    authorId: authorUid,
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    bookmarks: 0,
    engagementScore: 0,
    status: 'active',
    isFeatured: false,
    isApproved: true,
    isPinned: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Bump author's post counter.
  batch.update(doc(db, 'users', authorUid), {
    postsCount: increment(1),
    updatedAt: serverTimestamp()
  });

  await batch.commit();
  return postRef.id;
}

/**
 * Paginated post fetch ordered by createdAt desc.
 * Pass the previously returned `lastDoc` to continue.
 */
export async function listPosts({ pageSize = 10, lastDoc = null, filterType = null } = {}) {
  let q = query(
    collection(db, 'posts'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  if (filterType) {
    q = query(
      collection(db, 'posts'),
      where('status', '==', 'active'),
      where('type', '==', filterType),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  const snap = await getDocs(q);
  return {
    posts: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === pageSize
  };
}

/** Get a single post by slug — used by /blog/:slug etc. */
export async function getPostBySlug(slug) {
  const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/**
 * Toggle a like on a post atomically.
 * We store likes as a sub-collection: posts/{postId}/likes/{userId}
 * AND keep a counter on the post doc via increment(). Best of both worlds:
 *  - O(1) read for total likes (no count() query needed)
 *  - O(1) check if current user liked it (sub-doc exists?)
 *
 * Returns { liked, post } so callers can fire notifications + award points
 * without re-fetching.
 */
export async function toggleLike(postId, userId) {
  const likeRef = doc(db, 'posts', postId, 'likes', userId);
  const postRef = doc(db, 'posts', postId);

  const result = await runTransaction(db, async (tx) => {
    const [likeSnap, postSnap] = await Promise.all([tx.get(likeRef), tx.get(postRef)]);
    const post = postSnap.exists() ? { id: postSnap.id, ...postSnap.data() } : null;
    if (likeSnap.exists()) {
      tx.delete(likeRef);
      tx.update(postRef, { likes: increment(-1) });
      return { liked: false, post };
    } else {
      tx.set(likeRef, { userId, createdAt: serverTimestamp() });
      tx.update(postRef, { likes: increment(1) });
      return { liked: true, post };
    }
  });

  return result;
}

/** Check if a user has liked a post. */
export async function hasUserLiked(postId, userId) {
  if (!userId) return false;
  const snap = await getDoc(doc(db, 'posts', postId, 'likes', userId));
  return snap.exists();
}

/** Increment view count (fire-and-forget; failures are non-critical). */
export function incrementViews(postId) {
  return updateDoc(doc(db, 'posts', postId), { views: increment(1) }).catch(() => {});
}

/** Soft-delete a post (preferred over hard delete for moderation history). */
export function softDeletePost(postId) {
  return updateDocById('posts', postId, { status: 'deleted' });
}

/* ===========================================================================
 *  COMMENTS
 * =========================================================================*/

export async function addComment(postId, authorData, content, parentId = null) {
  const commentRef = await addDoc(collection(db, 'comments'), {
    postId,
    parentId,
    authorId: authorData.uid,
    authorUsername: authorData.username,
    authorDisplayName: authorData.displayName,
    authorPhotoURL: authorData.photoURL || '',
    content,
    likes: 0,
    isEdited: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Bump comment count on the post.
  await updateDoc(doc(db, 'posts', postId), { comments: increment(1) });
  return commentRef.id;
}

export async function listComments(postId, { pageSize = 20, lastDoc = null } = {}) {
  let q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    where('parentId', '==', null),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snap = await getDocs(q);
  return {
    comments: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === pageSize
  };
}

/* ===========================================================================
 *  FOLLOW / UNFOLLOW
 * =========================================================================*/

/**
 * Toggle following: writes to /users/{me}/following/{them}
 * and /users/{them}/followers/{me}, plus updates counters atomically.
 */
export async function toggleFollow(meUid, themUid) {
  if (meUid === themUid) throw new Error("You can't follow yourself");
  const followingRef = doc(db, 'users', meUid, 'following', themUid);
  const followerRef = doc(db, 'users', themUid, 'followers', meUid);

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(followingRef);
    if (snap.exists()) {
      tx.delete(followingRef);
      tx.delete(followerRef);
      tx.update(doc(db, 'users', meUid), { following: increment(-1) });
      tx.update(doc(db, 'users', themUid), { followers: increment(-1) });
      return { following: false };
    } else {
      const ts = serverTimestamp();
      tx.set(followingRef, { uid: themUid, createdAt: ts });
      tx.set(followerRef, { uid: meUid, createdAt: ts });
      tx.update(doc(db, 'users', meUid), { following: increment(1) });
      tx.update(doc(db, 'users', themUid), { followers: increment(1) });
      return { following: true };
    }
  });
}

export async function isFollowing(meUid, themUid) {
  if (!meUid) return false;
  const snap = await getDoc(doc(db, 'users', meUid, 'following', themUid));
  return snap.exists();
}

/* ===========================================================================
 *  REALTIME SUBSCRIPTIONS
 * =========================================================================*/

/** Subscribe to a single doc. Returns unsubscribe(). */
export function subscribeDoc(collectionName, id, callback) {
  return onSnapshot(doc(db, collectionName, id), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

/** Subscribe to a query. */
export function subscribeQuery(q, callback) {
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/* ===========================================================================
 *  ARRAY-UNION / ARRAY-REMOVE EXPORTS (utility re-exports)
 * =========================================================================*/

export { arrayUnion, arrayRemove, increment, serverTimestamp, query, where, orderBy, limit, collection, doc, getDocs };
