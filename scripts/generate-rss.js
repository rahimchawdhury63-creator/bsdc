#!/usr/bin/env node
/**
 * scripts/generate-rss.js
 * ---------------------------------------------------------------------------
 * Build-time RSS 2.0 feed generator. Outputs public/rss.xml.
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIndexData } from './_loadFirebaseData.js';
import { buildRssXml } from '../src/utils/rssGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'rss.xml');

async function main() {
  const { posts } = await loadIndexData();
  const xml = buildRssXml(posts, { max: 50 });
  await fs.writeFile(OUT, xml, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[BSDC] rss.xml written: ${Math.min(posts.length, 50)} items (${xml.length} bytes)`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[BSDC] RSS generation failed:', err);
  process.exit(0);
});
