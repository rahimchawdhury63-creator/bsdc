/**
 * src/hooks/useSearch.js
 * ---------------------------------------------------------------------------
 * Debounced live search.
 *
 *   const { results, loading } = useSearch(query, { types: ['posts','users'] });
 *
 * Internally it:
 *   1. Debounces the query 250 ms.
 *   2. Fetches a recent slice from Firestore (posts: latest 60, users: latest 60).
 *   3. Re-ranks client-side via searchAlgorithm.
 *   4. Returns { posts, users, suggestions, didYouMean }.
 *
 * Search history (last 8 queries) is kept in localStorage and surfaced
 * to the UI via the `recent` array.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  collection, query, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { rankPostsForQuery, rankUsersForQuery, tokenize, didYouMean } from '../utils/searchAlgorithm.js';
import { bsdcDebounce } from '../scripts/interactions.js';

const HISTORY_KEY = 'bsdc.search.history.v1';
const MAX_HISTORY = 8;

/** Read/write search history (last N queries). */
function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}
function writeHistory(arr) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, MAX_HISTORY))); }
  catch { /* quota — ignore */ }
}

/** Push a query into history (deduped, MRU). */
export function pushHistory(q) {
  const norm = String(q || '').trim();
  if (!norm) return;
  const cur = readHistory();
  const next = [norm, ...cur.filter((x) => x !== norm)].slice(0, MAX_HISTORY);
  writeHistory(next);
}

export function clearHistory() {
  writeHistory([]);
}

export default function useSearch(rawQuery, { types = ['posts', 'users'] } = {}) {
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState({ posts: [], users: [], didYouMean: null });
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => readHistory());
  const debouncerRef = useRef();

  // Init debounced setter once.
  useEffect(() => {
    if (!debouncerRef.current) {
      debouncerRef.current = bsdcDebounce((v) => setDebounced(v), 250);
    }
  }, []);

  // Push the latest raw query into the debouncer on every change.
  useEffect(() => {
    if (!debouncerRef.current) return;
    debouncerRef.current(rawQuery || '');
  }, [rawQuery]);

  // When debounced changes, run the search.
  useEffect(() => {
    let cancelled = false;
    const q = debounced.trim();
    if (q.length < 2) {
      setResults({ posts: [], users: [], didYouMean: null });
      setLoading(false);
      return;
    }

    setLoading(true);

    (async () => {
      try {
        const tasks = [];

        if (types.includes('posts')) {
          tasks.push(getDocs(query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(60)
          )));
        } else { tasks.push(null); }

        if (types.includes('users')) {
          tasks.push(getDocs(query(
            collection(db, 'users'),
            orderBy('updatedAt', 'desc'),
            limit(60)
          )));
        } else { tasks.push(null); }

        const [postSnap, userSnap] = await Promise.all(tasks);
        if (cancelled) return;

        const rawPosts = postSnap ? postSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => p.status !== 'deleted') : [];

        const rawUsers = userSnap ? userSnap.docs.map((d) => ({ id: d.id, ...d.data() })) : [];

        const posts = rankPostsForQuery(rawPosts, q).slice(0, 30);
        const users = rankUsersForQuery(rawUsers, q).slice(0, 12);

        // Build "did you mean" vocabulary from tags + usernames.
        let vocab = new Set();
        rawPosts.forEach((p) => (p.tags || []).forEach((t) => vocab.add(t)));
        rawUsers.forEach((u) => vocab.add(u.username));
        const suggestion = posts.length === 0 && users.length === 0
          ? didYouMean(q, [...vocab])
          : null;

        setResults({ posts, users, didYouMean: suggestion });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[BSDC] search:', err);
        if (!cancelled) setResults({ posts: [], users: [], didYouMean: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [debounced, types.join('|')]);

  /** Commit the search (push to history). */
  const commit = useCallback((q) => {
    pushHistory(q);
    setRecent(readHistory());
  }, []);

  return {
    results,
    loading,
    recent,
    tokens: tokenize(debounced),
    commit,
    clearHistory: () => { clearHistory(); setRecent([]); }
  };
}
