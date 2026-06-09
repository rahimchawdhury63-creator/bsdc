/**
 * src/utils/seoGenerator.js
 * ---------------------------------------------------------------------------
 * Auto-generate SEO fields from raw post content.
 *
 * Output for every post:
 *   - seoTitle      : "[Title] | BSDC"  (capped at 60 chars)
 *   - seoDescription: first 160 chars, plain text, ellipsised
 *   - seoKeywords   : top tags + auto-extracted keywords
 *   - excerpt       : same as description (used by feed cards)
 *   - canonicalUrl  : full https://www.bsdc.info.bd/<type>/<slug>
 *   - ogImage       : first image / video poster / brand fallback
 * ---------------------------------------------------------------------------
 */

import { slugifyUnique } from './slugGenerator.js';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';
const SITE_NAME = 'BSDC';
const FALLBACK_OG = `${SITE_URL}/og-image.png`;

/**
 * Map a post type to its URL segment.
 * Single source of truth — used by SEO + feed + share links.
 */
export const TYPE_URL_SEGMENT = {
  text:    'post',
  image:   'post',
  video:   'video',
  qa:      'qa',
  blog:    'blog',
  doc:     'doc',
  wiki:    'wiki',
  code:    'code',
  story:   'story',
  project: 'project',
  job:     'jobs',
  notice:  'notice',
  poll:    'poll',
  event:   'event'
};

/** Build the canonical URL for a post. */
export function postUrl(post) {
  if (!post) return SITE_URL;
  const seg = TYPE_URL_SEGMENT[post.type] || 'post';
  const slug = post.slug || post.id;
  return `${SITE_URL}/${seg}/${slug}`;
}

/** Strip markdown/HTML noise and collapse whitespace. */
export function plainText(s = '') {
  return String(s)
    .replace(/```[\s\S]*?```/g, ' ')        // fenced code blocks
    .replace(/`[^`]*`/g, ' ')               // inline code
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')   // images
    .replace(/\[[^\]]*]\([^)]*\)/g, '$1')   // [text](url) → text
    .replace(/<[^>]+>/g, ' ')               // HTML
    .replace(/[#>*_~`-]+/g, ' ')            // md punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/** Truncate text on a word boundary. */
export function truncate(s = '', max = 160) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(' ');
  return `${cut.slice(0, last > 80 ? last : max)}…`;
}

/** Heuristic keyword extraction — most-common nouns/tech tokens. */
const STOP = new Set([
  'the','a','an','and','or','to','of','in','for','with','on','is','are','was','were',
  'be','been','being','this','that','it','as','by','at','from','i','we','you','he','she',
  'they','my','our','your','their','what','when','where','why','how','can','could','should',
  'will','would','do','does','did','have','has','had','not','no','yes','if','so','but'
]);
export function extractKeywords(text, max = 8) {
  const counts = new Map();
  text.toLowerCase().split(/[^a-z0-9+#.\u0980-\u09ff]+/).forEach((w) => {
    if (w.length < 3 || STOP.has(w)) return;
    counts.set(w, (counts.get(w) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

/** Pick the best OG image from a post's media. */
export function pickOgImage(post) {
  if (post.ogImage) return post.ogImage;
  if (post.images?.[0]) return post.images[0];
  if (post.videos?.[0]?.thumbUrl) return post.videos[0].thumbUrl;
  return FALLBACK_OG;
}

/**
 * Generate all SEO fields for a post object. Returns a new object
 * with seoTitle, seoDescription, seoKeywords, excerpt, ogImage, slug.
 *
 * Pass an existing slug to keep URL stable on edits; omit to auto-generate.
 */
export function generatePostSEO(post, { keepSlug } = {}) {
  const title = (post.title || '').trim();
  const body = plainText(post.content || '');
  const slug = keepSlug || post.slug || slugifyUnique(title || body.slice(0, 40) || 'post');

  const seoTitle = title
    ? truncate(`${title} | ${SITE_NAME}`, 70)
    : `BSDC Post | ${SITE_NAME}`;

  const seoDescription = truncate(body || title, 160);

  const seoKeywords = [
    ...(post.tags || []).map((t) => String(t).toLowerCase()),
    ...extractKeywords(`${title} ${body}`, 6)
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 12);

  return {
    slug,
    seoTitle,
    seoDescription,
    seoKeywords,
    excerpt: seoDescription,
    canonicalUrl: postUrl({ ...post, slug }),
    ogImage: pickOgImage(post)
  };
}

export { SITE_URL, SITE_NAME };
