/**
 * src/components/seo/BreadcrumbSEO.jsx
 * ---------------------------------------------------------------------------
 * Visual breadcrumb + matching BreadcrumbList JSON-LD.
 *
 *   <BreadcrumbSEO items={[
 *     { name: 'Home', url: '/' },
 *     { name: 'Blog', url: '/explore?tab=blog' },
 *     { name: post.title, url: postUrl(post) }
 *   ]} />
 *
 * Last item is rendered as plain text (current page); all others are links.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { Link } from 'react-router-dom';
import JsonLD from './JsonLD.jsx';
import { breadcrumbSchema } from '../../utils/schemaGenerator.js';
import { IconChevronRight } from '../common/Icons.jsx';

export default function BreadcrumbSEO({ items = [], className = '' }) {
  if (!items.length) return null;
  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className={`bsdc-flex bsdc-items-center bsdc-flex-wrap bsdc-gap-xs bsdc-text-sm bsdc-text-muted ${className}`}
        style={{ marginBottom: 'var(--space-md)' }}
      >
        <ol className="bsdc-flex bsdc-items-center bsdc-flex-wrap bsdc-gap-xs" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((it, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${it.name}-${i}`} className="bsdc-flex bsdc-items-center bsdc-gap-xs">
                {i > 0 && <IconChevronRight size={12} color="#888" aria-hidden="true" />}
                {isLast ? (
                  <span aria-current="page" className="bsdc-text-bold" style={{ color: 'var(--color-text)' }}>
                    {it.name}
                  </span>
                ) : (
                  <Link to={it.url}>{it.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLD schema={breadcrumbSchema(items)} id="breadcrumb" />
    </>
  );
}
