import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

/** Scheduled cleanup for expired story documents. */
export const cleanupStories = onSchedule('every 60 minutes', async () => {
  const db = getFirestore();
  const expired = await db.collection('stories').where('expiresAt', '<', Timestamp.now()).limit(200).get();
  const batch = db.batch();
  expired.docs.forEach((story) => batch.delete(story.ref));
  await batch.commit();
});
