import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

/** Adds verified badge metadata when an admin approves a verification request. */
export const onVerificationApprove = onDocumentUpdated('verifications/{verificationId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (before?.status === after?.status || after?.status !== 'approved' || !after?.userId) return;
  await getFirestore().collection('users').doc(after.userId).set({ isVerified: true, verificationBadge: 'verified_creator' }, { merge: true });
});
