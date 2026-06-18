import type { Timestamp } from 'firebase/firestore';

/** Message media kinds supported by Realtime Database chat streams. */
export type MessageType = 'text' | 'image';

/** Firestore conversation document for direct and group chat metadata. */
export interface BSDCConversation {
  readonly id: string;
  readonly participants: readonly string[];
  readonly type: 'direct' | 'group';
  readonly groupName?: string;
  readonly groupPhoto?: string;
  readonly groupAdmins?: readonly string[];
  readonly lastMessage: string;
  readonly lastMessageAt: Timestamp;
  readonly isEncrypted: boolean;
}

/** Realtime Database message payload stored at /messages/{conversationId}/messages/{messageId}. */
export interface BSDCRealtimeMessage {
  readonly id: string;
  readonly senderId: string;
  readonly content: string;
  readonly type: MessageType;
  readonly imageUrl?: string;
  readonly timestamp: number;
  readonly readBy: Record<string, boolean>;
  readonly reactions: Record<string, readonly string[]>;
}
