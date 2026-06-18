import { useEffect, useMemo, useState } from 'react';
import { clearNotifications, markNotificationRead, subscribeToNotifications, type RealtimeNotification } from '@/services/notification.service';

/** Realtime notification hook backed by Firebase Realtime Database. */
export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<readonly RealtimeNotification[]>([]);

  useEffect(() => {
    if (!userId) return undefined;
    return subscribeToNotifications(userId, setNotifications);
  }, [userId]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  return {
    notifications,
    unreadCount,
    markRead: (notificationId: string) => userId ? markNotificationRead(userId, notificationId) : Promise.resolve(),
    clearAll: () => userId ? clearNotifications(userId) : Promise.resolve()
  };
};
