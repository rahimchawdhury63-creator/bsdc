import { SEOHead } from '@components/seo/SEOHead';
import { NotificationPanel } from '@components/notifications/NotificationPanel';

/** Notifications page for authenticated users. */
export const NotificationsPage = () => <><SEOHead title="Notifications" canonicalPath="/notifications" noIndex /><NotificationPanel /></>;
