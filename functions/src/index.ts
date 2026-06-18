import { initializeApp } from 'firebase-admin/app';
import { sitemap } from './api/sitemap.js';
import { rss } from './api/rss.js';
import { ssrMeta } from './api/ssr-meta.js';
import { transferPointsCallable } from './api/transferPoints.js';
import { cleanupStories } from './scheduled/cleanupStories.js';
import { updateTrending } from './scheduled/updateTrending.js';
import { onPostCreate } from './triggers/onPostCreate.js';
import { onCommentCreate } from './triggers/onCommentCreate.js';
import { onFollowCreate } from './triggers/onFollowCreate.js';
import { onVerificationApprove } from './triggers/onVerificationApprove.js';

initializeApp();
export { sitemap, rss, ssrMeta, cleanupStories, updateTrending, onPostCreate, onCommentCreate, onFollowCreate, onVerificationApprove, transferPointsCallable };
