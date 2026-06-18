import { Link } from 'react-router-dom';
import { SVGIcon } from '@components/ui/SVGIcon';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

/** Navbar notification bell with unread count. */
export const NotificationBell = () => {
  const { firebaseUser } = useAuth();
  const { unreadCount } = useNotifications(firebaseUser?.uid);
  return <Link className="nav-icon-link" to="/notifications" aria-label="Notifications"><SVGIcon name="bell" width={20} height={20} decorative />{unreadCount > 0 ? <span className="nav-count">{unreadCount}</span> : null}</Link>;
};
