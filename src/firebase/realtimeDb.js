/**
 * src/firebase/realtimeDb.js
 * ---------------------------------------------------------------------------
 * Realtime Database helpers — used for:
 *   - 1:1 and group chat messages (low latency)
 *   - Presence (online / offline) using onDisconnect
 *   - Typing indicators
 *   - Live point-transfer alerts (digital sound)
 *   - Live counters (online users, total posts)
 *
 * WHY Realtime DB and not Firestore for these?
 *  - Chat needs millisecond latency on every keystroke (typing indicators).
 *    Firestore listeners are great but Realtime DB is faster + cheaper for
 *    high-frequency tiny writes.
 *  - `onDisconnect` is built into Realtime DB and is the cleanest way to
 *    mark a user offline when their tab closes.
 * ---------------------------------------------------------------------------
 */

import {
  ref,
  push,
  set,
  update,
  remove,
  get,
  onValue,
  off,
  onDisconnect,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  child
} from 'firebase/database';
import { rtdb } from './config.js';

/* ===========================================================================
 *  PRESENCE
 * =========================================================================*/

/**
 * Mark user as online and arrange auto-mark-offline on disconnect.
 * Call once after sign-in.
 */
export function setupPresence(uid) {
  if (!uid) return;
  const presenceRef = ref(rtdb, `presence/${uid}`);
  // Mark online now.
  set(presenceRef, { online: true, lastSeen: serverTimestamp() });
  // When this client disconnects (tab close, network drop), Firebase server
  // will automatically write { online:false, lastSeen: <serverTime> }.
  onDisconnect(presenceRef).set({ online: false, lastSeen: serverTimestamp() });
}

/** Subscribe to a single user's presence. Returns unsubscribe. */
export function watchPresence(uid, callback) {
  const presenceRef = ref(rtdb, `presence/${uid}`);
  const handler = onValue(presenceRef, (snap) => callback(snap.val() || { online: false }));
  return () => off(presenceRef, 'value', handler);
}

/* ===========================================================================
 *  CHAT
 * =========================================================================*/

/**
 * Build a deterministic chat ID for two users so both sides write to the
 * same node regardless of who started the conversation.
 *
 * e.g. uid "abc" + uid "xyz" -> "abc__xyz" (sorted alphabetically)
 */
export function chatIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join('__');
}

/** Send a message into a chat. Returns the auto-generated message ID. */
export async function sendMessage(chatId, message) {
  const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
  const newRef = push(messagesRef);
  const payload = {
    ...message,
    timestamp: serverTimestamp(),
    seen: false,
    reactions: {}
  };
  await set(newRef, payload);

  // Maintain a `lastMessage` summary for the chat list preview.
  await update(ref(rtdb, `chats/${chatId}`), {
    lastMessage: {
      text: message.text || (message.imageURL ? '[image]' : '[file]'),
      senderId: message.senderId,
      timestamp: serverTimestamp(),
      type: message.type || 'text'
    }
  });

  return newRef.key;
}

/** Subscribe to the last N messages of a chat. */
export function watchChat(chatId, callback, limit = 50) {
  const q = query(ref(rtdb, `chats/${chatId}/messages`), orderByChild('timestamp'), limitToLast(limit));
  const handler = onValue(q, (snap) => {
    const data = snap.val() || {};
    const messages = Object.entries(data).map(([id, m]) => ({ id, ...m }));
    messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    callback(messages);
  });
  return () => off(q, 'value', handler);
}

/** Mark a message as seen. */
export function markSeen(chatId, messageId) {
  return update(ref(rtdb, `chats/${chatId}/messages/${messageId}`), { seen: true });
}

/** Register a chat between two users (creates participant map). */
export function ensureChatExists(chatId, participants, meta = {}) {
  const participantsMap = {};
  participants.forEach((uid) => { participantsMap[uid] = true; });
  return update(ref(rtdb, `chats/${chatId}`), {
    participants: participantsMap,
    ...meta
  });
}

/**
 * Create a new group chat with auto ID.
 * Returns the new chat ID.
 *
 * Stored at /chats/{id} just like 1:1 chats — but with `isGroup: true` and
 * `name` + `iconURL` metadata. The Telegram-style "admin only" channels
 * use the same node with `isChannel: true` + `adminId`.
 */
export async function createGroupChat({ name, iconURL = '', participants = [], adminId, isChannel = false }) {
  const newRef = push(ref(rtdb, 'chats'));
  const participantsMap = {};
  participants.forEach((uid) => { participantsMap[uid] = true; });
  if (adminId) participantsMap[adminId] = true;

  await set(newRef, {
    isGroup: true,
    isChannel,
    name,
    iconURL,
    adminId,
    participants: participantsMap,
    admins: { [adminId]: true },
    createdAt: serverTimestamp()
  });

  return newRef.key;
}

/** Add/remove a member from a group. */
export function setGroupMember(chatId, uid, present) {
  return update(ref(rtdb, `chats/${chatId}/participants`), {
    [uid]: present ? true : null
  });
}

/** Promote/demote a group admin. */
export function setGroupAdmin(chatId, uid, isAdmin) {
  return update(ref(rtdb, `chats/${chatId}/admins`), {
    [uid]: isAdmin ? true : null
  });
}

/** Update group name / icon. */
export function updateGroupMeta(chatId, { name, iconURL } = {}) {
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (iconURL !== undefined) patch.iconURL = iconURL;
  return update(ref(rtdb, `chats/${chatId}`), patch);
}

/** Delete a single message (for everyone). */
export function deleteMessage(chatId, messageId) {
  return remove(ref(rtdb, `chats/${chatId}/messages/${messageId}`));
}

/** Add or remove a reaction emoji-name on a message. */
export function setMessageReaction(chatId, messageId, uid, name) {
  return update(ref(rtdb, `chats/${chatId}/messages/${messageId}/reactions`), {
    [uid]: name || null
  });
}

/** Subscribe to all of MY chats (list view). */
export function watchMyChats(myUid, callback) {
  const chatsRef = ref(rtdb, 'chats');
  const handler = onValue(chatsRef, (snap) => {
    const all = snap.val() || {};
    const mine = Object.entries(all)
      .filter(([, chat]) => chat.participants && chat.participants[myUid])
      .map(([id, chat]) => ({ id, ...chat }));
    mine.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
    callback(mine);
  });
  return () => off(chatsRef, 'value', handler);
}

/* ===========================================================================
 *  TYPING INDICATORS
 * =========================================================================*/

export function setTyping(chatId, uid, isTyping) {
  return set(ref(rtdb, `typingIndicators/${chatId}/${uid}`), {
    isTyping,
    timestamp: serverTimestamp()
  });
}

export function watchTyping(chatId, callback) {
  const tRef = ref(rtdb, `typingIndicators/${chatId}`);
  const handler = onValue(tRef, (snap) => callback(snap.val() || {}));
  return () => off(tRef, 'value', handler);
}

/* ===========================================================================
 *  POINTS ALERTS (digital sound on receipt)
 * =========================================================================*/

export function pushPointsAlert(toUid, alert) {
  return push(ref(rtdb, `pointsAlerts/${toUid}`), { ...alert, timestamp: serverTimestamp(), played: false });
}

export function watchPointsAlerts(uid, callback) {
  const r = ref(rtdb, `pointsAlerts/${uid}`);
  const handler = onValue(r, (snap) => {
    const data = snap.val() || {};
    const list = Object.entries(data).map(([id, a]) => ({ id, ...a }));
    callback(list);
  });
  return () => off(r, 'value', handler);
}

export function markPointsAlertPlayed(uid, alertId) {
  return update(ref(rtdb, `pointsAlerts/${uid}/${alertId}`), { played: true });
}

/* ===========================================================================
 *  LIVE COUNTERS
 * =========================================================================*/

export function watchLiveCounters(callback) {
  const r = ref(rtdb, 'liveCounters');
  const handler = onValue(r, (snap) => callback(snap.val() || { onlineUsers: 0, totalPosts: 0, totalUsers: 0 }));
  return () => off(r, 'value', handler);
}

/* ===========================================================================
 *  NOTIFICATIONS (lightweight realtime — Firestore has the durable copy)
 * =========================================================================*/

export function pushRealtimeNotification(toUid, notif) {
  return push(ref(rtdb, `notifications/${toUid}`), { ...notif, timestamp: serverTimestamp(), read: false });
}

export function watchRealtimeNotifications(uid, callback) {
  const r = query(ref(rtdb, `notifications/${uid}`), orderByChild('timestamp'), limitToLast(50));
  const handler = onValue(r, (snap) => {
    const data = snap.val() || {};
    const list = Object.entries(data).map(([id, n]) => ({ id, ...n }));
    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    callback(list);
  });
  return () => off(r, 'value', handler);
}

/** Generic getters for convenience */
export { ref, get, child, set, update, remove, push, onValue, off, serverTimestamp };
