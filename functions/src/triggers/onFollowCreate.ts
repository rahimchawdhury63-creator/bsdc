import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getDatabase } from 'firebase-admin/database';

/** Creates a live follow notification when a follow document is created. */
export const onFollowCreate = onDocumentCreated('follows/{followId}', async (event) => {
  const data = event.data?.data();
  if (!data?.followingId || !data?.followerId) return;
  await getDatabase().ref(`notifications/${data.followingId}`).push({ type: 'follow', fromUserId: data.followerId, message: 'You have a new follower on BSDC.', read: false, timestamp: Date.now() });
});
