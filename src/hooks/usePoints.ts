import { useEffect, useState } from 'react';
import { subscribeToPointTransactions, transferPoints, type TransferPointsPayload } from '@/services/points.service';
import type { BSDCPointTransaction } from '@/types';

/** Hook for wallet transaction history and point transfer operations. */
export const usePoints = (userId?: string) => {
  const [transactions, setTransactions] = useState<readonly BSDCPointTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return undefined;
    return subscribeToPointTransactions(userId, setTransactions);
  }, [userId]);

  const transfer = async (payload: TransferPointsPayload) => {
    const result = await transferPoints(payload);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setError(null);
    return true;
  };

  return { transactions, error, transfer };
};
