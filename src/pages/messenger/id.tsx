import { useParams } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';
import { ChatWindow } from '@components/messaging/ChatWindow';

/** Conversation route connected to RTDB messages. */
export const MessengerConversation = () => {
  const { id } = useParams();
  return <><SEOHead title="Conversation" canonicalPath={`/messenger/${id || ''}`} noIndex />{id ? <ChatWindow conversationId={id} /> : null}</>;
};
