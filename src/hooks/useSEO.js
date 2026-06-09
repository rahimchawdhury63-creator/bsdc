/**
 * src/hooks/useSEO.js
 * ---------------------------------------------------------------------------
 * Tiny imperative helper for pages that don't render a full <SEOHead />
 * directly (e.g., admin sections that still want a title).
 *
 *   useSEO({ title: 'Admin · Users', noindex: true });
 *
 * Returns the prop object so you can also drop it straight into <SEOHead />.
 * ---------------------------------------------------------------------------
 */

import { useEffect } from 'react';

export default function useSEO({ title, description, noindex = false } = {}) {
  useEffect(() => {
    if (title) document.title = title.endsWith(' | BSDC') ? title : `${title} | BSDC`;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
    if (noindex) {
      let tag = document.querySelector('meta[name="robots"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'robots');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', 'noindex, follow');
    }
  }, [title, description, noindex]);

  return { title, description, noindex };
}
