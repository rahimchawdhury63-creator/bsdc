import type { Timestamp } from 'firebase/firestore';

/** Point transaction categories for wallet, earning, ad spend, and transfers. */
export type PointTransactionType = 'earn' | 'spend' | 'transfer' | 'receive';

/** Firestore transaction document powering the BSDC points ledger. */
export interface BSDCPointTransaction {
  readonly id: string;
  readonly fromUserId?: string;
  readonly toUserId?: string;
  readonly amount: number;
  readonly type: PointTransactionType;
  readonly description: string;
  readonly reference: string;
  readonly qrCode?: string;
  readonly createdAt: Timestamp;
}
