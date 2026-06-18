import { Helmet } from 'react-helmet-async';
import { DEFAULT_SEO, SITE_NAME, SITE_SHORT_NAME, SITE_URL } from '@config/constants';

/** Props accepted by the reusable SEO head component. */
export interface SEOHeadProps {
  readonly title?: string;
  readonly description?: string;
  readonly canonicalPath?: string;
  readonly image?: string | undefined;
  readonly noIndex?: boolean;
}

/**
 * Universal SEO component for client-side route metadata.
 * Firebase Functions will return crawler-first HTML for dynamic URLs, while this
 * component keeps browser tabs, social previews after hydration, and SPA route
 * transitions accurate for real users.
 */
export const SEOHead = ({ title, description, canonicalPath = '/', image, noIndex = false }: SEOHeadProps) => {
  const finalTitle = title ? `${title} | ${SITE_SHORT_NAME}` : DEFAULT_SEO.title;
  const finalDescription = description || DEFAULT_SEO.description;
  const canonical = new URL(canonicalPath, SITE_URL).toString();
  const finalImage = image || DEFAULT_SEO.image;

  return (
    <Helmet prioritizeSeoTags>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={finalImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
};
