/**
 * src/hooks/useFeed.js
 * ---------------------------------------------------------------------------
 * Single hook that powers all four feed tabs.
 *
 *   const { posts, loading, hasMore, loadMore, refresh } = useFeed({
 *     mode: 'for-you' | 'following' | 'trending' | 'nearby' | 'tag' | 'community',
 *     viewer,        // current Firestore user profile (or null)
 *     tag,           // for mode='tag'
 *     community,     // for mode='community'
 *     filterType     // optional post-type filter (e.g. 'job')
 *   });
 *
 * Caching strategy:
 *   - We track a `lastDoc` cursor for Firestore pagination.
 *   - Followed-author IDs are loaded once per session.
 *   - Re-ranking happens client-side after each page fetch.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  collection, query, where, orderBy, limit, startAfter, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import {
  rankForYou, rankTrending, rankNearby
} from '../utils/feedAlgorithm.js';

const PAGE_SIZE = 12;

/** Get the UIDs the viewer follows. Returns a Set. */
async function loadFollowingSet(uid) {
  if (!uid) return new Set();
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'following'));
    return new Set(snap.docs.map((d) => d.id));
  } catch {
    return new Set();
  }
}

export default function useFeed({
  mode = 'for-you',
  viewer = null,
  tag = null,
  community = null,
  filterType = null
} = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const lastDocRef = useRef(null);
  const followingRef = useRef(new Set());
  const cacheVersionRef = useRef(0);

  /**
   * Build the base Firestore query for the active mode.
   * We always order by createdAt desc so the cursor pagination is consistent.
   */
  const buildQuery = useCallback((cursor) => {
    const constraints = [where('status', '==', 'active')];

    if (filterType) constraints.push(where('type', '==', filterType));
    if (mode === 'tag' && tag) constraints.push(where('tags', 'array-contains', tag));
    if (mode === 'community' && community) constraints.push(where('community', '==', community));
    if (mode === 'following' && viewer) {
      // We can't do array-contains-any with more than 30 IDs in Firestore;
      // we filter client-side AFTER fetching when the following list is large.
      const ids = [...followingRef.current].slice(0, 30);
      if (ids.length > 0) constraints.push(where('authorId', 'in', ids));
      else {
        // No follows yet — return empty.
        return null;
      }
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(PAGE_SIZE));
    if (cursor) constraints.push(startAfter(cursor));
    return query(collection(db, 'posts'), ...constraints);
  }, [mode, tag, community, filterType, viewer]);

  /** Apply client-side ranking based on mode. */
  const rank = useCallback((items) => {
    if (mode === 'trending') return rankTrending(items);
    if (mode === 'nearby') return rankNearby(items, viewer);
    if (mode === 'for-you') return rankForYou(items, {
      user: viewer, followingSet: followingRef.current
    });
    // following/tag/community: keep chronological order (most recent first)
    return items;
  }, [mode, viewer]);

  /** Load the first page (or reset after mode/filter change). */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPosts([]);
    lastDocRef.current = null;
    setHasMore(true);

    try {
      if ((mode === 'following' || mode === 'for-you') && viewer) {
        followingRef.current = await loadFollowingSet(viewer.uid);
      }
      const q = buildQuery(null);
      if (!q) { setLoading(false); setHasMore(false); return; }
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
      setHasMore(snap.docs.length === PAGE_SIZE);
      setPosts(rank(items));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[BSDC] feed load:', err);
      setError(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [mode, viewer, buildQuery, rank]);

  /** Load the next page and append + re-rank. */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const q = buildQuery(lastDocRef.current);
      if (!q) { setLoading(false); setHasMore(false); return; }
      const snap = await getDocs(q);
      const more = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      lastDocRef.current = snap.docs[snap.docs.length - 1] || lastDocRef.current;
      setHasMore(snap.docs.length === PAGE_SIZE);
      setPosts((prev) => {
        // Re-rank only the new items, then append (avoids reshuffling above).
        return [...prev, ...rank(more)];
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[BSDC] feed loadMore:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, buildQuery, rank]);

  // Initial load + reset when mode/tag/community/filterType changes.
  useEffect(() => {
    cacheVersionRef.current++;
    load();
    // We intentionally do NOT depend on `load` directly to avoid infinite loops;
    // load's identity changes only when its inputs change anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tag, community, filterType, viewer?.uid]);

  /** Optimistic mutators — let consumers prepend a new post or remove one. */
  const prependPost = useCallback((post) => {
    setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
  }, []);
  const removePost = useCallback((id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    posts,
    loading,
    hasMore,
    error,
    loadMore,
    refresh: load,
    prependPost,
    removePost
  };
}
