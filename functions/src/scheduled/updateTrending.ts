import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';

/** Scheduled trending calculation foundation using real public post counters. */
export const updateTrending = onSchedule('every 6 hours', async () => {
  const db = getFirestore();
  const posts = await db.collection('posts').where('visibility', '==', 'public').limit(500).get();
  const batch = db.batch();
  posts.docs.forEach((post) => {
    const data = post.data();
    const score = Number(data.viewsCount || 0) + Number(data.likesCount || 0) * 4 + Number(data.commentsCount || 0) * 8 + Number(data.sharesCount || 0) * 10;
    batch.set(db.collection('trending').doc(post.id), { postId: post.id, score, updatedAt: new Date() }, { merge: true });
  });
  await batch.commit();
});
