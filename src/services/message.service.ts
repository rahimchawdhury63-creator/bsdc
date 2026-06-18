import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { onValue, push, ref, remove, serverTimestamp as rtdbServerTimestamp, set, update, type Unsubscribe } from 'firebase/database';
import { db, rtdb } from '@config/firebase';
import { FIRESTORE_COLLECTIONS, RTDB_PATHS } from '@config/constants';
import type { BSDCConversation, BSDCRealtimeMessage, ServiceResult } from '@/types';
import { createConversationKey, encryptMessageContent } from '@/utils/encryption.utils';

/** Conversation creation payload for direct and group chats. */
export interface CreateConversationPayload {
  readonly participants: readonly string[];
  readonly type: 'direct' | 'group';
  readonly groupName?: string | undefined;
  readonly groupPhoto?: string | undefined;
  readonly isEncrypted: boolean;
}

/** Message send payload for RTDB chat streams. */
export interface SendMessagePayload {
  readonly conversationId: string;
  readonly senderId: string;
  readonly participants: readonly string[];
  readonly content: string;
  readonly type: 'text' | 'image';
  readonly imageUrl?: string | undefined;
  readonly isEncrypted: boolean;
}

/** Creates Firestore conversation metadata and RTDB membership guards. */
export const createConversation = async (payload: CreateConversationPayload): Promise<ServiceResult<string>> => {
  try {
    const conversationRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.messages), {
      participants: payload.participants,
      type: payload.type,
      groupName: payload.groupName || null,
      groupPhoto: payload.groupPhoto || null,
      groupAdmins: payload.type === 'group' ? [payload.participants[0]] : [],
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      isEncrypted: payload.isEncrypted
    });

    await Promise.all(payload.participants.map((uid) => set(ref(rtdb, `conversation-members/${conversationRef.id}/${uid}`), true)));
    return { ok: true, data: conversationRef.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to create conversation.' };
  }
};

/** Reads Firestore conversation metadata for route-level message pages. */
export const getConversation = async (conversationId: string): Promise<ServiceResult<BSDCConversation | null>> => {
  try {
    const snapshot = await getDoc(doc(db, FIRESTORE_COLLECTIONS.messages, conversationId));
    if (!snapshot.exists()) return { ok: true, data: null };
    const data = snapshot.data();
    return {
      ok: true,
      data: {
        id: snapshot.id,
        participants: Array.isArray(data.participants) ? data.participants : [],
        type: data.type || 'direct',
        groupName: data.groupName || undefined,
        groupPhoto: data.groupPhoto || undefined,
        groupAdmins: Array.isArray(data.groupAdmins) ? data.groupAdmins : [],
        lastMessage: String(data.lastMessage || ''),
        lastMessageAt: data.lastMessageAt,
        isEncrypted: Boolean(data.isEncrypted)
      }
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to load conversation.' };
  }
};

/** Sends a message into Realtime Database and updates Firestore conversation summary. */
export const sendMessage = async (payload: SendMessagePayload): Promise<ServiceResult<string>> => {
  try {
    const key = createConversationKey(payload.participants);
    const storedContent = payload.isEncrypted ? encryptMessageContent(payload.content, key) : payload.content;
    const messageRef = push(ref(rtdb, `${RTDB_PATHS.messages}/${payload.conversationId}/messages`));

    await set(messageRef, {
      senderId: payload.senderId,
      content: storedContent,
      type: payload.type,
      imageUrl: payload.imageUrl || null,
      timestamp: rtdbServerTimestamp(),
      readBy: { [payload.senderId]: true },
      reactions: {}
    });

    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.messages, payload.conversationId), {
      lastMessage: payload.type === 'image' ? 'Image message' : payload.content.slice(0, 120),
      lastMessageAt: serverTimestamp()
    });

    return { ok: true, data: messageRef.key || '' };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to send message.' };
  }
};

/** Subscribes to RTDB messages for a conversation. */
export const subscribeToMessages = (conversationId: string, callback: (messages: readonly BSDCRealtimeMessage[]) => void): Unsubscribe => {
  const messagesRef = ref(rtdb, `${RTDB_PATHS.messages}/${conversationId}/messages`);
  return onValue(messagesRef, (snapshot) => {
    const value = snapshot.val() as Record<string, Omit<BSDCRealtimeMessage, 'id'>> | null;
    const messages = Object.entries(value || {}).map(([id, message]) => ({ id, ...message })).sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
    callback(messages);
  });
};

/** Updates a user's typing indicator in RTDB. */
export const setTypingState = async (conversationId: string, uid: string, isTyping: boolean): Promise<void> => {
  await set(ref(rtdb, `${RTDB_PATHS.typing}/${conversationId}/${uid}`), { isTyping, timestamp: rtdbServerTimestamp() });
};

/** Subscribes to typing indicators for a conversation. */
export const subscribeToTyping = (conversationId: string, callback: (typing: Record<string, { isTyping: boolean; timestamp: number }>) => void): Unsubscribe => {
  return onValue(ref(rtdb, `${RTDB_PATHS.typing}/${conversationId}`), (snapshot) => callback((snapshot.val() || {}) as Record<string, { isTyping: boolean; timestamp: number }>));
};

/** Adds or removes a message reaction using SVG-label reaction names only. */
export const toggleMessageReaction = async (conversationId: string, messageId: string, reaction: string, uid: string): Promise<void> => {
  const reactionRef = ref(rtdb, `${RTDB_PATHS.messages}/${conversationId}/messages/${messageId}/reactions/${reaction}/${uid}`);
  await update(ref(rtdb, `${RTDB_PATHS.messages}/${conversationId}/messages/${messageId}/reactions/${reaction}`), { [uid]: true });
  if (!uid) await remove(reactionRef);
};
