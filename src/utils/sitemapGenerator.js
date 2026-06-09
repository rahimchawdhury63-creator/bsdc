/**
 * src/utils/sitemapGenerator.js
 * ---------------------------------------------------------------------------
 * Pure functions that build sitemap XML. Used by scripts/generate-sitemap.js
 * at BUILD TIME (Node) and can also be re-used at runtime if we ever decide
 * to expose a /api/sitemap endpoint via a tiny Firebase Function.
 *
 * Per spec: NO Cloudflare Workers — generation runs during `npm run build`.
 * ---------------------------------------------------------------------------
 */

const SITE_URL = (typeof process !== 'undefined' && process.env?.VITE_SITE_URL)
  || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL)
  || 'https://www.bsdc.info.bd';

/** XML-escape a URL/string. */
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** ISO date for a Firestore Timestamp / JS Date / number / undefined. */
function isoOf(v) {
  if (!v) return new Date().toISOString();
  if (typeof v?.toDate === 'function') return v.toDate().toISOString();
  if (typeof v === 'number') return new Date(v).toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** One <url> entry. */
export function urlEntry({ loc, lastmod, changefreq = 'weekly', priority = 0.6, images = [], alternates = [] }) {
  const imgs = images.map((u) =>
    `    <image:image><image:loc>${esc(u)}</image:loc></image:image>`).join('\n');
  const alts = alternates.map((a) =>
    `    <xhtml:link rel="alternate" hreflang="${esc(a.lang)}" href="${esc(a.href)}" />`).join('\n');
  return [
    '  <url>',
    `    <loc>${esc(loc)}</loc>`,
    `    <lastmod>${esc(lastmod || new Date().toISOString())}</lastmod>`,
    `    <changefreq>${esc(changefreq)}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    alts,
    imgs,
    '  </url>'
  ].filter(Boolean).join('\n');
}

/** Wrap entries in a sitemap document. */
export function buildSitemapXml(entries) {
  const body = entries.map(urlEntry).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    body,
    '</urlset>'
  ].join('\n');
}

/**
 * Build a complete sitemap from raw Firestore documents.
 * @param {Object} data
 * @param {Array}  data.posts        public posts
 * @param {Array}  data.users        public profiles
 * @param {Array}  data.communities  public communities
 */
export function buildFullSitemap({ posts = [], users = [], communities = [] } = {}) {
  const now = new Date().toISOString();

  // Static + hub pages.
  const entries = [
    { loc: `${SITE_URL}/`,             lastmod: now, changefreq: 'hourly',  priority: 1.0 },
    { loc: `${SITE_URL}/explore`,      lastmod: now, changefreq: 'hourly',  priority: 0.9 },
    { loc: `${SITE_URL}/communities`,  lastmod: now, changefreq: 'daily',   priority: 0.8 },
    { loc: `${SITE_URL}/channels`,     lastmod: now, changefreq: 'daily',   priority: 0.7 },
    { loc: `${SITE_URL}/jobs`,         lastmod: now, changefreq: 'daily',   priority: 0.8 },
    { loc: `${SITE_URL}/courses`,      lastmod: now, changefreq: 'weekly',  priority: 0.8 },
    { loc: `${SITE_URL}/leaderboard`,  lastmod: now, changefreq: 'daily',   priority: 0.6 },
    { loc: `${SITE_URL}/about`,        lastmod: now, changefreq: 'monthly', priority: 0.4 },
    { loc: `${SITE_URL}/privacy`,      lastmod: now, changefreq: 'yearly',  priority: 0.3 },
    { loc: `${SITE_URL}/terms`,        lastmod: now, changefreq: 'yearly',  priority: 0.3 }
  ];

  // Tag hubs derived from posts.
  const tagSet = new Set();
  posts.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(t)));
  [...tagSet].slice(0, 500).forEach((t) => {
    entries.push({
      loc: `${SITE_URL}/tags/${encodeURIComponent(t)}`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.6
    });
  });

  // Posts.
  posts.forEach((p) => {
    if (p.status && p.status !== 'active') return;
    const seg = ({
      blog: 'blog', qa: 'qa', doc: 'doc', wiki: 'wiki',
      code: 'code', project: 'project', job: 'jobs',
      notice: 'notice', poll: 'poll', event: 'event',
      video: 'video', image: 'post', text: 'post', story: 'story'
    })[p.type] || 'post';
    const slug = p.slug || p.id;
    const loc = `${SITE_URL}/${seg}/${slug}`;
    const lastmod = isoOf(p.updatedAt || p.createdAt);
    entries.push({
      loc,
      lastmod,
      changefreq: p.type === 'job' ? 'weekly' : 'daily',
      priority: p.type === 'blog' || p.type === 'doc' ? 0.8 : 0.7,
      images: (p.images || []).map((i) => i.url || i).slice(0, 5),
      alternates: [
        { lang: 'en', href: loc },
        { lang: 'bn', href: `${loc}?lang=bn` }
      ]
    });
  });

  // Profiles.
  users.forEach((u) => {
    if (!u.username) return;
    entries.push({
      loc: `${SITE_URL}/p/${u.username}`,
      lastmod: isoOf(u.updatedAt || u.createdAt),
      changefreq: 'weekly',
      priority: u.isVerified ? 0.7 : 0.5
    });
  });

  // Communities.
  communities.forEach((c) => {
    if (!c.slug) return;
    entries.push({
      loc: `${SITE_URL}/bsdc/${c.slug}`,
      lastmod: isoOf(c.updatedAt || c.createdAt),
      changefreq: 'daily',
      priority: 0.7
    });
  });

  return buildSitemapXml(entries);
}

export { SITE_URL };
