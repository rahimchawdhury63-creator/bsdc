/**
 * src/components/seo/SEOHead.jsx
 * ---------------------------------------------------------------------------
 * Universal SEO head — sets title, description, canonical, OG, Twitter,
 * hreflang, robots, and (optionally) JSON-LD in one declaration.
 *
 * Usage:
 *   <SEOHead
 *     title="Article title"
 *     description="…"
 *     canonical="/blog/article-slug"
 *     image="https://…"
 *     ogType="article"
 *     language="bn"
 *     schema={schemaForPost(post)}
 *   />
 *
 * Title is auto-appended with " | BSDC" per spec unless already present.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import JsonLD from './JsonLD.jsx';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';
const SITE_NAME = 'Bangladesh Software Development Community';
const FALLBACK_OG = `${SITE_URL}/og-image.png`;

/** Ensure absolute URL. */
function abs(url) {
  if (!url) return SITE_URL;
  if (url.startsWith('http')) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Append " | BSDC" if not already there, then trim to 70 chars. */
function buildTitle(title) {
  if (!title) return `${SITE_NAME} | BSDC`;
  const hasSuffix = /\|\s*BSDC\b/i.test(title);
  let t = hasSuffix ? title : `${title} | BSDC`;
  if (t.length > 70) t = `${t.slice(0, 67)}…`;
  return t;
}

export default function SEOHead({
  title,
  description = 'Bangladesh\'s largest community for software developers and students.',
  canonical,
  image,
  ogType = 'website',
  language = 'en',
  keywords,            // string | string[]
  robots,              // override; defaults derive from canonical
  noindex = false,
  schema,              // JSON-LD object or array
  publishedTime,
  modifiedTime,
  author,              // { name, url }
  twitterCard = 'summary_large_image'
}) {
  const finalTitle = buildTitle(title);
  const finalCanonical = abs(canonical);
  const finalImage = abs(image || FALLBACK_OG);
  const robotsValue = robots || (noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1');
  const keywordsValue = Array.isArray(keywords) ? keywords.join(', ') : keywords;
  const htmlLang = language === 'bn' ? 'bn-BD' : 'en-BD';

  return (
    <>
      <Helmet>
        <html lang={htmlLang} />
        <title>{finalTitle}</title>
        <meta name="description" content={description} />
        {keywordsValue && <meta name="keywords" content={keywordsValue} />}
        <meta name="robots" content={robotsValue} />
        <link rel="canonical" href={finalCanonical} />

        {/* Hreflang — both Bangla and English variants are valid URLs of the same page */}
        <link rel="alternate" hrefLang="en" href={finalCanonical} />
        <link rel="alternate" hrefLang="bn" href={`${finalCanonical}${finalCanonical.includes('?') ? '&' : '?'}lang=bn`} />
        <link rel="alternate" hrefLang="x-default" href={finalCanonical} />

        {/* Open Graph */}
        <meta property="og:type" content={ogType} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={finalTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={finalCanonical} />
        <meta property="og:image" content={finalImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={language === 'bn' ? 'bn_BD' : 'en_US'} />
        {language !== 'bn' && <meta property="og:locale:alternate" content="bn_BD" />}
        {publishedTime && <meta property="article:published_time" content={publishedTime} />}
        {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        {author?.name && <meta property="article:author" content={author.name} />}

        {/* Twitter */}
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:site" content="@bsdc_bd" />
        <meta name="twitter:title" content={finalTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={finalImage} />
      </Helmet>

      {schema && <JsonLD schema={schema} />}
    </>
  );
}
