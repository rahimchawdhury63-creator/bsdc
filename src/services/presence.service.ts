import { onDisconnect, onValue, ref, serverTimestamp, set, type Unsubscribe } from 'firebase/database';
import { rtdb } from '@config/firebase';
import { RTDB_PATHS } from '@config/constants';

/** Presence payload stored in Realtime Database. */
export interface PresenceState {
  readonly online: boolean;
  readonly lastSeen: unknown;
  readonly device: string;
}

/** Registers online state and schedules offline state through RTDB onDisconnect. */
export const connectPresence = async (uid: string): Promise<void> => {
  const presenceRef = ref(rtdb, `${RTDB_PATHS.presence}/${uid}`);
  await set(presenceRef, { online: true, lastSeen: serverTimestamp(), device: navigator.userAgent });
  await onDisconnect(presenceRef).set({ online: false, lastSeen: serverTimestamp(), device: navigator.userAgent });
};

/** Subscribes to a user's real-time presence document. */
export const subscribeToPresence = (uid: string, callback: (state: PresenceState | null) => void): Unsubscribe => {
  const presenceRef = ref(rtdb, `${RTDB_PATHS.presence}/${uid}`);
  return onValue(presenceRef, (snapshot) => callback(snapshot.exists() ? snapshot.val() as PresenceState : null));
};
