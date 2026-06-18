import { onValue, ref, remove, update, push, set, serverTimestamp as rtdbServerTimestamp, type Unsubscribe } from 'firebase/database';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, rtdb } from '@config/firebase';
import { FIRESTORE_COLLECTIONS, RTDB_PATHS } from '@config/constants';
import type { NotificationType, ServiceResult } from '@/types';

/** Payload used to create a real-time in-app notification. */
export interface CreateNotificationPayload {
  readonly userId: string;
  readonly type: NotificationType;
  readonly fromUserId?: string | undefined;
  readonly postId?: string | undefined;
  readonly commentId?: string | undefined;
  readonly message: string;
}

/** Realtime notification shape stored under /notifications/{userId}/{notifId}. */
export interface RealtimeNotification {
  readonly id: string;
  readonly type: NotificationType;
  readonly fromUserId?: string;
  readonly postId?: string;
  readonly commentId?: string;
  readonly message: string;
  readonly read: boolean;
  readonly timestamp: number;
}

/** Creates notification history in Firestore and live notification in RTDB. */
export const createNotification = async (payload: CreateNotificationPayload): Promise<ServiceResult<string>> => {
  try {
    const historyRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.notifications), {
      userId: payload.userId,
      type: payload.type,
      fromUserId: payload.fromUserId || null,
      postId: payload.postId || null,
      commentId: payload.commentId || null,
      message: payload.message,
      isRead: false,
      createdAt: serverTimestamp()
    });

    const liveRef = push(ref(rtdb, `${RTDB_PATHS.notifications}/${payload.userId}`));
    await set(liveRef, {
      type: payload.type,
      fromUserId: payload.fromUserId || null,
      postId: payload.postId || null,
      commentId: payload.commentId || null,
      message: payload.message,
      read: false,
      timestamp: rtdbServerTimestamp()
    });

    return { ok: true, data: historyRef.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to create notification.' };
  }
};

/** Subscribes to a user's live RTDB notifications. */
export const subscribeToNotifications = (userId: string, callback: (items: readonly RealtimeNotification[]) => void): Unsubscribe => {
  return onValue(ref(rtdb, `${RTDB_PATHS.notifications}/${userId}`), (snapshot) => {
    const value = snapshot.val() as Record<string, Omit<RealtimeNotification, 'id'>> | null;
    const items = Object.entries(value || {})
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
    callback(items);
  });
};

/** Marks one notification as read in RTDB. */
export const markNotificationRead = async (userId: string, notificationId: string): Promise<void> => {
  await update(ref(rtdb, `${RTDB_PATHS.notifications}/${userId}/${notificationId}`), { read: true });
};

/** Clears all live notifications for a user. */
export const clearNotifications = async (userId: string): Promise<void> => {
  await remove(ref(rtdb, `${RTDB_PATHS.notifications}/${userId}`));
};
