/**
 * ═══════════════════════════════════════════════════
 * BSDC Dynamic Sitemap Worker
 * ═══════════════════════════════════════════════════
 *
 * Endpoints:
 *   https://bsdc-sitemap.workers.dev/             → Full sitemap
 *   https://bsdc-sitemap.workers.dev/sitemap.xml  → Full sitemap
 *   https://www.bsdc.info.bd/sitemap.xml          → Full sitemap (via route)
 *   https://www.bsdc.info.bd/sitemap-index.xml    → Sitemap index
 *
 * Features:
 *   - Auto-pulls ALL posts from Firestore
 *   - Auto-pulls ALL user profiles from Firestore
 *   - Auto-extracts unique tags from post tags
 *   - Includes static pages
 *   - Multilingual hreflang tags (EN + BN)
 *   - Edge cached for 1 hour
 *   - Pagination support (handles 15,000+ docs)
 *   - Graceful error fallback
 *
 * Author: Rizwan Rahim Chowdhury
 * Site:   https://www.bsdc.info.bd
 * ═══════════════════════════════════════════════════
 */

const STATIC_ROUTES = [
  { loc: '/',         changefreq: 'daily',   priority: 1.0, hreflang: true  },
  { loc: '/post',     changefreq: 'daily',   priority: 0.9, hreflang: true  },
  { loc: '/wiki',     changefreq: 'weekly',  priority: 0.9, hreflang: true  },
  { loc: '/blog',     changefreq: 'daily',   priority: 0.9, hreflang: true  },
  { loc: '/about',    changefreq: 'monthly', priority: 0.8, hreflang: true  },
  { loc: '/register', changefreq: 'monthly', priority: 0.7, hreflang: false },
  { loc: '/login',    changefreq: 'monthly', priority: 0.5, hreflang: false },
  { loc: '/search',   changefreq: 'weekly',  priority: 0.6, hreflang: false },
];

/* ═══════════════════════════════════════════
   FETCH ALL POSTS FROM FIRESTORE
═══════════════════════════════════════════ */
async function fetchAllPosts(env) {
  const allPosts = [];
  let pageToken  = '';
  let safety     = 0;

  while (safety < 100) {
    safety++;
    const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/posts?key=${env.FIREBASE_API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;

    try {
      const res = await fetch(url, {
        cf: { cacheTtl: 60, cacheEverything: false },
      });

      if (!res.ok) {
        console.warn(`Posts fetch HTTP ${res.status}`);
        break;
      }

      const data = await res.json();

      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          const fields = doc.fields || {};
          const docId  = doc.name.split('/').pop() || '';

          const tags = fields.tags && fields.tags.arrayValue && fields.tags.arrayValue.values
            ? fields.tags.arrayValue.values
                .map(v => v.stringValue || '')
                .filter(t => Boolean(t))
            : [];

          allPosts.push({
            slug:      (fields.slug && fields.slug.stringValue) || docId,
            type:      (fields.type && fields.type.stringValue) || 'post',
            title:     (fields.title && fields.title.stringValue) || '',
            updatedAt: (fields.updatedAt && fields.updatedAt.timestampValue)
                       || (fields.createdAt && fields.createdAt.timestampValue)
                       || doc.updateTime
                       || new Date().toISOString(),
            tags,
          });
        }
      }

      if (data.nextPageToken) {
        pageToken = data.nextPageToken;
      } else {
        break;
      }
    } catch (err) {
      console.error('Posts fetch error:', err.message);
      break;
    }
  }

  return allPosts;
}

/* ═══════════════════════════════════════════
   FETCH ALL USERS FROM FIRESTORE
═══════════════════════════════════════════ */
async function fetchAllUsers(env) {
  const allUsers = [];
  let pageToken  = '';
  let safety     = 0;

  while (safety < 100) {
    safety++;
    const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/users?key=${env.FIREBASE_API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;

    try {
      const res = await fetch(url, {
        cf: { cacheTtl: 60, cacheEverything: false },
      });

      if (!res.ok) {
        console.warn(`Users fetch HTTP ${res.status}`);
        break;
      }

      const data = await res.json();

      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          const fields = doc.fields || {};
          const uid    = doc.name.split('/').pop() || '';

          allUsers.push({
            uid,
            displayName: (fields.displayName && fields.displayName.stringValue) || 'Developer',
            updatedAt:   (fields.updatedAt && fields.updatedAt.timestampValue)
                         || (fields.joinedAt && fields.joinedAt.timestampValue)
                         || doc.updateTime
                         || new Date().toISOString(),
            postCount:   parseInt(
              (fields.postCount && fields.postCount.integerValue) || '0',
              10
            ),
          });
        }
      }

      if (data.nextPageToken) {
        pageToken = data.nextPageToken;
      } else {
        break;
      }
    } catch (err) {
      console.error('Users fetch error:', err.message);
      break;
    }
  }

  return allUsers;
}

/* ═══════════════════════════════════════════
   EXTRACT UNIQUE TAGS
═══════════════════════════════════════════ */
function extractTags(posts) {
  const tagSet = new Set();
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
   ESCAPE XML SPECIAL CHARS
═══════════════════════════════════════════ */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* ═══════════════════════════════════════════
   FORMAT DATE → YYYY-MM-DD
═══════════════════════════════════════════ */
function formatDate(iso) {
  if (!iso) return new Date().toISOString().split('T')[0];
  try {
    return new Date(iso).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/* ═══════════════════════════════════════════
   PRIORITY CALCULATIONS
═══════════════════════════════════════════ */
function getUserPriority(postCount) {
  if (postCount >= 50) return 0.8;
  if (postCount >= 20) return 0.7;
  if (postCount >= 5)  return 0.6;
  if (postCount >= 1)  return 0.5;
  return 0;
}

function getPostPriority(type) {
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
function buildUrlEntry(loc, lastmod, changefreq, priority, hreflang) {
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
function buildSitemap(staticRoutes, posts, users, tags, siteUrl) {
  const today = new Date().toISOString().split('T')[0];
  const urls  = [];

  // 1. Static pages
  for (const route of staticRoutes) {
    urls.push(buildUrlEntry(
      `${siteUrl}${route.loc}`,
      today,
      route.changefreq,
      route.priority,
      route.hreflang
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

  // 3. Active user profiles (only with posts)
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
  Founder:    Rizwan Rahim Chowdhury
-->
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;
}

/* ═══════════════════════════════════════════
   BUILD SITEMAP INDEX (alternative endpoint)
═══════════════════════════════════════════ */
function buildSitemapIndex(siteUrl) {
  const today = new Date().toISOString().split('T')[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

/* ═══════════════════════════════════════════
   FALLBACK SITEMAP (when Firestore fails)
═══════════════════════════════════════════ */
function buildFallbackSitemap(siteUrl) {
  const today = new Date().toISOString().split('T')[0];
  const urls = STATIC_ROUTES.map(r => `  <url>
    <loc>${siteUrl}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- BSDC Sitemap — Fallback Mode -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/* ═══════════════════════════════════════════
   LANDING PAGE (when visiting root)
═══════════════════════════════════════════ */
function buildLandingPage(env) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BSDC Sitemap Worker</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 640px;
      margin: 60px auto;
      padding: 32px;
      background: linear-gradient(135deg, #0f172a, #006A4E);
      color: #fff;
      border-radius: 16px;
      line-height: 1.7;
    }
    h1 { font-size: 1.6rem; margin-bottom: 12px; }
    h1 span { color: #6EE7B7; }
    .badge {
      display: inline-block;
      background: rgba(110,231,183,0.2);
      color: #6EE7B7;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 0.78rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .endpoint {
      background: rgba(0,0,0,0.3);
      padding: 14px 18px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.85rem;
      margin: 8px 0;
      border-left: 3px solid #6EE7B7;
    }
    .endpoint a { color: #6EE7B7; text-decoration: none; }
    .endpoint a:hover { text-decoration: underline; }
    .stats { color: #94a3b8; font-size: 0.85rem; margin-top: 24px; }
    a.cta {
      display: inline-block;
      background: #6EE7B7;
      color: #0f172a;
      padding: 10px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="badge">CLOUDFLARE WORKER</div>
  <h1>BSDC <span>Dynamic Sitemap</span> Worker</h1>
  <p>This worker generates a live sitemap.xml by fetching all posts, users, and tags from Firestore in real-time.</p>

  <h3 style="margin-top:24px;color:#6EE7B7;">Available Endpoints:</h3>
  <div class="endpoint">
    <a href="/sitemap.xml">/sitemap.xml</a> — Full dynamic sitemap
  </div>
  <div class="endpoint">
    <a href="/sitemap-index.xml">/sitemap-index.xml</a> — Sitemap index
  </div>

  <p class="stats">
    Site: <a href="${env.SITE_URL}" style="color:#6EE7B7;">${env.SITE_URL}</a><br>
    Project: ${env.FIREBASE_PROJECT_ID}<br>
    Cache: 1 hour at edge
  </p>

  <a href="${env.SITE_URL}" class="cta">Visit BSDC →</a>
</body>
</html>`;
}

/* ═══════════════════════════════════════════
   MAIN WORKER HANDLER
═══════════════════════════════════════════ */
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const url       = new URL(request.url);
    const path      = url.pathname;

    /* ── ROUTE: Root URL (landing page) ── */
    if (path === '' || path === '/') {
      return new Response(buildLandingPage(env), {
        status: 200,
        headers: {
          'Content-Type':  'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'X-Robots-Tag':  'noindex',
        },
      });
    }

    /* ── ROUTE: Sitemap Index ── */
    if (path === '/sitemap-index.xml' || path.endsWith('/sitemap-index.xml')) {
      return new Response(buildSitemapIndex(env.SITE_URL), {
        status: 200,
        headers: {
          'Content-Type':  'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    /* ── ROUTE: Main Sitemap ── */
    if (path === '/sitemap.xml' || path.endsWith('/sitemap.xml')) {
      // Edge cache check
      const cache     = caches.default;
      const cacheKey  = new Request(url.toString(), { method: 'GET' });
      const cachedRes = await cache.match(cacheKey);

      if (cachedRes) {
        const headers = new Headers(cachedRes.headers);
        headers.set('X-BSDC-Cache',         'HIT');
        headers.set('X-BSDC-Response-Time', `${Date.now() - startTime}ms`);

        return new Response(cachedRes.body, {
          status:  cachedRes.status,
          headers,
        });
      }

      // Build fresh sitemap from Firestore
      try {
        const [posts, users] = await Promise.all([
          fetchAllPosts(env),
          fetchAllUsers(env),
        ]);

        const tags    = extractTags(posts);
        const sitemap = buildSitemap(STATIC_ROUTES, posts, users, tags, env.SITE_URL);

        const activeUsers = users.filter(u => u.postCount > 0).length;
        const totalUrls   = STATIC_ROUTES.length + posts.length + activeUsers + tags.length;

        const response = new Response(sitemap, {
          status: 200,
          headers: {
            'Content-Type':                  'application/xml; charset=utf-8',
            'Cache-Control':                 'public, max-age=3600, s-maxage=3600',
            'X-BSDC-Cache':                  'MISS',
            'X-BSDC-Static-Pages':           String(STATIC_ROUTES.length),
            'X-BSDC-Posts':                  String(posts.length),
            'X-BSDC-Users':                  String(activeUsers),
            'X-BSDC-Tags':                   String(tags.length),
            'X-BSDC-Total-URLs':             String(totalUrls),
            'X-BSDC-Response-Time':          `${Date.now() - startTime}ms`,
            'X-BSDC-Generated-At':           new Date().toISOString(),
            'X-Robots-Tag':                  'noindex',
            'Access-Control-Allow-Origin':   '*',
          },
        });

        // Store in edge cache for 1 hour
        ctx.waitUntil(cache.put(cacheKey, response.clone()));

        return response;

      } catch (error) {
        const errorMsg = error && error.message ? error.message : 'Unknown error';
        console.error('Sitemap generation failed:', errorMsg);

        // Return fallback sitemap with static pages only
        const fallback = buildFallbackSitemap(env.SITE_URL);

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
    }

    /* ── DEFAULT: 404 with helpful message ── */
    return new Response(
      `Not Found\n\nBSDC Sitemap Worker\nValid endpoints:\n  /\n  /sitemap.xml\n  /sitemap-index.xml`,
      {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  },
};
