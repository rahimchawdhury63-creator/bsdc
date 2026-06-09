/**
 * src/context/PointsContext.jsx
 * ---------------------------------------------------------------------------
 * Listens to RTDB /pointsAlerts/{uid} and:
 *   - Plays the "ding" sound + vibration
 *   - Surfaces a top-screen "+N BSDC Points" toast
 *   - Marks the alert as played so it doesn't replay on refresh
 *
 * Wraps every page so any consumer can read live balance from useAuth().profile
 * and call transferPoints() / awardPoints() through the imported helpers.
 *
 * Also claims the daily-login bonus exactly once per session (idempotent by
 * dedupeKey in the points engine).
 * ---------------------------------------------------------------------------
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { watchPointsAlerts, markPointsAlertPlayed } from '../firebase/realtimeDb.js';
import { claimDailyLoginBonus } from '../firebase/points.js';
import { bsdcPlayPointsSound, bsdcVibrate } from '../scripts/interactions.js';
import { toast } from '../components/common/Toast.jsx';

const PointsCtx = createContext({ recentAlerts: [] });
export function usePointsAlerts() { return useContext(PointsCtx); }

export default function PointsProvider({ children }) {
  const { profile } = useAuth();
  const [recentAlerts, setRecentAlerts] = useState([]);
  const dailyClaimedRef = useRef(false);

  // Daily-login bonus (once per browser session; engine handles per-day idempotency).
  useEffect(() => {
    if (!profile?.uid || dailyClaimedRef.current) return;
    dailyClaimedRef.current = true;
    claimDailyLoginBonus(profile.uid).catch(() => {});
  }, [profile?.uid]);

  // Live alerts.
  useEffect(() => {
    if (!profile?.uid) return undefined;
    const unsub = watchPointsAlerts(profile.uid, (list) => {
      // Play any unplayed alerts.
      list.filter((a) => !a.played).forEach((a) => {
        bsdcPlayPointsSound();
        bsdcVibrate([30, 40, 30]);
        toast.success(`+${a.amount} BSDC Points${a.reason ? ` · ${a.reason}` : ''}`, {
          title: 'Points received'
        });
        markPointsAlertPlayed(profile.uid, a.id).catch(() => {});
      });
      setRecentAlerts(list.slice(-10).reverse());
    });
    return () => unsub();
  }, [profile?.uid]);

  return (
    <PointsCtx.Provider value={{ recentAlerts }}>
      {children}
    </PointsCtx.Provider>
  );
}
