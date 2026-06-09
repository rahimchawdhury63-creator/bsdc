/**
 * src/components/seo/JsonLD.jsx
 * ---------------------------------------------------------------------------
 * Serialise a JSON-LD object into a Helmet-managed <script> tag.
 *
 * Pass one schema or an array; they'll be flattened. Empty values are
 * pruned so Google's Rich Results Test stays clean.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

/** Recursively strip keys whose values are undefined / null / '' / []. */
function prune(obj) {
  if (Array.isArray(obj)) {
    const arr = obj.map(prune).filter((v) => v !== undefined && v !== null);
    return arr.length ? arr : undefined;
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const p = prune(v);
      if (p !== undefined && p !== null && p !== '' && !(Array.isArray(p) && p.length === 0)) {
        out[k] = p;
      }
    }
    return Object.keys(out).length ? out : undefined;
  }
  return obj;
}

/**
 * @param {Object|Array} schema  one schema or many
 * @param {String} [id]          optional script id (helps replace in tests)
 */
export default function JsonLD({ schema, id }) {
  if (!schema) return null;
  const data = Array.isArray(schema) ? schema.map(prune).filter(Boolean) : prune(schema);
  if (!data) return null;
  const json = JSON.stringify(data);
  return (
    <Helmet>
      <script type="application/ld+json" data-bsdc-id={id || 'auto'}>{json}</script>
    </Helmet>
  );
}
