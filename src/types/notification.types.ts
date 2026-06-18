import type { Timestamp } from 'firebase/firestore';

/** Notification categories used by RTDB live events and Firestore history. */
export type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'reply'
  | 'mention'
  | 'message'
  | 'point_transfer'
  | 'verification_status'
  | 'new_post'
  | 'broadcast';

/** Canonical notification document in Firestore. */
export interface BSDCNotification {
  readonly id: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly fromUserId?: string;
  readonly postId?: string;
  readonly commentId?: string;
  readonly message: string;
  readonly isRead: boolean;
  readonly createdAt: Timestamp;
}
