import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

/** Awards BSDC points when a real post document is created. */
export const onPostCreate = onDocumentCreated('posts/{postId}', async (event) => {
  const authorId = event.data?.data().authorId as string | undefined;
  if (!authorId) return;
  await getFirestore().collection('users').doc(authorId).set({ bsdcPoints: FieldValue.increment(5), bsdcPointsTotal: FieldValue.increment(5), postsCount: FieldValue.increment(1) }, { merge: true });
});
