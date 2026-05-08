/**
 * BSDC SEO Engine
 * Injects dynamic meta tags, JSON-LD schemas
 * for full Google indexing on static pages
 */

window.BSDC = window.BSDC || {};

window.BSDC.seo = {

  SITE_NAME: 'Bangladesh Software Development Community',
  SITE_URL: 'https://www.bsdc.info.bd',
  DEFAULT_DESC: 'BSDC is Bangladesh\'s premier software development community. Ask questions, share code, write wikis, and connect with developers across Bangladesh.',
  DEFAULT_KEYWORDS: 'Bangladesh software development, Bangladeshi developers, programming community, coding help Bangladesh, software engineering BD, web development Bangladesh, BSDC',
  DEFAULT_IMAGE: 'https://www.bsdc.info.bd/og-image.png',

  // ---- Set full page meta ----
  setMeta({ title, description, keywords, image, url, type = 'website', author = null, publishedAt = null, tags = [] }) {

    const fullTitle = title
      ? `${title} — ${this.SITE_NAME}`
      : this.SITE_NAME;

    const desc = description || this.DEFAULT_DESC;
    const kw = keywords
      ? `${keywords}, ${this.DEFAULT_KEYWORDS}`
      : this.DEFAULT_KEYWORDS;
    const img = image || this.DEFAULT_IMAGE;
    const canonicalUrl = url || window.location.href;

    // ---- Title ----
    document.title = fullTitle;

    // ---- Helper ----
    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // ---- Standard Meta ----
    setMeta('description', desc);
    setMeta('keywords', kw);
    setMeta('author', author || this.SITE_NAME);
    setMeta('robots', 'index, follow');
    setMeta('theme-color', '#006A4E');
    setMeta('language', 'en-BD');

    // ---- Open Graph ----
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', desc, true);
    setMeta('og:image', img, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', this.SITE_NAME, true);
    setMeta('og:locale', 'en_BD', true);

    // ---- Twitter Card ----
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);
    setMeta('twitter:site', '@bsdc_bd');

    // ---- Canonical URL ----
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // ---- JSON-LD Schemas ----
    this._injectSchemas({ fullTitle, desc, img, canonicalUrl, type, author, publishedAt, tags });
  },

  // ---- Inject JSON-LD ----
  _injectSchemas({ fullTitle, desc, img, canonicalUrl, type, author, publishedAt, tags }) {
    // Remove old schemas
    document.querySelectorAll('script[data-bsdc-schema]').forEach(s => s.remove());

    const schemas = [];

    // 1. WebSite Schema — Forces Google sitename
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bangladesh Software Development Community",
      "alternateName": ["BSDC", "bsdc.info.bd"],
      "url": this.SITE_URL,
      "description": this.DEFAULT_DESC,
      "inLanguage": ["en", "bn"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${this.SITE_URL}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Bangladesh Software Development Community",
        "url": this.SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${this.SITE_URL}/logo.png`,
          "width": 200,
          "height": 200
        },
        "founder": {
          "@type": "Person",
          "name": "Rizwan Rahim Chowdhury"
        },
        "foundingDate": "2026",
        "areaServed": "Bangladesh",
        "sameAs": [
          "https://www.bsdc.info.bd"
        ]
      }
    });

    // 2. Article Schema (for posts/blogs)
    if (type === 'article' && author) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": fullTitle,
        "description": desc,
        "image": img,
        "url": canonicalUrl,
        "datePublished": publishedAt || new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Bangladesh Software Development Community",
          "logo": {
            "@type": "ImageObject",
            "url": `${this.SITE_URL}/logo.png`
          }
        },
        "keywords": tags.join(', '),
        "inLanguage": "en",
        "isPartOf": {
          "@type": "WebSite",
          "name": "Bangladesh Software Development Community",
          "url": this.SITE_URL
        }
      });
    }

    // 3. Q&A Schema
    if (type === 'qa') {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "QAPage",
        "name": fullTitle,
        "description": desc,
        "url": canonicalUrl,
        "isPartOf": {
          "@type": "WebSite",
          "name": "Bangladesh Software Development Community",
          "url": this.SITE_URL
        }
      });
    }

    // 4. BreadcrumbList
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) {
      const items = [{ "@type": "ListItem", "position": 1, "name": "Home", "item": this.SITE_URL }];
      parts.forEach((p, i) => {
        items.push({
          "@type": "ListItem",
          "position": i + 2,
          "name": p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '),
          "item": `${this.SITE_URL}/${parts.slice(0, i + 1).join('/')}`
        });
      });
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items
      });
    }

    // Inject all
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-bsdc-schema', 'true');
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });
  },

  // ---- Profile page SEO ----
  setProfileMeta(profile) {
    this.setMeta({
      title: `BSDC - ${profile.displayName} (@${profile.username})`,
      description: `${profile.displayName} is a software developer on BSDC — Bangladesh Software Development Community. ${profile.bio || ''} ${profile.postCount} posts, ${profile.reputation} reputation.`,
      keywords: `${profile.displayName}, ${profile.username}, Bangladesh developer, BSDC member, software developer Bangladesh`,
      url: `${this.SITE_URL}/profile?u=${profile.username}`,
      type: 'profile',
      author: profile.displayName
    });

    // Person schema for profile
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-bsdc-schema', 'true');
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.displayName,
      "url": `${this.SITE_URL}/profile?u=${profile.username}`,
      "identifier": profile.username,
      "description": profile.bio || '',
      "memberOf": {
        "@type": "Organization",
        "name": "Bangladesh Software Development Community",
        "url": this.SITE_URL
      },
      "image": profile.photoURL || '',
      "sameAs": [
        profile.github ? `https://github.com/${profile.github}` : null,
        profile.website || null
      ].filter(Boolean)
    });
    document.head.appendChild(script);
  },

  // ---- Post page SEO ----
  setPostMeta(post) {
    const typeMap = {
      question: 'qa',
      blog: 'article',
      wiki: 'article',
      snippet: 'article',
      project: 'article',
      discussion: 'article'
    };

    this.setMeta({
      title: post.title,
      description: post.excerpt || post.content?.replace(/<[^>]+>/g, '').slice(0, 160),
      keywords: post.tags?.join(', '),
      url: `${this.SITE_URL}/post?slug=${post.slug}`,
      type: typeMap[post.type] || 'article',
      author: post.authorName,
      publishedAt: post.createdAt?.toDate?.()?.toISOString(),
      tags: post.tags || [],
      image: post.coverImage || this.DEFAULT_IMAGE
    });
  }
};
