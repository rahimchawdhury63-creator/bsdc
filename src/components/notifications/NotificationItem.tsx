import { Button } from '@components/ui/Button';
import type { RealtimeNotification } from '@/services/notification.service';

/** Single live notification row with read-state action. */
export const NotificationItem = ({ item, onRead }: { readonly item: RealtimeNotification; readonly onRead: () => Promise<void> }) => (
  <article className={`notification-item ${item.read ? 'notification-item--read' : ''}`.trim()}>
    <p>{item.message}</p>
    <span className="text-small text-muted">{item.type}</span>
    {!item.read ? <Button type="button" variant="ghost" onClick={() => void onRead()}>Mark read</Button> : null}
  </article>
);
