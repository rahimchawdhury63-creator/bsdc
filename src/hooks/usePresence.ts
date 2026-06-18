import { useEffect, useState } from 'react';
import { connectPresence, subscribeToPresence, type PresenceState } from '@/services/presence.service';

/** Connects the current user to RTDB presence and optionally watches another user. */
export const usePresence = (currentUid?: string, watchUid?: string) => {
  const [presence, setPresence] = useState<PresenceState | null>(null);

  useEffect(() => {
    if (currentUid) void connectPresence(currentUid);
  }, [currentUid]);

  useEffect(() => {
    if (!watchUid) return undefined;
    return subscribeToPresence(watchUid, setPresence);
  }, [watchUid]);

  return presence;
};
