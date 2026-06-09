#!/usr/bin/env node
/**
 * scripts/generate-sitemap.js
 * ---------------------------------------------------------------------------
 * Runs at build time (npm run build → npm run generate:sitemap).
 *
 * Reads PUBLIC Firestore data (posts/users/communities) and writes a fresh
 * public/sitemap.xml. Cloudflare Pages then ships that file in /sitemap.xml.
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIndexData } from './_loadFirebaseData.js';
import { buildFullSitemap } from '../src/utils/sitemapGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'sitemap.xml');

async function main() {
  const data = await loadIndexData();
  const xml = buildFullSitemap(data);
  await fs.writeFile(OUT, xml, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[BSDC] sitemap.xml written: ${data.posts.length} posts, ${data.users.length} users, ${data.communities.length} communities (${xml.length} bytes)`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[BSDC] sitemap generation failed:', err);
  // Don't fail the build over the sitemap.
  process.exit(0);
});
