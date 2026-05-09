// ============================================
// BSDC — Dynamic SEO Injector
// Injects meta tags, JSON-LD for post & profile
// ============================================

/**
 * Inject all SEO meta for a post page
 * @param {Object} post - Firestore post document data
 */
export function injectPostSEO(post) {
  const slug = post.slug || '';
  const url = `https://www.bsdc.info.bd/post?slug=${encodeURIComponent(slug)}`;
  const title = `${post.title} — BSDC`;
  const description = post.seoDescription || post.excerpt || post.body?.substring(0, 160).replace(/\n/g, ' ') || 'Read this post on BSDC — Bangladesh Software Development Community.';
  const image = post.coverImage || post.imageUrl || 'https://www.bsdc.info.bd/assets/img/og-cover.png';
  const keywords = [
    ...(post.tags || []),
    'BSDC',
    'Bangladesh software development',
    'Bangladesh developer community',
    post.type,
    post.authorName
  ].filter(Boolean).join(', ');

  const publishedDate = post.createdAt?.toDate ? post.createdAt.toDate().toISOString() : new Date().toISOString();

  // Basic meta
  setMeta('title', title);
  setMeta('description', description);
  setMeta('keywords', keywords);
  setLink('canonical', url);

  // Open Graph
  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:url', url);
  setMetaProperty('og:image', image);
  setMetaProperty('article:author', post.authorName || 'BSDC Community');
  setMetaProperty('article:published_time', publishedDate);
  setMetaProperty('article:section', post.type);
  if (post.tags) {
    post.tags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.property = 'article:tag';
      meta.content = tag;
      document.head.appendChild(meta);
    });
  }

  // Twitter
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);
  setMetaName('twitter:image', image);

  // JSON-LD
  const typeSchemaMap = {
    question: buildQASchema(post, url, publishedDate),
    wiki: buildArticleSchema(post, url, publishedDate, 'TechArticle'),
    blog: buildArticleSchema(post, url, publishedDate, 'BlogPosting'),
    snippet: buildCodeSchema(post, url, publishedDate),
    project: buildArticleSchema(post, url, publishedDate, 'SoftwareApplication'),
    post: buildArticleSchema(post, url, publishedDate, 'Article')
  };

  const schema = typeSchemaMap[post.type] || typeSchemaMap.post;
  const scriptEl = document.getElementById('jsonld-post');
  if (scriptEl) scriptEl.textContent = JSON.stringify(schema);

  // Also inject BreadcrumbList
  injectBreadcrumb(post);
}

function buildArticleSchema(post, url, published, type = 'Article') {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "headline": post.title,
    "name": post.title,
    "description": post.seoDescription || post.excerpt || '',
    "url": url,
    "datePublished": published,
    "dateModified": post.updatedAt?.toDate ? post.updatedAt.toDate().toISOString() : published,
    "image": post.coverImage || post.imageUrl || 'https://www.bsdc.info.bd/assets/img/og-cover.png',
    "inLanguage": detectLanguage(post.body),
    "keywords": (post.tags || []).join(', '),
    "author": {
      "@type": "Person",
      "name": post.authorName || 'BSDC Member',
      "url": `https://www.bsdc.info.bd/profile?uid=${post.authorId}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bangladesh Software Development Community",
      "alternateName": "BSDC",
      "url": "https://www.bsdc.info.bd",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.bsdc.info.bd/assets/img/favicon.ico"
      }
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Bangladesh Software Development Community",
      "url": "https://www.bsdc.info.bd"
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": post.viewCount || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": post.voteCount || 0
      }
    ]
  };
}

function buildQASchema(post, url, published) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "name": post.title,
    "url": url,
    "description": post.excerpt || post.body?.substring(0, 160) || '',
    "inLanguage": detectLanguage(post.body),
    "isPartOf": {
      "@type": "WebSite",
      "name": "Bangladesh Software Development Community",
      "url": "https://www.bsdc.info.bd"
    },
    "mainEntity": {
      "@type": "Question",
      "name": post.title,
      "text": post.body || '',
      "dateCreated": published,
      "author": {
        "@type": "Person",
        "name": post.authorName || 'BSDC Member',
        "url": `https://www.bsdc.info.bd/profile?uid=${post.authorId}`
      },
      "answerCount": post.answerCount || 0,
      "upvoteCount": post.voteCount || 0,
      ...(post.isSolved ? {
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "This question has been solved. View the accepted answer on BSDC.",
          "url": url,
          "upvoteCount": 0,
          "author": {
            "@type": "Organization",
            "name": "Bangladesh Software Development Community"
          }
        }
      } : {})
    }
  };
}

function buildCodeSchema(post, url, published) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "name": post.title,
    "description": post.excerpt || post.body?.substring(0, 200) || '',
    "url": url,
    "datePublished": published,
    "programmingLanguage": {
      "@type": "ComputerLanguage",
      "name": post.language || 'Unknown'
    },
    "codeRepository": post.githubUrl || url,
    "author": {
      "@type": "Person",
      "name": post.authorName || 'BSDC Member',
      "url": `https://www.bsdc.info.bd/profile?uid=${post.authorId}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bangladesh Software Development Community",
      "url": "https://www.bsdc.info.bd"
    },
    "keywords": (post.tags || []).join(', '),
    "isPartOf": {
      "@type": "WebSite",
      "name": "Bangladesh Software Development Community",
      "url": "https://www.bsdc.info.bd"
    }
  };
}

function injectBreadcrumb(post) {
  const typeLabel = post.type.charAt(0).toUpperCase() + post.type.slice(1);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "BSDC", "item": "https://www.bsdc.info.bd" },
      { "@type": "ListItem", "position": 2, "name": typeLabel + "s", "item": `https://www.bsdc.info.bd/?filter=${post.type}` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://www.bsdc.info.bd/post?slug=${encodeURIComponent(post.slug)}` }
    ]
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(breadcrumb);
  document.head.appendChild(script);
}

// ── Helpers ──
function setMeta(name, content) {
  if (name === 'title') { document.title = content; return; }
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

function setMetaProperty(property, content) {
  let el = document.getElementById(property.replace(/:/g, '-').replace('article-', 'og-').replace('twitter-', 'tw-'));
  if (!el) el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setMetaName(name, content) {
  let el = document.getElementById(name.replace(/:/g, '-'));
  if (!el) el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

function setLink(rel, href) {
  let el = document.getElementById(`page-${rel}`);
  if (!el) el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
  el.href = href;
}

function detectLanguage(text) {
  if (!text) return ['en'];
  const banglaRegex = /[\u0980-\u09FF]/;
  const hasBangla = banglaRegex.test(text);
  const hasEnglish = /[a-zA-Z]/.test(text);
  if (hasBangla && hasEnglish) return ['en', 'bn'];
  if (hasBangla) return ['bn'];
  return ['en'];
}

/**
 * Generate dynamic sitemap entry data for a post
 * (Used for sitemap generation)
 */
export function getSitemapEntry(post) {
  return {
    url: `https://www.bsdc.info.bd/post?slug=${encodeURIComponent(post.slug)}`,
    lastmod: post.updatedAt?.toDate ? post.updatedAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    changefreq: post.type === 'wiki' ? 'weekly' : 'monthly',
    priority: post.type === 'wiki' ? '0.9' : post.type === 'question' ? '0.8' : '0.7'
  };
}
