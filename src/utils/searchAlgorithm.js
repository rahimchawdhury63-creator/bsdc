/**
 * src/utils/searchAlgorithm.js
 * ---------------------------------------------------------------------------
 * BSDC's custom search ranking. Firestore has no full-text search built-in
 * and per spec we cannot use Workers, so we fetch a recent slice of docs
 * and rank them client-side.
 *
 * Match dimensions (each contributes to score):
 *   - Title exact phrase match           +30
 *   - Title contains every term          +20
 *   - Title contains any term            +10 each
 *   - Body contains term (counted)       +1 per occurrence (capped 10)
 *   - Tag exact match                    +15 each
 *   - Username/displayName match         +20 (profile results)
 *   - Bangla normalization match         same as English
 *   - Boost by engagement * 0.05
 *   - Boost by recency (recencyMult)
 *
 * "Did you mean" — Levenshtein distance ≤ 2 against popular query log.
 * ---------------------------------------------------------------------------
 */

import { plainText } from './seoGenerator.js';
import { recencyMultiplier, engagementScore } from './feedAlgorithm.js';

/** Normalize a string for matching: lowercase, strip diacritics, collapse ws. */
export function normalize(s = '') {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split a search query into terms (length ≥ 2). */
export function tokenize(q) {
  return normalize(q).split(/[^a-z0-9+#.\u0980-\u09ff]+/).filter((t) => t.length >= 2);
}

/** Count non-overlapping occurrences of `needle` in `haystack`. */
function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let n = 0;
  let pos = 0;
  while ((pos = haystack.indexOf(needle, pos)) !== -1) {
    n++;
    pos += needle.length;
  }
  return Math.min(n, 10);
}

/**
 * Score a single post for a given query.
 */
export function scorePostForQuery(post, query) {
  const qNorm = normalize(query);
  const terms = tokenize(query);
  if (!qNorm || terms.length === 0) return 0;

  const titleN = normalize(post.title || '');
  const bodyN = normalize(plainText(post.content || ''));
  const tagsN = (post.tags || []).map((t) => normalize(t));

  let score = 0;

  if (titleN && titleN.includes(qNorm)) score += 30;
  if (terms.every((t) => titleN.includes(t))) score += 20;
  for (const t of terms) {
    if (titleN.includes(t)) score += 10;
    score += countOccurrences(bodyN, t);
    if (tagsN.includes(t)) score += 15;
  }

  // Boost by engagement + recency so newer/hotter posts rise.
  score += engagementScore(post) * 0.05;
  score *= recencyMultiplier(post) * 0.6 + 0.4; // never zero out

  return score;
}

/** Sort a list of posts by query relevance. Drops zero-score items. */
export function rankPostsForQuery(posts, query) {
  return posts
    .map((p) => ({ post: p, score: scorePostForQuery(p, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
}

/** Score a user profile for a query. */
export function scoreUserForQuery(user, query) {
  const qNorm = normalize(query);
  const terms = tokenize(query);
  if (!qNorm) return 0;

  const uname = normalize(user.username || '');
  const dname = normalize(user.displayName || '');
  const title = normalize(user.title || '');
  const bio   = normalize(user.bio || '');
  const skillsN = (user.skills || []).map((s) => normalize(s));

  let score = 0;
  if (uname === qNorm) score += 100;
  if (uname.includes(qNorm)) score += 40;
  if (dname.includes(qNorm)) score += 25;
  if (title.includes(qNorm)) score += 15;
  for (const t of terms) {
    if (bio.includes(t)) score += 2;
    if (skillsN.includes(t)) score += 10;
  }
  // Boost verified + popular profiles slightly.
  if (user.isVerified) score *= 1.1;
  score += Math.log10((user.followers || 0) + 1) * 5;
  return score;
}

export function rankUsersForQuery(users, query) {
  return users
    .map((u) => ({ user: u, score: scoreUserForQuery(u, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ user }) => user);
}

/** Levenshtein distance — used by "Did you mean…?" suggestions. */
export function levenshtein(a, b) {
  a = normalize(a); b = normalize(b);
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (m === 0 || n === 0) return Math.max(m, n);
  let prev = Array(n + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[n];
}

/** Suggest closest match from a vocabulary (e.g., popular search log). */
export function didYouMean(query, vocabulary) {
  if (!query || !vocabulary || vocabulary.length === 0) return null;
  let best = null;
  let bestDist = 3; // require dist ≤ 2
  for (const v of vocabulary) {
    const d = levenshtein(query, v);
    if (d < bestDist) { bestDist = d; best = v; }
  }
  return best;
}
