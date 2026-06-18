import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

interface TransferPointsRequest {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly amount: number;
  readonly description: string;
}

/** Secure callable point transfer function that updates balances server-side. */
export const transferPointsCallable = onCall<TransferPointsRequest>(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login is required.');
  const { fromUserId, toUserId, amount, description } = request.data;
  if (request.auth.uid !== fromUserId) throw new HttpsError('permission-denied', 'Sender mismatch.');
  if (!toUserId || fromUserId === toUserId || amount <= 0) throw new HttpsError('invalid-argument', 'Invalid transfer request.');

  const db = getFirestore();
  const fromRef = db.collection('users').doc(fromUserId);
  const toRef = db.collection('users').doc(toUserId);
  const txRef = db.collection('pointTransactions').doc();

  await db.runTransaction(async (transaction) => {
    const fromSnap = await transaction.get(fromRef);
    const toSnap = await transaction.get(toRef);
    if (!toSnap.exists) throw new HttpsError('not-found', 'Receiver user was not found.');
    const balance = Number(fromSnap.data()?.bsdcPoints || 0);
    if (balance < amount) throw new HttpsError('failed-precondition', 'Insufficient BSDC points.');
    transaction.update(fromRef, { bsdcPoints: FieldValue.increment(-amount), updatedAt: FieldValue.serverTimestamp() });
    transaction.update(toRef, { bsdcPoints: FieldValue.increment(amount), bsdcPointsTotal: FieldValue.increment(amount), updatedAt: FieldValue.serverTimestamp() });
    transaction.set(txRef, { fromUserId, toUserId, amount, type: 'transfer', description, reference: txRef.id, createdAt: FieldValue.serverTimestamp() });
  });

  await getDatabase().ref(`points-live/${toUserId}/pendingTransfer`).set({ fromUserId, amount, timestamp: Date.now() });
  return { transactionId: txRef.id };
});
