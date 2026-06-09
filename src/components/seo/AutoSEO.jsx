/**
 * src/components/seo/AutoSEO.jsx
 * ---------------------------------------------------------------------------
 * One-line SEO for a post — pulls everything from the post object using
 * the seoGenerator + schemaGenerator and emits a complete SEOHead.
 *
 *   <AutoSEO post={post} />
 *
 * Used on PostDetail and any other "single post" view.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import SEOHead from './SEOHead.jsx';
import { generatePostSEO, postUrl, TYPE_URL_SEGMENT } from '../../utils/seoGenerator.js';
import { schemaForPost } from '../../utils/schemaGenerator.js';
import { toDate } from '../../utils/dateFormatter.js';

const OG_TYPE_MAP = {
  blog: 'article', doc: 'article', wiki: 'article', notice: 'article',
  qa: 'article', code: 'article', project: 'article',
  job: 'article', event: 'article',
  video: 'video.other', image: 'website',
  text: 'website', story: 'website', poll: 'article'
};

export default function AutoSEO({ post }) {
  if (!post) return null;
  const seo = generatePostSEO(post, { keepSlug: post.slug });
  const url = `/${TYPE_URL_SEGMENT[post.type] || 'post'}/${post.slug || post.id}`;
  const publishedISO = toDate(post.createdAt)?.toISOString();
  const modifiedISO  = toDate(post.updatedAt)?.toISOString() || publishedISO;

  return (
    <SEOHead
      title={post.title || seo.seoTitle}
      description={seo.seoDescription}
      canonical={url}
      image={seo.ogImage}
      ogType={OG_TYPE_MAP[post.type] || 'article'}
      language={post.language}
      keywords={seo.seoKeywords}
      publishedTime={publishedISO}
      modifiedTime={modifiedISO}
      author={{ name: post.authorDisplayName || post.authorUsername, url: `${postUrl(post)}`.replace(/\/[^/]+\/[^/]+$/, `/p/${post.authorUsername}`) }}
      schema={schemaForPost(post)}
    />
  );
}
