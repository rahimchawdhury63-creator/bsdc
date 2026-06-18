import type { BSDCRealtimeMessage } from '@/types';
import { decryptMessageContent } from '@/utils/encryption.utils';

/** Single message bubble with optional decryption and image rendering. */
export const MessageBubble = ({ message, isOwn, encryptionKey, encrypted }: { readonly message: BSDCRealtimeMessage; readonly isOwn: boolean; readonly encryptionKey: string; readonly encrypted: boolean }) => {
  const text = encrypted ? decryptMessageContent(message.content, encryptionKey) : message.content;
  return (
    <article className={`message-bubble ${isOwn ? 'message-bubble--own' : ''}`.trim()}>
      {message.type === 'image' && message.imageUrl ? <img src={message.imageUrl} alt="Message attachment" loading="lazy" /> : <p>{text}</p>}
    </article>
  );
};
