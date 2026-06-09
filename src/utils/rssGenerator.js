/**
 * src/utils/rssGenerator.js
 * ---------------------------------------------------------------------------
 * Build a valid RSS 2.0 feed of the latest BSDC posts. Called from
 * scripts/generate-rss.js at build time.
 * ---------------------------------------------------------------------------
 */

const SITE_URL = (typeof process !== 'undefined' && process.env?.VITE_SITE_URL)
  || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL)
  || 'https://www.bsdc.info.bd';

const SITE_NAME = 'Bangladesh Software Development Community';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function cdata(s) {
  // Wrap in CDATA but strip any nested ]]>
  return `<![CDATA[${String(s || '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}
function rfc822(v) {
  let d;
  if (!v) d = new Date();
  else if (typeof v?.toDate === 'function') d = v.toDate();
  else d = new Date(v);
  if (Number.isNaN(d.getTime())) d = new Date();
  return d.toUTCString();
}

const SEG = {
  blog: 'blog', qa: 'qa', doc: 'doc', wiki: 'wiki',
  code: 'code', project: 'project', job: 'jobs',
  notice: 'notice', poll: 'poll', event: 'event',
  video: 'video', image: 'post', text: 'post', story: 'story'
};

function itemFor(post) {
  const seg = SEG[post.type] || 'post';
  const slug = post.slug || post.id;
  const link = `${SITE_URL}/${seg}/${slug}`;
  const desc = post.excerpt || post.seoDescription || (post.content || '').slice(0, 320);
  const cats = (post.tags || []).map((t) => `<category>${esc(t)}</category>`).join('');
  return [
    '    <item>',
    `      <title>${cdata(post.title || `BSDC ${post.type || 'post'}`)}</title>`,
    `      <link>${esc(link)}</link>`,
    `      <guid isPermaLink="true">${esc(link)}</guid>`,
    `      <pubDate>${rfc822(post.createdAt)}</pubDate>`,
    `      <dc:creator>${cdata('@' + (post.authorUsername || 'bsdc'))}</dc:creator>`,
    `      <description>${cdata(desc)}</description>`,
    cats,
    '    </item>'
  ].filter(Boolean).join('\n');
}

export function buildRssXml(posts = [], { max = 50 } = {}) {
  const items = posts
    .filter((p) => !p.status || p.status === 'active')
    .slice(0, max)
    .map(itemFor)
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"',
    '     xmlns:dc="http://purl.org/dc/elements/1.1/"',
    '     xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${esc(SITE_NAME)}</title>`,
    `    <link>${esc(SITE_URL)}</link>`,
    `    <atom:link href="${esc(SITE_URL)}/rss.xml" rel="self" type="application/rss+xml" />`,
    `    <description>Latest posts from BSDC — Bangladesh's largest developer community.</description>`,
    `    <language>en-bd</language>`,
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `    <generator>BSDC build pipeline</generator>`,
    items,
    '  </channel>',
    '</rss>'
  ].join('\n');
}

export { SITE_URL, SITE_NAME };
