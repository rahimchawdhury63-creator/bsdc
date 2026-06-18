import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

/** Awards BSDC points when a real comment document is created. */
export const onCommentCreate = onDocumentCreated('comments/{commentId}', async (event) => {
  const authorId = event.data?.data().authorId as string | undefined;
  if (!authorId) return;
  await getFirestore().collection('users').doc(authorId).set({ bsdcPoints: FieldValue.increment(2), bsdcPointsTotal: FieldValue.increment(2) }, { merge: true });
});
