/**
 * src/hooks/useNotifications.js
 * ---------------------------------------------------------------------------
 * Two responsibilities:
 *
 *  1. Live in-app notifications (durable, from Firestore) for the bell + list.
 *     We listen via onSnapshot ordered by createdAt desc.
 *
 *  2. Realtime "ping" notifications (from RTDB) for fast unread badge updates.
 *     Combined unread = max(firestore-unread, rtdb-unread).
 *
 * Also exports `setupOneSignalForUser(uid)` which links the current Firebase
 * UID to the OneSignal external user id so notifyXxx() helpers can target it.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  collection, query, where, orderBy, limit, onSnapshot, writeBatch, doc
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { watchRealtimeNotifications } from '../firebase/realtimeDb.js';

/** Subscribe to durable Firestore notifications for the current user. */
export function useFirestoreNotifications(uid, max = 30) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setItems([]); setLoading(false); return undefined; }
    setLoading(true);
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(max)
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [uid, max]);

  /** Mark all unread as read in one batched write. */
  const markAllRead = useCallback(async () => {
    const unread = items.filter((i) => !i.isRead);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((i) => batch.update(doc(db, 'notifications', i.id), { isRead: true }));
    await batch.commit();
  }, [items]);

  return { items, loading, markAllRead };
}

/** Lightweight RTDB unread counter for the bell badge. */
export function useRealtimeUnread(uid) {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (!uid) return undefined;
    const unsub = watchRealtimeNotifications(uid, setList);
    return () => unsub();
  }, [uid]);
  return useMemo(() => list.filter((n) => !n.read).length, [list]);
}

/**
 * Link the current Firebase UID to the OneSignal external user id so
 * `notifyXxx()` helpers (via REST `include_external_user_ids`) target this
 * device's subscription.
 *
 * Safe to call repeatedly; OneSignal queues until the SDK is ready.
 */
export function setupOneSignalForUser(uid) {
  if (!uid || typeof window === 'undefined') return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      // v16 SDK
      if (OneSignal.login) await OneSignal.login(uid);
      // Optional: prompt for push permission once.
      if (OneSignal.Notifications?.permission === 'default'
        && typeof OneSignal.Notifications?.requestPermission === 'function') {
        // Don't auto-prompt aggressively — leave it for the in-app setup card.
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[BSDC] OneSignal login:', err);
    }
  });
}

/** Combined unread count for the header badge. */
export function useUnreadNotifications(uid) {
  const { items } = useFirestoreNotifications(uid, 30);
  const rtUnread = useRealtimeUnread(uid);
  const fsUnread = items.filter((i) => !i.isRead).length;
  return Math.max(fsUnread, rtUnread);
}
