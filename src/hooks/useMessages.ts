import { useCallback, useEffect, useState } from 'react';
import { getConversation, sendMessage, setTypingState, subscribeToMessages, subscribeToTyping, type SendMessagePayload } from '@/services/message.service';
import type { BSDCConversation, BSDCRealtimeMessage } from '@/types';

/** Hook result for RTDB messaging screens. */
export interface UseMessagesResult {
  readonly conversation: BSDCConversation | null;
  readonly messages: readonly BSDCRealtimeMessage[];
  readonly typing: Record<string, { isTyping: boolean; timestamp: number }>;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly send: (payload: SendMessagePayload) => Promise<boolean>;
  readonly setTyping: (uid: string, isTyping: boolean) => Promise<void>;
}

/** Loads Firestore conversation metadata and subscribes to RTDB messages. */
export const useMessages = (conversationId?: string): UseMessagesResult => {
  const [conversation, setConversation] = useState<BSDCConversation | null>(null);
  const [messages, setMessages] = useState<readonly BSDCRealtimeMessage[]>([]);
  const [typing, setTypingMap] = useState<Record<string, { isTyping: boolean; timestamp: number }>>({});
  const [isLoading, setIsLoading] = useState(Boolean(conversationId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return undefined;
    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeTyping: (() => void) | undefined;
    void getConversation(conversationId).then((result) => {
      setIsLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConversation(result.data);
      unsubscribeMessages = subscribeToMessages(conversationId, setMessages);
      unsubscribeTyping = subscribeToTyping(conversationId, setTypingMap);
    });
    return () => { unsubscribeMessages?.(); unsubscribeTyping?.(); };
  }, [conversationId]);

  const send = useCallback(async (payload: SendMessagePayload) => {
    const result = await sendMessage(payload);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    return true;
  }, []);

  const setTyping = useCallback(async (uid: string, isTyping: boolean) => {
    if (conversationId) await setTypingState(conversationId, uid, isTyping);
  }, [conversationId]);

  return { conversation, messages, typing, isLoading, error, send, setTyping };
};
