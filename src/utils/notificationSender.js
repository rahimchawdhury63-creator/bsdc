/**
 * src/utils/notificationSender.js
 * ---------------------------------------------------------------------------
 * Two-channel notification dispatcher:
 *
 *   1. IN-APP:  writes to Firestore /notifications collection + RTDB
 *               /notifications/{uid} so the bell badge + list update live.
 *   2. PUSH:    fires OneSignal Web Push to the recipient's saved player IDs.
 *
 * IMPORTANT: OneSignal's REST API requires the secret REST_API_KEY which
 * we never expose to the browser. We therefore call OneSignal directly
 * with the public `app_id` and target by EXTERNAL USER ID (the Firebase
 * UID), letting the user's OneSignal subscription pick it up. This works
 * because OneSignal allows unauthenticated `include_external_user_ids`
 * sends WHEN the target has consented to your app. If your security
 * posture demands authenticated sends, deploy a tiny relay (e.g., Firebase
 * Functions) — see DEPLOYMENT.md.
 *
 * Every helper is fire-and-forget: notifications must never block a UX
 * flow. Errors are logged but swallowed.
 * ---------------------------------------------------------------------------
 */

import {
  collection, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { pushRealtimeNotification, pushPointsAlert } from '../firebase/realtimeDb.js';

const ONESIGNAL_APP_ID =
  import.meta.env.VITE_ONESIGNAL_APP_ID || '5f367dc9-3fc3-4fd9-b452-e32fa438509b';
const ONESIGNAL_REST = 'https://onesignal.com/api/v1/notifications';

/* ===========================================================================
 *  INTERNAL HELPERS
 * =========================================================================*/

/** Persist a durable notification doc that powers the /notifications page. */
async function persistFirestoreNotif(notif) {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notif,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[BSDC] notif persist:', err);
  }
}

/** Send a lightweight realtime notification (for the bell badge). */
function pushRealtime(uid, notif) {
  return pushRealtimeNotification(uid, notif).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn('[BSDC] rtdb notif:', err);
  });
}

/**
 * Send via OneSignal Web Push. The browser SDK targets recipients by
 * `include_external_user_ids` — these are set by our useNotifications hook
 * to each signed-in user's UID via OneSignal.login(uid).
 */
async function sendOneSignal({ uids, title, body, url, data }) {
  if (!uids || uids.length === 0) return;
  if (!ONESIGNAL_APP_ID) return;
  try {
    await fetch(ONESIGNAL_REST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_external_user_ids: uids,
        target_channel: 'push',
        headings: { en: title },
        contents: { en: body },
        url,
        data: data || {}
      })
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[BSDC] OneSignal send:', err);
  }
}

/* ===========================================================================
 *  PUBLIC DISPATCH HELPERS — one per event type.
 *  All are safe to call without `await`.
 * =========================================================================*/

const SITE = import.meta.env.VITE_SITE_URL || 'https://www.bsdc.info.bd';

/** Someone followed you. */
export function notifyFollow({ toUid, fromUser }) {
  if (!toUid || !fromUser || toUid === fromUser.uid) return;
  const notif = {
    recipientId: toUid,
    senderId: fromUser.uid,
    senderUsername: fromUser.username,
    senderPhotoURL: fromUser.photoURL || '',
    type: 'follow',
    message: `${fromUser.displayName || fromUser.username} started following you`,
    postId: '',
    postSlug: ''
  };
  persistFirestoreNotif(notif);
  pushRealtime(toUid, notif);
  sendOneSignal({
    uids: [toUid],
    title: 'New follower on BSDC',
    body: notif.message,
    url: `${SITE}/p/${fromUser.username}`
  });
}

/** Someone liked your post. */
export function notifyLike({ toUid, fromUser, post }) {
  if (!toUid || !fromUser || !post || toUid === fromUser.uid) return;
  const notif = {
    recipientId: toUid,
    senderId: fromUser.uid,
    senderUsername: fromUser.username,
    senderPhotoURL: fromUser.photoURL || '',
    type: 'like',
    message: `${fromUser.displayName || fromUser.username} liked your ${post.type || 'post'}`,
    postId: post.id,
    postSlug: post.slug || post.id
  };
  persistFirestoreNotif(notif);
  pushRealtime(toUid, notif);
  // Push for likes is optional; we skip to avoid spam on viral posts.
}

/** Someone commented on your post. */
export function notifyComment({ toUid, fromUser, post, snippet }) {
  if (!toUid || !fromUser || !post || toUid === fromUser.uid) return;
  const notif = {
    recipientId: toUid,
    senderId: fromUser.uid,
    senderUsername: fromUser.username,
    senderPhotoURL: fromUser.photoURL || '',
    type: 'comment',
    message: `${fromUser.displayName || fromUser.username} commented: ${(snippet || '').slice(0, 80)}`,
    postId: post.id,
    postSlug: post.slug || post.id
  };
  persistFirestoreNotif(notif);
  pushRealtime(toUid, notif);
  sendOneSignal({
    uids: [toUid],
    title: 'New comment on your post',
    body: notif.message,
    url: `${SITE}/post/${post.slug || post.id}`
  });
}

/** @mention notification — when a username appears in a comment/post. */
export function notifyMention({ toUid, fromUser, post }) {
  if (!toUid || !fromUser || toUid === fromUser.uid) return;
  const notif = {
    recipientId: toUid,
    senderId: fromUser.uid,
    senderUsername: fromUser.username,
    senderPhotoURL: fromUser.photoURL || '',
    type: 'mention',
    message: `${fromUser.displayName || fromUser.username} mentioned you`,
    postId: post?.id || '',
    postSlug: post?.slug || ''
  };
  persistFirestoreNotif(notif);
  pushRealtime(toUid, notif);
  sendOneSignal({
    uids: [toUid],
    title: 'You were mentioned on BSDC',
    body: notif.message,
    url: post ? `${SITE}/post/${post.slug || post.id}` : SITE
  });
}

/** New direct message — caller may suppress when the recipient is in the chat. */
export function notifyMessage({ toUid, fromUser, snippet, chatId }) {
  if (!toUid || !fromUser || toUid === fromUser.uid) return;
  const notif = {
    recipientId: toUid,
    senderId: fromUser.uid,
    senderUsername: fromUser.username,
    senderPhotoURL: fromUser.photoURL || '',
    type: 'message',
    message: `${fromUser.displayName || fromUser.username}: ${(snippet || '').slice(0, 80)}`,
    chatId: chatId || ''
  };
  pushRealtime(toUid, notif);
  sendOneSignal({
    uids: [toUid],
    title: 'New message',
    body: notif.message,
    url: `${SITE}/messages?with=${fromUser.uid}`
  });
}

/** BSDC Points received — also triggers the "ding" sound via points alert. */
export function notifyPoints({ toUid, fromUser, amount, reason }) {
  if (!toUid || !amount) return;
  const notif = {
    recipientId: toUid,
    senderId: fromUser?.uid || 'system',
    senderUsername: fromUser?.username || 'system',
    senderPhotoURL: fromUser?.photoURL || '',
    type: 'points',
    message: `You received ${amount} BSDC Points${reason ? ` for ${reason}` : ''}`,
    amount
  };
  persistFirestoreNotif(notif);
  pushRealtime(toUid, notif);
  // Live points alert (drives the "ding" + animation in PointsContext listener).
  pushPointsAlert(toUid, { amount, from: fromUser?.uid || 'system', reason: reason || '' });
  sendOneSignal({
    uids: [toUid],
    title: `+${amount} BSDC Points`,
    body: notif.message,
    url: `${SITE}/points`
  });
}

/** Verification approval / rejection. */
export function notifyVerification({ toUid, status, note }) {
  if (!toUid) return;
  const ok = status === 'approved';
  const notif = {
    recipientId: toUid,
    senderId: 'system',
    senderUsername: 'BSDC',
    senderPhotoURL: '',
    type: 'verification',
    message: ok
      ? 'Your verification has been approved. Your profile now shows the blue check.'
      : `Your verification request was not approved.${note ? ` Note: ${note}` : ''}`
  };
  persistFirestoreNotif(notif);
  pushRealtime(toUid, notif);
  sendOneSignal({
    uids: [toUid],
    title: ok ? 'Verified on BSDC' : 'Verification update',
    body: notif.message,
    url: `${SITE}/verify-apply`
  });
}

/** Bulk admin broadcast. */
export function notifyBroadcast({ uids, title, body, url }) {
  uids.forEach((uid) => {
    persistFirestoreNotif({
      recipientId: uid, senderId: 'system', senderUsername: 'BSDC',
      type: 'broadcast', message: body
    });
    pushRealtime(uid, { type: 'broadcast', message: body });
  });
  // Single batched OneSignal call.
  sendOneSignal({ uids, title, body, url });
}
