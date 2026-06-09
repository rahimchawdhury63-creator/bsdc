/**
 * src/utils/pointsCalculator.js
 * ---------------------------------------------------------------------------
 * Pure helpers for the BSDC Points + Ranking system.
 * Full Points context + transfer logic arrives in Response 7.
 * ---------------------------------------------------------------------------
 */

export const POINTS_RULES = {
  post: 10,
  like: 1,
  comment: 2,
  follower: 5,
  dailyLogin: 3,
  courseComplete: 100,
  verified: 50
};

export const RANKS = [
  { id: 'bronze',  label: 'Bronze',  min: 0,     color: '#cd7f32' },
  { id: 'silver',  label: 'Silver',  min: 500,   color: '#a8a8a8' },
  { id: 'gold',    label: 'Gold',    min: 2000,  color: '#d4af37' },
  { id: 'diamond', label: 'Diamond', min: 10000, color: '#5cb6e3' },
  { id: 'legend',  label: 'Legend',  min: 50000, color: '#7e57c2' }
];

/** Resolve a rank object from a point total. */
export function rankFromPoints(points = 0) {
  let current = RANKS[0];
  for (const r of RANKS) if (points >= r.min) current = r;
  return current;
}

/** % progress toward the NEXT rank (0..1). */
export function rankProgress(points = 0) {
  const cur = rankFromPoints(points);
  const idx = RANKS.findIndex((r) => r.id === cur.id);
  const next = RANKS[idx + 1];
  if (!next) return 1;
  const span = next.min - cur.min;
  return Math.max(0, Math.min(1, (points - cur.min) / span));
}

/** Pretty format: 1500 → "1.5K". */
export function formatPoints(n) {
  n = Number(n) || 0;
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}
