/**
 * src/components/profile/ProfileSEO.jsx
 * ---------------------------------------------------------------------------
 * Profile-specific SEO head tags + JSON-LD Person schema.
 *
 * Title format (per spec):
 *   "bsdc • @username | Bangladesh Software Development Community"
 *
 * Generates structured data so Google can surface profile rich results.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';

export default function ProfileSEO({ profile }) {
  if (!profile) return null;

  const url = `${SITE_URL}/p/${profile.username}`;
  const title = `bsdc • @${profile.username} | Bangladesh Software Development Community`;
  const description = (profile.bio && profile.bio.slice(0, 160))
    || `${profile.displayName || profile.username} on BSDC — ${profile.title || 'Software developer in Bangladesh'}.`;
  const image = profile.photoURL || `${SITE_URL}/og-image.png`;

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': url,
    name: profile.displayName || profile.username,
    alternateName: `@${profile.username}`,
    url,
    image,
    description,
    jobTitle: profile.title || undefined,
    address: profile.location
      ? { '@type': 'PostalAddress', addressLocality: profile.location, addressCountry: 'BD' }
      : undefined,
    knowsAbout: profile.skills && profile.skills.length ? profile.skills : undefined,
    sameAs: [
      profile.socialLinks?.github,
      profile.socialLinks?.linkedin,
      profile.socialLinks?.twitter,
      profile.socialLinks?.website
    ].filter(Boolean),
    memberOf: {
      '@type': 'Organization',
      name: 'Bangladesh Software Development Community',
      url: SITE_URL
    }
  };

  // Strip undefined fields so the JSON is clean.
  Object.keys(personSchema).forEach((k) => personSchema[k] === undefined && delete personSchema[k]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="profile:username" content={profile.username} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Person schema */}
      <script type="application/ld+json">{JSON.stringify(personSchema)}</script>
    </Helmet>
  );
}
