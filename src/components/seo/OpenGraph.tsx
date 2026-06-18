import { Helmet } from 'react-helmet-async';

/** Lightweight Open Graph override component for assets-heavy pages. */
export interface OpenGraphProps {
  readonly type: 'website' | 'article' | 'profile';
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly image: string;
}

/** Adds explicit Open Graph tags when a page needs schema-specific overrides. */
export const OpenGraph = ({ type, title, description, url, image }: OpenGraphProps) => (
  <Helmet>
    <meta property="og:type" content={type} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:image" content={image} />
  </Helmet>
);
