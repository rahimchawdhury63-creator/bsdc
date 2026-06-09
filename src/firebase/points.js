/**
 * src/firebase/points.js
 * ---------------------------------------------------------------------------
 * BSDC Points engine — Firestore transaction-backed.
 *
 * Why a separate file: we want every point change to be ATOMIC and audited.
 *
 *   awardPoints(toUid, amount, reason)
 *     - increments /users/{uid}.bsdcPoints
 *     - inserts /pointsTransactions { type: 'earn' | 'bonus' | 'spend' }
 *
 *   transferPoints(fromUid, toUid, amount, reason)
 *     - debits sender, credits receiver, inserts tx — all in one transaction
 *     - rejects if sender balance < amount
 *
 *   listMyTransactions(uid)
 *     - returns latest N transactions for the dashboard
 *
 *   getLeaderboard(n)
 *     - top N users by bsdcPoints
 * ---------------------------------------------------------------------------
 */

import {
  doc, runTransaction, addDoc, collection, serverTimestamp,
  query, where, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db } from './config.js';
import { notifyPoints } from '../utils/notificationSender.js';

/**
 * Award points (system → user). Used for likes, comments, daily login, etc.
 * Safe to call multiple times; the transaction is idempotent ONLY if you
 * pass a unique `dedupeKey` (caller-provided). Without a dedupeKey the
 * award is simply incremental.
 */
export async function awardPoints(toUid, amount, reason = '', { type = 'earn', dedupeKey, silent = false } = {}) {
  if (!toUid || !amount || amount <= 0) return null;

  const userRef = doc(db, 'users', toUid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) throw new Error('User not found');
    const current = Number(snap.data().bsdcPoints || 0);
    tx.update(userRef, {
      bsdcPoints: current + amount,
      updatedAt: serverTimestamp()
    });
  });

  // Audit row (outside the transaction — purely additive).
  await addDoc(collection(db, 'pointsTransactions'), {
    fromUserId: 'system',
    toUserId: toUid,
    amount,
    type,
    reason,
    dedupeKey: dedupeKey || null,
    createdAt: serverTimestamp()
  });

  // Notify the recipient (skip during seeding etc.).
  if (!silent) notifyPoints({ toUid, amount, reason });

  return amount;
}

/**
 * Transfer points between users (atomic).
 * Throws if insufficient balance, same user, or invalid amount.
 */
export async function transferPoints(fromUid, toUid, amount, reason = '', { fromUser } = {}) {
  if (!fromUid || !toUid) throw new Error('Missing user');
  if (fromUid === toUid) throw new Error("You can't send points to yourself");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be positive');

  const a = Math.floor(amount);   // integer points only
  const fromRef = doc(db, 'users', fromUid);
  const toRef = doc(db, 'users', toUid);

  await runTransaction(db, async (tx) => {
    const [fromSnap, toSnap] = await Promise.all([tx.get(fromRef), tx.get(toRef)]);
    if (!fromSnap.exists() || !toSnap.exists()) throw new Error('User not found');
    const fromBal = Number(fromSnap.data().bsdcPoints || 0);
    if (fromBal < a) throw new Error('Insufficient BSDC Points');
    tx.update(fromRef, { bsdcPoints: fromBal - a, updatedAt: serverTimestamp() });
    tx.update(toRef, {
      bsdcPoints: Number(toSnap.data().bsdcPoints || 0) + a,
      updatedAt: serverTimestamp()
    });
  });

  await addDoc(collection(db, 'pointsTransactions'), {
    fromUserId: fromUid,
    toUserId: toUid,
    amount: a,
    type: 'transfer',
    reason,
    createdAt: serverTimestamp()
  });

  notifyPoints({
    toUid,
    fromUser,
    amount: a,
    reason: reason || `transfer from @${fromUser?.username || 'a member'}`
  });

  return a;
}

/** Spend points (e.g., create an ad campaign). */
export async function spendPoints(uid, amount, reason = '') {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount');
  const a = Math.floor(amount);
  const ref = doc(db, 'users', uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('User not found');
    const cur = Number(snap.data().bsdcPoints || 0);
    if (cur < a) throw new Error('Insufficient BSDC Points');
    tx.update(ref, { bsdcPoints: cur - a, updatedAt: serverTimestamp() });
  });

  await addDoc(collection(db, 'pointsTransactions'), {
    fromUserId: uid,
    toUserId: 'system',
    amount: a,
    type: 'spend',
    reason,
    createdAt: serverTimestamp()
  });
  return a;
}

/** Latest transactions touching this user (in or out). */
export async function listMyTransactions(uid, max = 30) {
  // We run two queries (from + to) then merge — Firestore can't OR on two fields.
  const [outSnap, inSnap] = await Promise.all([
    getDocs(query(
      collection(db, 'pointsTransactions'),
      where('fromUserId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(max)
    )),
    getDocs(query(
      collection(db, 'pointsTransactions'),
      where('toUserId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(max)
    ))
  ]);
  const items = [...outSnap.docs, ...inSnap.docs]
    .map((d) => ({ id: d.id, ...d.data() }));
  // De-dup, sort newest first, cap.
  const seen = new Set();
  const merged = [];
  for (const i of items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))) {
    if (seen.has(i.id)) continue;
    seen.add(i.id);
    merged.push(i);
    if (merged.length >= max) break;
  }
  return merged;
}

/** Top-N leaderboard by total points. */
export async function getLeaderboard(n = 20) {
  const snap = await getDocs(query(
    collection(db, 'users'),
    orderBy('bsdcPoints', 'desc'),
    limit(n)
  ));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Daily-login bonus — idempotent per UTC day via dedupeKey.
 * Returns the awarded amount, or 0 if already claimed today.
 */
export async function claimDailyLoginBonus(uid) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const key = `daily-login:${uid}:${today}`;

  // Check if already claimed today (cheap query).
  const snap = await getDocs(query(
    collection(db, 'pointsTransactions'),
    where('toUserId', '==', uid),
    where('dedupeKey', '==', key),
    limit(1)
  ));
  if (!snap.empty) return 0;

  await awardPoints(uid, 3, 'Daily login bonus', { type: 'bonus', dedupeKey: key });
  return 3;
}
