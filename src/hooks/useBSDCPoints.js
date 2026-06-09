/**
 * src/hooks/useBSDCPoints.js
 * ---------------------------------------------------------------------------
 * Read-only convenience hook.
 *
 *   const { balance, rank, progress, alerts } = useBSDCPoints();
 *
 * Reads balance from useAuth().profile (live-subscribed already), computes
 * rank + progress with the pure helpers from utils/pointsCalculator.js.
 * ---------------------------------------------------------------------------
 */

import { useMemo } from 'react';
import { useAuth } from './useAuth.js';
import { usePointsAlerts } from '../context/PointsContext.jsx';
import { rankFromPoints, rankProgress } from '../utils/pointsCalculator.js';

export default function useBSDCPoints() {
  const { profile } = useAuth();
  const { recentAlerts } = usePointsAlerts();

  return useMemo(() => {
    const balance = Number(profile?.bsdcPoints || 0);
    return {
      balance,
      rank: rankFromPoints(balance),
      progress: rankProgress(balance),
      alerts: recentAlerts
    };
  }, [profile?.bsdcPoints, recentAlerts]);
}
