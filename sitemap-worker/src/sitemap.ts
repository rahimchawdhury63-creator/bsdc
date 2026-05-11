/**
 * BSDC Dynamic Sitemap Worker
 *
 * Endpoint: https://www.bsdc.info.bd/sitemap.xml
 *
 * Fetches LIVE data from Firestore on every request:
 *   - All static pages
 *   - All posts (Q&A, blog, wiki, snippets, projects)
 *   - All active user profiles
 *   - All unique tags
 *
 * Cached at Cloudflare edge for 1 hour for performance.
 *
 * Author: Rizwan Rahim Chowdhury
 * Site:   https://www.bsdc.info.bd
 */

export interface Env {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY:    string;
  SITE_URL:            string;
}

interface FirestoreField {
  stringValue?:    string;
  integerValue?:   string;
  doubleValue?:    number;
  booleanValue?:   boolean;
  timestampValue?: string;
  arrayValue?:     { values?: FirestoreField[] };
  mapValue?:       { fields?: Record<string, FirestoreField> };
}

interface FirestoreDoc {
  name:   string;
  fields: Record<string, FirestoreField>;
  createTime?: string;
  updateTime?: string;
}

interface FirestoreResponse {
  documents?:     FirestoreDoc[];
  nextPageToken?: string;
}

interface Post {
  slug:      string;
  type:      string;
  title:     string;
  updatedAt: string;
  tags:      string[];
}

interface User {
  uid:         string;
  displayName: string;
  updatedAt:   string;
  postCount:   number;
}

interface SitemapUrl {
  loc:        string;
  lastmod:    string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority:   number;
  hreflang?:  boolean;
}

const STATIC_ROUTES: SitemapUrl[] = [
  { loc: '/',         lastmod: '', changefreq: 'daily',   priority: 1.0, hreflang: true },
  { loc: '/post',     lastmod: '', changefreq: 'daily',   priority: 0.9, hreflang: true },
  { loc: '/wiki',     lastmod: '', changefreq: 'weekly',  priority: 0.9, hreflang: true },
  { loc: '/blog',     lastmod: '', changefreq: 'daily',   priority: 0.9, hreflang: true },
  { loc: '/about',    lastmod: '', changefreq: 'monthly', priority: 0.8, hreflang: true },
  { loc: '/register', lastmod: '', changefreq: 'monthly', priority: 0.7 },
  { loc: '/login',    lastmod: '', changefreq: 'monthly', priority: 0.5 },
  { loc: '/search',   lastmod: '', changefreq: 'weekly',  priority: 0.6 },
];

/* ═══════════════════════════════════════════
   FETCH ALL POSTS FROM FIRESTORE
═══════════════════════════════════════════ */
async function fetchAllPosts(env: Env): Promise<Post[]> {
  const allPosts: Post[] = [];
  let pageToken = '';
  let safety    = 0;

  while (safety < 100) {
    safety++;
    const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/posts?key=${env.FIREBASE_API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;

    try {
      const res = await fetch(url, {
        cf: { cacheTtl: 60, cacheEverything: false },
      });

      if (!res.ok) {
        console.warn(`Posts fetch failed: ${res.status}`);
        break;
      }

      const data = await res.json<FirestoreResponse>();

      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          const fields = doc.fields || {};
          const docId  = doc.name.split('/').pop() || '';

          allPosts.push({
            slug:      fields.slug?.stringValue || docId,
            type:      fields.type?.stringValue || 'post',
            title:     fields.title?.stringValue || '',
            updatedAt: fields.updatedAt?.timestampValue
                       || fields.createdAt?.timestampValue
                       || doc.updateTime
                       || new Date().toISOString(),
            tags:      fields.tags?.arrayValue?.values
                       ?.map(v => v.stringValue)
                       .filter((t): t is string => Boolean(t)) || [],
          });
        }
      }

      if (data.nextPageToken) {
        pageToken = data.nextPageToken;
      } else {
        break;
      }
    } catch (err) {
      console.error('Posts fetch error:', err);
      break;
    }
  }

  return allPosts;
}

/* ═══════════════════════════════════════════
   FETCH ALL USERS FROM FIRESTORE
═══════════════════════════════════════════ */
async function fetchAllUsers(env: Env): Promise<User[]> {
  const allUsers: User[] = [];
  let pageToken = '';
  let safety    = 0;

  while (safety < 100) {
    safety++;
    const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/users?key=${env.FIREBASE_API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;

    try {
      const res = await fetch(url, {
        cf: { cacheTtl: 60, cacheEverything: false },
      });

      if (!res.ok) {
        console.warn(`Users fetch failed: ${res.status}`);
        break;
      }

      const data = await res.json<FirestoreResponse>();

      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          const fields = doc.fields || {};
          const uid    = doc.name.split('/').pop() || '';

          allUsers.push({
            uid,
            displayName: fields.displayName?.stringValue || 'Developer',
            updatedAt:   fields.updatedAt?.timestampValue
                         || fields.joinedAt?.timestampValue
                         || doc.updateTime
                         || new Date().toISOString(),
            postCount:   parseInt(fields.postCount?.integerValue || '0', 10),
          });
        }
      }

      if (data.nextPageToken) {
        pageToken = data.nextPageToken;
      } else {
        break;
      }
    } catch (err) {
      console.error('Users fetch error:', err);
      break;
    }
  }

  return allUsers;
}

/* ═══════════════════════════════════════════
   EXTRACT UNIQUE TAGS FROM POSTS
═══════════════════════════════════════════ */
function extractTags(posts: Post[]): string[] {
  const tagSet = new Set<string>();

  for (const post of posts) {
    for (const tag of post.tags) {
      if (tag && tag.length >= 2 && tag.length <= 40) {
        tagSet.add(tag.toLowerCase().trim());
      }
    }
  }

  return Array.from(tagSet).sort();
}

/* ═══════════════════════════════════════════
   ESCAPE XML SPECIAL CHARACTERS
═══════════════════════════════════════════ */
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');
}

/* ═══════════════════════════════════════════
   FORMAT DATE TO YYYY-MM-DD
═══════════════════════════════════════════ */
function formatDate(iso: string): string {
  if (!iso) return new Date().toISOString().split('T')[0];
  try {
    return new Date(iso).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/* ═══════════════════════════════════════════
   GET PRIORITY FOR USER PROFILE
═══════════════════════════════════════════ */
function getUserPriority(postCount: number): number {
  if (postCount >= 50) return 0.8;
  if (postCount >= 20) return 0.7;
  if (postCount >= 5)  return 0.6;
  if (postCount >= 1)  return 0.5;
  return 0;
}

/* ═══════════════════════════════════════════
   GET PRIORITY FOR POST
═══════════════════════════════════════════ */
function getPostPriority(type: string): number {
  switch (type) {
    case 'qa':      return 0.85;
    case 'blog':    return 0.9;
    case 'wiki':    return 0.85;
    case 'snippet': return 0.75;
    case 'project': return 0.8;
    default:        return 0.7;
  }
}

/* ═══════════════════════════════════════════
   BUILD URL ENTRY (with hreflang)
═══════════════════════════════════════════ */
function buildUrlEntry(
  loc:        string,
  lastmod:    string,
  changefreq: string,
  priority:   number,
  hreflang:   boolean = false
): string {
  const escapedLoc = escapeXml(loc);

  if (hreflang) {
    return `  <url>
    <loc>${escapedLoc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${escapedLoc}" />
    <xhtml:link rel="alternate" hreflang="bn" href="${escapedLoc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapedLoc}" />
  </url>`;
  }

  return `  <url>
    <loc>${escapedLoc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

/* ═══════════════════════════════════════════
   BUILD COMPLETE SITEMAP XML
═══════════════════════════════════════════ */
function buildSitemap(
  staticRoutes: SitemapUrl[],
  posts:        Post[],
  users:        User[],
  tags:         string[],
  siteUrl:      string
): string {
  const today  = new Date().toISOString().split('T')[0];
  const urls: string[] = [];

  // 1. Static pages
  for (const route of staticRoutes) {
    urls.push(buildUrlEntry(
      `${siteUrl}${route.loc}`,
      today,
      route.changefreq,
      route.priority,
      route.hreflang || false
    ));
  }

  // 2. All posts
  for (const post of posts) {
    if (!post.slug) continue;
    urls.push(buildUrlEntry(
      `${siteUrl}/post/${post.slug}`,
      formatDate(post.updatedAt),
      'weekly',
      getPostPriority(post.type),
      true
    ));
  }

  // 3. Active user profiles
  for (const user of users) {
    if (user.postCount === 0) continue;
    urls.push(buildUrlEntry(
      `${siteUrl}/profile/${user.uid}`,
      formatDate(user.updatedAt),
      'monthly',
      getUserPriority(user.postCount),
      false
    ));
  }

  // 4. Tag pages
  for (const tag of tags) {
    urls.push(buildUrlEntry(
      `${siteUrl}/post?tag=${encodeURIComponent(tag)}`,
      today,
      'weekly',
      0.6,
      false
    ));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  BSDC Dynamic Sitemap — Generated by Cloudflare Worker
  Live data from Firestore at request time
  Total URLs: ${urls.length}
  Generated:  ${new Date().toISOString()}
  Site:       ${siteUrl}
-->
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>`;
}

/* ═══════════════════════════════════════════
   MAIN WORKER HANDLER
═══════════════════════════════════════════ */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    const url       = new URL(request.url);

    // Only handle sitemap.xml requests
    if (!url.pathname.endsWith('/sitemap.xml')) {
      return new Response('Not Found', { status: 404 });
    }

    // ── EDGE CACHE CHECK ──
    const cache       = caches.default;
    const cacheKey    = new Request(url.toString(), { method: 'GET' });
    const cachedRes   = await cache.match(cacheKey);

    if (cachedRes) {
      // Return cached version with debug header
      const headers = new Headers(cachedRes.headers);
      headers.set('X-BSDC-Cache',         'HIT');
      headers.set('X-BSDC-Response-Time', `${Date.now() - startTime}ms`);

      return new Response(cachedRes.body, {
        status:  cachedRes.status,
        headers,
      });
    }

    // ── BUILD SITEMAP FROM LIVE DATA ──
    try {
      const [posts, users] = await Promise.all([
        fetchAllPosts(env),
        fetchAllUsers(env),
      ]);

      const tags    = extractTags(posts);
      const sitemap = buildSitemap(
        STATIC_ROUTES,
        posts,
        users,
        tags,
        env.SITE_URL
      );

      const response = new Response(sitemap, {
        status: 200,
        headers: {
          'Content-Type':            'application/xml; charset=utf-8',
          'Cache-Control':           'public, max-age=3600, s-maxage=3600',
          'X-BSDC-Cache':            'MISS',
          'X-BSDC-Posts':            String(posts.length),
          'X-BSDC-Users':            String(users.filter(u => u.postCount > 0).length),
          'X-BSDC-Tags':             String(tags.length),
          'X-BSDC-Response-Time':    `${Date.now() - startTime}ms`,
          'X-BSDC-Generated-At':     new Date().toISOString(),
          'X-Robots-Tag':            'noindex',
          'Access-Control-Allow-Origin': '*',
        },
      });

      // ── STORE IN EDGE CACHE (1 hour) ──
      ctx.waitUntil(cache.put(cacheKey, response.clone()));

      return response;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Sitemap generation failed:', errorMsg);

      // Fallback: return basic sitemap with static routes only
      const today = new Date().toISOString().split('T')[0];
      const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<!-- BSDC Sitemap — Fallback (Firestore unavailable) -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_ROUTES.map(r => `  <url>
    <loc>${env.SITE_URL}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

      return new Response(fallback, {
        status: 200,
        headers: {
          'Content-Type':         'application/xml; charset=utf-8',
          'Cache-Control':        'public, max-age=300',
          'X-BSDC-Cache':         'ERROR',
          'X-BSDC-Error':         errorMsg.slice(0, 100),
          'X-BSDC-Response-Time': `${Date.now() - startTime}ms`,
        },
      });
    }
  },
};
