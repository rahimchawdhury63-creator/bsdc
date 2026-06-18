import { SEOHead } from '@components/seo/SEOHead';
import { ConversationList } from '@components/messaging/ConversationList';

/** Messenger home page without fake conversation data. */
export const MessengerHome = () => <><SEOHead title="Messenger" canonicalPath="/messenger" noIndex /><ConversationList /></>;
