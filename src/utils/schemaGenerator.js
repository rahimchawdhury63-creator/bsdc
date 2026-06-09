/**
 * src/utils/schemaGenerator.js
 * ---------------------------------------------------------------------------
 * Build Schema.org JSON-LD objects for every entity type BSDC exposes.
 *
 *   - Article         (blog, doc, wiki, notice)
 *   - QAPage          (qa posts)
 *   - SoftwareSourceCode (code snippets)
 *   - JobPosting      (jobs)
 *   - Event           (events)
 *   - VideoObject     (video posts)
 *   - ImageObject     (image posts)
 *   - SocialMediaPosting (text, story)
 *   - CreativeWork    (project, poll)
 *   - BreadcrumbList  (every page)
 *   - Person          (profiles — also generated in ProfileSEO)
 *
 * Every generator returns a plain object. The <JsonLD /> component
 * serialises it into a <script type="application/ld+json"> tag.
 * ---------------------------------------------------------------------------
 */

import { toDate } from './dateFormatter.js';
import { plainText, postUrl } from './seoGenerator.js';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';
const SITE_NAME = 'Bangladesh Software Development Community';

/** Shared author block (Schema.org `Person`). */
function authorOf(post) {
  return {
    '@type': 'Person',
    name: post.authorDisplayName || post.authorUsername,
    alternateName: `@${post.authorUsername}`,
    url: `${SITE_URL}/p/${post.authorUsername}`,
    image: post.authorPhotoURL || undefined
  };
}

const PUBLISHER = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg`, width: 512, height: 512 }
};

/** ISO date string from a Firestore timestamp / Date / number. */
function iso(v) {
  const d = toDate(v);
  return d ? d.toISOString() : undefined;
}

/* ===========================================================================
 *  PER-POST-TYPE SCHEMAS
 * =========================================================================*/

export function articleSchema(post) {
  const url = postUrl(post);
  return {
    '@context': 'https://schema.org',
    '@type': post.type === 'doc' ? 'TechArticle' : 'Article',
    '@id': url,
    headline: post.title || plainText(post.content || '').slice(0, 110),
    description: post.seoDescription || post.excerpt,
    inLanguage: post.language === 'bn' ? 'bn-BD' : 'en-BD',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: post.ogImage || post.images?.[0]?.url || post.images?.[0] || undefined,
    datePublished: iso(post.createdAt),
    dateModified: iso(post.updatedAt) || iso(post.createdAt),
    author: authorOf(post),
    publisher: PUBLISHER,
    keywords: (post.seoKeywords || post.tags || []).join(', '),
    wordCount: (post.content || '').split(/\s+/).filter(Boolean).length || undefined,
    articleSection: post.community || undefined,
    commentCount: post.comments || undefined,
    interactionStatistic: [{
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: post.likes || 0
    }]
  };
}

export function qaSchema(post) {
  const url = postUrl(post);
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    '@id': url,
    mainEntity: {
      '@type': 'Question',
      name: post.title,
      text: plainText(post.content || '').slice(0, 800),
      answerCount: post.comments || 0,
      upvoteCount: post.likes || 0,
      dateCreated: iso(post.createdAt),
      author: authorOf(post),
      inLanguage: post.language === 'bn' ? 'bn-BD' : 'en-BD'
    }
  };
}

export function codeSchema(post) {
  const url = postUrl(post);
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    '@id': url,
    name: post.title,
    description: post.seoDescription || plainText(post.content || '').slice(0, 160),
    programmingLanguage: post.codeLanguage || 'plaintext',
    codeRepository: post.githubUrl || undefined,
    text: (post.codeContent || '').slice(0, 5000),
    author: authorOf(post),
    datePublished: iso(post.createdAt),
    keywords: (post.tags || []).join(', ')
  };
}

export function jobSchema(post) {
  const url = postUrl(post);
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': url,
    title: post.title,
    description: post.content,
    datePosted: iso(post.createdAt),
    employmentType: (post.jobType || 'FULL_TIME').toUpperCase().replace(/-/g, '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: post.authorDisplayName || post.authorUsername,
      sameAs: `${SITE_URL}/p/${post.authorUsername}`
    },
    jobLocation: post.jobLocation ? {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: post.jobLocation, addressCountry: 'BD' }
    } : undefined,
    baseSalary: post.jobSalary ? {
      '@type': 'MonetaryAmount',
      currency: 'BDT',
      value: { '@type': 'QuantitativeValue', value: post.jobSalary, unitText: 'MONTH' }
    } : undefined,
    validThrough: iso(post.expiresAt) || undefined
  };
}

export function eventSchema(post) {
  const url = postUrl(post);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': url,
    name: post.title,
    description: post.content,
    startDate: iso(post.eventDate),
    location: post.location ? {
      '@type': 'Place',
      name: post.location,
      address: { '@type': 'PostalAddress', addressLocality: post.location, addressCountry: 'BD' }
    } : undefined,
    image: post.ogImage || post.images?.[0]?.url || undefined,
    organizer: authorOf(post),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode'
  };
}

export function videoSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': postUrl(post),
    name: post.title || 'BSDC Video',
    description: post.content || post.seoDescription,
    uploadDate: iso(post.createdAt),
    contentUrl: post.videos?.[0]?.url,
    thumbnailUrl: post.videos?.[0]?.thumbUrl || post.ogImage,
    duration: post.videos?.[0]?.duration
      ? `PT${Math.round(post.videos[0].duration)}S` : undefined,
    author: authorOf(post)
  };
}

export function imageSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': postUrl(post),
    contentUrl: post.images?.[0]?.url || post.images?.[0],
    description: post.content || post.seoDescription,
    uploadDate: iso(post.createdAt),
    creator: authorOf(post),
    license: `${SITE_URL}/terms`
  };
}

export function socialPostSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    '@id': postUrl(post),
    headline: post.title || plainText(post.content || '').slice(0, 110),
    articleBody: post.content,
    datePublished: iso(post.createdAt),
    author: authorOf(post),
    publisher: PUBLISHER,
    inLanguage: post.language === 'bn' ? 'bn-BD' : 'en-BD'
  };
}

export function creativeWorkSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': postUrl(post),
    name: post.title,
    description: post.seoDescription || plainText(post.content || '').slice(0, 160),
    url: post.projectUrl || undefined,
    codeRepository: post.githubUrl || undefined,
    keywords: [...(post.techStack || []), ...(post.tags || [])].join(', '),
    author: authorOf(post),
    image: post.ogImage
  };
}

/** Master switch — pick the right schema for any post. */
export function schemaForPost(post) {
  switch (post.type) {
    case 'blog':
    case 'doc':
    case 'wiki':
    case 'notice':
      return articleSchema(post);
    case 'qa':      return qaSchema(post);
    case 'code':    return codeSchema(post);
    case 'job':     return jobSchema(post);
    case 'event':   return eventSchema(post);
    case 'video':   return videoSchema(post);
    case 'image':   return imageSchema(post);
    case 'project':
    case 'poll':
      return creativeWorkSchema(post);
    case 'text':
    case 'story':
    default:
      return socialPostSchema(post);
  }
}

/* ===========================================================================
 *  BREADCRUMB
 * =========================================================================*/

/**
 * Build a BreadcrumbList from an array of { name, url } items.
 * Schema.org-compliant.
 */
export function breadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`
    }))
  };
}

/* ===========================================================================
 *  COMMUNITY / WEBSITE / FAQ
 * =========================================================================*/

export function communitySchema(community) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/bsdc/${community.slug}`,
    name: community.name,
    description: community.description,
    logo: community.iconURL,
    image: community.bannerURL,
    memberOf: PUBLISHER
  };
}

export function faqSchema(qaPosts = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qaPosts.map((p) => ({
      '@type': 'Question',
      name: p.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: plainText(p.content || '').slice(0, 800)
      }
    }))
  };
}

export { SITE_URL, SITE_NAME };
