import { Button } from '@components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

/** Live RTDB notification panel for the authenticated user. */
export const NotificationPanel = () => {
  const { firebaseUser } = useAuth();
  const { notifications, clearAll, markRead } = useNotifications(firebaseUser?.uid);

  if (!firebaseUser) return <section className="surface-card"><h1>Notifications</h1><p className="text-muted">Login to view notifications.</p></section>;

  return (
    <section className="surface-card" aria-labelledby="notifications-title">
      <header className="section-header"><h1 id="notifications-title">Notifications</h1><Button type="button" variant="secondary" onClick={() => void clearAll()}>Clear all</Button></header>
      <div className="notification-list">
        {notifications.length === 0 ? <p className="text-muted">No notifications yet.</p> : notifications.map((item) => <NotificationItem item={item} key={item.id} onRead={() => markRead(item.id)} />)}
      </div>
    </section>
  );
};
