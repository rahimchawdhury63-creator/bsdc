/**
 * src/utils/feedAlgorithm.js
 * ---------------------------------------------------------------------------
 * Pure functions for ranking posts in the For-You / Trending / Nearby feeds.
 *
 * Why client-side ranking:
 *   - We can't run Cloud Functions (per spec — no Workers either).
 *   - Firestore returns posts sorted by createdAt; we re-rank a window
 *     of 100-200 candidates on the client. This is cheap on phones because
 *     scoring is O(n) over already-fetched docs.
 *
 * Scoring model:
 *   score = engagement(post) * recencyDecay(post) * personalBoost(post, user)
 *
 *   engagement  = likes + 2*comments + 3*shares + 0.1*views + 5*bookmarks
 *   recency     = exp(-ageInHours / HALF_LIFE_HOURS)  → newer = closer to 1
 *   personal    = matched tag/skill/follow bonus (1..3)
 *
 * Returns the same shape as input so callers can swap drop-in replace.
 * ---------------------------------------------------------------------------
 */

import { toDate } from './dateFormatter.js';

const HALF_LIFE_HOURS = 36;             // post hotness halves every ~1.5 days
const MAX_BOOST = 3;                    // cap personalization multiplier

/**
 * Engagement score — raw, unitless.
 * Story posts use a smaller weight on views (they expire quickly).
 */
export function engagementScore(post) {
  const likes     = post.likes     || 0;
  const comments  = post.comments  || 0;
  const shares    = post.shares    || 0;
  const views     = post.views     || 0;
  const bookmarks = post.bookmarks || 0;
  const viewWeight = post.type === 'story' ? 0.05 : 0.1;
  return likes + 2 * comments + 3 * shares + viewWeight * views + 5 * bookmarks;
}

/**
 * Recency decay — exponential half-life.
 * Returns a multiplier in (0..1].
 */
export function recencyMultiplier(post) {
  const d = toDate(post.createdAt);
  if (!d) return 0.5;
  const ageHours = (Date.now() - d.getTime()) / 3_600_000;
  if (ageHours < 0) return 1;
  return Math.pow(0.5, ageHours / HALF_LIFE_HOURS);
}

/**
 * Personalization multiplier based on the viewer's profile.
 *
 *  - +1.0 per matched tag/skill (capped)
 *  - +1.5 if author is in followingSet
 *  - +0.5 if post.community is in viewer.communities
 *  - +0.5 if post.language matches viewer.language
 */
export function personalBoost(post, ctx = {}) {
  const { user, followingSet = new Set(), communities = new Set() } = ctx;
  if (!user) return 1;
  let boost = 1;
  const skills = new Set((user.skills || []).map((s) => String(s).toLowerCase()));
  const tags = (post.tags || []).map((t) => String(t).toLowerCase());
  let matched = 0;
  for (const t of tags) if (skills.has(t)) matched++;
  boost += Math.min(matched, 3) * 0.8;
  if (followingSet.has(post.authorId)) boost += 1.5;
  if (post.community && communities.has(post.community)) boost += 0.5;
  if (post.language && user.language && post.language === user.language) boost += 0.3;
  return Math.min(MAX_BOOST, boost);
}

/**
 * Distance in km between two {lat,lng} (haversine). 0 if either missing.
 */
function distanceKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return Infinity;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const v = s1 * s1 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(v));
}

/**
 * Compute a numeric score for one post. Higher = better.
 */
export function scorePost(post, ctx = {}) {
  return engagementScore(post) * recencyMultiplier(post) + 0.1 * personalBoost(post, ctx);
}

/**
 * Rank a batch of posts for the "For You" feed.
 * Returns a NEW sorted array; does not mutate input.
 */
export function rankForYou(posts, ctx = {}) {
  return [...posts]
    .map((p) => ({ post: p, score: scorePost(p, ctx) * personalBoost(p, ctx) }))
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
}

/**
 * Rank for the "Trending" feed — global engagement * recency, no personal.
 */
export function rankTrending(posts) {
  return [...posts]
    .map((p) => ({ post: p, score: engagementScore(p) * recencyMultiplier(p) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
}

/**
 * Filter + sort for "Nearby" — uses simple text-match on `location` until
 * we have geolocation lat/lng on posts.
 */
export function rankNearby(posts, viewer) {
  if (!viewer) return rankTrending(posts);
  const here = (viewer.location || '').toLowerCase();
  if (!here) return rankTrending(posts);
  const hereTokens = here.split(/[,\s]+/).filter((t) => t.length >= 3);
  return [...posts]
    .map((p) => {
      const loc = String(p.location || '').toLowerCase();
      let proximity = 0;
      for (const tok of hereTokens) if (loc.includes(tok)) proximity++;
      const geoDist = distanceKm(viewer.geo, p.geo);
      const geoBoost = geoDist === Infinity ? 0 : Math.max(0, 5 - geoDist / 20);
      return {
        post: p,
        score: scorePost(p) + proximity * 2 + geoBoost
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
}
