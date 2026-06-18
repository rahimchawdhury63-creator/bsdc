import { createConversationKey } from '@/utils/encryption.utils';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { Spinner } from '@components/ui/Spinner';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { EncryptionNotice } from './EncryptionNotice';

/** Active conversation window connected to Firestore metadata and RTDB messages. */
export const ChatWindow = ({ conversationId }: { readonly conversationId: string }) => {
  const { firebaseUser } = useAuth();
  const { conversation, messages, typing, isLoading, error, send, setTyping } = useMessages(conversationId);

  if (isLoading) return <div className="feed-status"><Spinner /></div>;
  if (error) return <div className="feed-status feed-status--error">{error}</div>;
  if (!conversation || !firebaseUser) return <div className="feed-empty">Conversation not found.</div>;

  const encryptionKey = createConversationKey(conversation.participants);
  const typingUsers = Object.entries(typing).filter(([uid, value]) => uid !== firebaseUser.uid && value.isTyping).map(([uid]) => uid);

  return (
    <section className="chat-window" aria-labelledby="chat-title">
      <header className="chat-window__header"><h1 id="chat-title">{conversation.groupName || 'Conversation'}</h1>{conversation.isEncrypted ? <EncryptionNotice /> : null}</header>
      <div className="message-list">
        {messages.map((message) => <MessageBubble message={message} isOwn={message.senderId === firebaseUser.uid} encryptionKey={encryptionKey} encrypted={conversation.isEncrypted} key={message.id} />)}
      </div>
      <TypingIndicator names={typingUsers} />
      <MessageInput onTyping={(isTyping) => setTyping(firebaseUser.uid, isTyping)} onSend={(content) => send({ conversationId, senderId: firebaseUser.uid, participants: conversation.participants, content, type: 'text', isEncrypted: conversation.isEncrypted }).then(() => undefined)} />
    </section>
  );
};
