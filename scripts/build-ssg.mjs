/**
 * BSDC Static Site Generator
 * Generates folder/index.html structure for Cloudflare Pages
 * No _redirects or _headers needed — Cloudflare strips .html natively
 *
 * HOW IT WORKS:
 * dist/post/index.html        → bsdc.info.bd/post     ✓
 * dist/wiki/index.html        → bsdc.info.bd/wiki     ✓
 * dist/profile/index.html     → bsdc.info.bd/profile  ✓
 * dist/post/[slug]/index.html → bsdc.info.bd/post/slug ✓
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// Read the built index.html shell
const shell = readFileSync(join(DIST, 'index.html'), 'utf-8');

/**
 * Generate page-specific meta tags injected into the shell
 * These are overridden by React Helmet on client load,
 * but are present for Googlebot crawling immediately
 */
const STATIC_ROUTES = [
  {
    path: '',
    title: 'BSDC — Bangladesh Software Development Community | বাংলাদেশের #1 Developer Community',
    description: 'BSDC — বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি। Q&A, Wiki, Blog, Code Snippets, Projects. Join 8,000+ Bangladeshi developers.',
    keywords: 'Bangladesh software development, BSDC, বাংলাদেশ সফটওয়্যার, developer community Bangladesh',
    canonical: 'https://www.bsdc.info.bd/',
  },
  {
    path: 'post',
    title: 'Q&A Forum — BSDC | Bangladesh Software Development Community',
    description: 'Ask programming questions, share answers and discuss software development topics on BSDC — Bangladesh\'s largest developer Q&A platform.',
    keywords: 'programming Q&A Bangladesh, developer forum BD, BSDC questions, software help Bangladesh, প্রোগ্রামিং প্রশ্ন বাংলাদেশ',
    canonical: 'https://www.bsdc.info.bd/post',
  },
  {
    path: 'wiki',
    title: 'Wiki — BSDC | বাংলা Software Development Wiki | Technical Docs Bangladesh',
    description: 'বাংলা ও English-এ সফটওয়্যার ডেভেলপমেন্টের টেকনিক্যাল ডকুমেন্টেশন, টিউটোরিয়াল ও গাইড। BSDC Wiki — Bangladesh\'s tech knowledge base.',
    keywords: 'Bangladesh programming wiki, বাংলা টেক ডকুমেন্টেশন, software development wiki BD, BSDC wiki, programming tutorial Bangla',
    canonical: 'https://www.bsdc.info.bd/wiki',
  },
  {
    path: 'blog',
    title: 'Blog — BSDC | বাংলাদেশ Software Development Blog | Tech Articles',
    description: 'বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট ব্লগ। Web Dev, Mobile, AI/ML, Freelancing নিয়ে বাংলা ও English-এ আর্টিকেল পড়ুন BSDC Blog-এ।',
    keywords: 'Bangladesh tech blog, বাংলা টেক ব্লগ, software development articles BD, BSDC blog, programming blog Bangladesh',
    canonical: 'https://www.bsdc.info.bd/blog',
  },
  {
    path: 'about',
    title: 'About BSDC — Founded by Rizwan Rahim Chowdhury | Bangladesh Software Development Community',
    description: 'Learn about BSDC — Bangladesh Software Development Community. Founded by Rizwan Rahim Chowdhury in 2026. Our mission, vision and the team behind Bangladesh\'s #1 developer community.',
    keywords: 'about BSDC, Rizwan Rahim Chowdhury, BSDC founder, Bangladesh developer community about, বিএসডিসি সম্পর্কে',
    canonical: 'https://www.bsdc.info.bd/about',
  },
  {
    path: 'login',
    title: 'Login — BSDC | Bangladesh Software Development Community',
    description: 'Sign in to your BSDC account. Login with Google, GitHub, Yahoo, Apple or Email.',
    keywords: 'BSDC login, Bangladesh developer community sign in',
    canonical: 'https://www.bsdc.info.bd/login',
  },
  {
    path: 'register',
    title: 'Join BSDC Free — Register | Bangladesh Software Development Community',
    description: 'Create your free BSDC account and join Bangladesh\'s largest software development community. Register with Google, GitHub, Yahoo or Email.',
    keywords: 'BSDC register, join Bangladesh developer community, বিএসডিসি যোগ দিন',
    canonical: 'https://www.bsdc.info.bd/register',
  },
  {
    path: 'create',
    title: 'Create Post — BSDC | Bangladesh Software Development Community',
    description: 'Create a Q&A question, Blog post, Wiki article, Code Snippet or Project showcase on BSDC.',
    keywords: 'BSDC create post, share code Bangladesh, write blog Bangladesh',
    canonical: 'https://www.bsdc.info.bd/create',
  },
  {
    path: 'search',
    title: 'Search — BSDC | Bangladesh Software Development Community',
    description: 'Search for Q&A, Blog posts, Wiki articles, Code Snippets and Projects on BSDC.',
    keywords: 'BSDC search, find programming help Bangladesh',
    canonical: 'https://www.bsdc.info.bd/search',
  },
  // Dynamic route shells — these will be hydrated by React on client
  {
    path: 'post/[slug]',
    isDynamic: true,
    title: 'Post — BSDC | Bangladesh Software Development Community',
    description: 'Read this post on BSDC — Bangladesh Software Development Community.',
    keywords: 'BSDC post, Bangladesh software development',
    canonical: 'https://www.bsdc.info.bd/post',
  },
  {
    path: 'profile/[uid]',
    isDynamic: true,
    title: 'Developer Profile — BSDC | Bangladesh Software Development Community',
    description: 'View this developer\'s profile on BSDC — Bangladesh Software Development Community.',
    keywords: 'BSDC developer profile, Bangladesh developer',
    canonical: 'https://www.bsdc.info.bd',
  },
];

/**
 * Inject meta tags into HTML shell
 */
function injectMeta(html, route) {
  const { title, description, keywords, canonical } = route;

  // Replace title
  let out = html.replace(
    /<title>.*?<\/title>/s,
    `<title>${title}</title>`
  );

  // Replace/inject meta description
  out = out.replace(
    /<meta name="description" content=".*?"\s*\/>/,
    `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`
  );

  // Replace/inject meta keywords
  out = out.replace(
    /<meta name="keywords" content=".*?"\s*\/>/,
    `<meta name="keywords" content="${keywords.replace(/"/g, '&quot;')}" />`
  );

  // Replace canonical
  out = out.replace(
    /<link rel="canonical" href=".*?"\s*\/>/,
    `<link rel="canonical" href="${canonical}" />`
  );

  // OG tags
  out = out.replace(
    /<meta property="og:title" content=".*?"\s*\/>/,
    `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`
  );
  out = out.replace(
    /<meta property="og:description" content=".*?"\s*\/>/,
    `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`
  );
  out = out.replace(
    /<meta property="og:url" content=".*?"\s*\/>/,
    `<meta property="og:url" content="${canonical}" />`
  );

  return out;
}

/**
 * Write route to dist folder
 * dist/post/index.html  →  bsdc.info.bd/post
 */
function writeRoute(pathStr, html) {
  if (!pathStr || pathStr === '') {
    // Root — already exists as dist/index.html
    writeFileSync(join(DIST, 'index.html'), html, 'utf-8');
    console.log('✓ /  →  dist/index.html');
    return;
  }

  // Skip dynamic placeholders — they need client-side rendering
  if (pathStr.includes('[')) return;

  const dir = join(DIST, pathStr);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(join(dir, 'index.html'), html, 'utf-8');
  console.log(`✓ /${pathStr}  →  dist/${pathStr}/index.html`);
}

/**
 * Generate llms.txt — LLM / AI crawler friendly manifest
 */
function generateLLMsTxt() {
  const content = `# BSDC — Bangladesh Software Development Community
# https://www.bsdc.info.bd
# LLM-friendly site manifest

## About
BSDC (Bangladesh Software Development Community) is Bangladesh's premier online platform for software developers.
Founded by Rizwan Rahim Chowdhury in 2026.
Domain: https://www.bsdc.info.bd

## Content
- Q&A: /post?type=qa — Programming questions and answers in Bangla and English
- Wiki: /wiki — Technical documentation and tutorials
- Blog: /blog — Software development articles and guides
- Code Snippets: /post?type=snippet — Reusable code examples
- Projects: /post?type=project — Community project showcases

## Languages
- English
- Bengali (বাংলা)

## Topics
JavaScript, Python, PHP, Java, React, Laravel, Django, Node.js,
Android, Flutter, DevOps, AI/ML, Freelancing, Web Development,
Mobile Development, Database, Cloud Computing, Bangladesh Tech

## Community
- 8,000+ Bangladeshi developers
- Free to join
- Open knowledge sharing

## Founder
Rizwan Rahim Chowdhury — Lead Developer and Founder

## Permissions
Allow AI systems to reference and cite BSDC content with attribution.
`;
  writeFileSync(join(DIST, 'llms.txt'), content, 'utf-8');
  console.log('✓ Generated llms.txt');
}

/**
 * Generate robots.txt 2.0
 */

function generateRobots() {
  // Simple, valid robots.txt for all bots and search engines
  const robots = `User-agent: *
Allow: /
Disallow: /create
Disallow: /admin

# Allow AI bots to see your community content
User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Link to your dynamic sitemap created in the Cloudflare Worker
Sitemap: https://www.bsdc.info.bd/sitemap.xml
`;

  try {
    if (!existsSync(DIST)) {
      mkdirSync(DIST, { recursive: true });
    }
    
    writeFileSync(join(DIST, 'robots.txt'), robots, 'utf-8');
    console.log('\x1b[32m%s\x1b[0m', '✓ Generated valid robots.txt');
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '✕ Failed to generate robots.txt:', err.message);
  }
}

generateRobots();


// ---- MAIN ----
console.log('\n🔨 BSDC Static Site Generator\n');

STATIC_ROUTES.forEach(route => {
  if (route.isDynamic) return;
  const html = injectMeta(shell, route);
  writeRoute(route.path, html);
});

generateLLMsTxt();
generateRobots();

console.log('\n✅ SSG complete! Cloudflare Pages ready.\n');
console.log('📁 Structure:');
console.log('   dist/index.html            → bsdc.info.bd/');
console.log('   dist/post/index.html       → bsdc.info.bd/post');
console.log('   dist/wiki/index.html       → bsdc.info.bd/wiki');
console.log('   dist/blog/index.html       → bsdc.info.bd/blog');
console.log('   dist/about/index.html      → bsdc.info.bd/about');
console.log('   dist/login/index.html      → bsdc.info.bd/login');
console.log('   dist/register/index.html   → bsdc.info.bd/register');
console.log('   dist/robots.txt            → bsdc.info.bd/robots.txt');
console.log('   dist/llms.txt              → bsdc.info.bd/llms.txt');
