/**
 * src/hooks/useRealtime.js
 * ---------------------------------------------------------------------------
 * Suite of small hooks wrapping Firebase Realtime DB subscriptions.
 *
 * Exports:
 *   - usePresence(uid)            → { online, lastSeen }
 *   - useChatList(myUid)          → [{ id, participants, lastMessage }]
 *   - useChatMessages(chatId)     → [{ id, senderId, text, ... }]
 *   - useTyping(chatId, myUid)    → { othersTyping: Map<uid,bool>, setMyTyping(boolean) }
 *   - useLiveCounters()           → { onlineUsers, totalUsers, totalPosts }
 *
 * Every hook returns stable references and self-unsubscribes on unmount.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  watchPresence, watchMyChats, watchChat, watchTyping, setTyping,
  watchLiveCounters
} from '../firebase/realtimeDb.js';
import { bsdcDebounce } from '../scripts/interactions.js';

/** Presence of one user. */
export function usePresence(uid) {
  const [state, setState] = useState({ online: false, lastSeen: 0 });
  useEffect(() => {
    if (!uid) return undefined;
    const unsub = watchPresence(uid, (val) => setState(val || { online: false }));
    return () => unsub();
  }, [uid]);
  return state;
}

/** List of MY chats (sorted by lastMessage desc). */
export function useChatList(myUid) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!myUid) { setChats([]); setLoading(false); return undefined; }
    setLoading(true);
    const unsub = watchMyChats(myUid, (list) => {
      setChats(list);
      setLoading(false);
    });
    return () => unsub();
  }, [myUid]);
  return { chats, loading };
}

/** Live message stream for one chat. */
export function useChatMessages(chatId, limit = 100) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!chatId) { setMessages([]); setLoading(false); return undefined; }
    setLoading(true);
    const unsub = watchChat(chatId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    }, limit);
    return () => unsub();
  }, [chatId, limit]);
  return { messages, loading };
}

/**
 * Typing indicator. Returns:
 *   - othersTyping: array of uids currently typing (excluding `myUid`)
 *   - setMyTyping(true): mark me as typing; auto-cleared after 3s of silence.
 *
 * Uses a debounced "stop typing" so we don't hammer the DB on every key.
 */
export function useTyping(chatId, myUid) {
  const [raw, setRaw] = useState({});
  const stopTypingRef = useRef(null);
  const lastSentRef = useRef(false);

  useEffect(() => {
    if (!chatId) return undefined;
    const unsub = watchTyping(chatId, (val) => setRaw(val || {}));
    return () => unsub();
  }, [chatId]);

  // Build the debounced "stop typing" once per chat session.
  useEffect(() => {
    stopTypingRef.current = bsdcDebounce(() => {
      if (chatId && myUid && lastSentRef.current) {
        setTyping(chatId, myUid, false).catch(() => {});
        lastSentRef.current = false;
      }
    }, 2500);
  }, [chatId, myUid]);

  const setMyTyping = useCallback((isTyping) => {
    if (!chatId || !myUid) return;
    if (isTyping && !lastSentRef.current) {
      lastSentRef.current = true;
      setTyping(chatId, myUid, true).catch(() => {});
    }
    if (isTyping) stopTypingRef.current?.();
    else if (lastSentRef.current) {
      stopTypingRef.current?.cancel?.();
      setTyping(chatId, myUid, false).catch(() => {});
      lastSentRef.current = false;
    }
  }, [chatId, myUid]);

  const othersTyping = Object.keys(raw).filter((uid) => uid !== myUid && raw[uid]?.isTyping);
  return { othersTyping, setMyTyping };
}

/** Live counters shown in RightSidebar. */
export function useLiveCounters() {
  const [counters, setCounters] = useState({ onlineUsers: 0, totalUsers: 0, totalPosts: 0 });
  useEffect(() => {
    const unsub = watchLiveCounters((val) => setCounters(val || {}));
    return () => unsub();
  }, []);
  return counters;
}
