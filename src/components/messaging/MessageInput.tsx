import { useState } from 'react';
import { Button } from '@components/ui/Button';

/** Message composer with typing callbacks and keyboard submission. */
export const MessageInput = ({ onSend, onTyping }: { readonly onSend: (content: string) => Promise<void>; readonly onTyping: (isTyping: boolean) => Promise<void> }) => {
  const [content, setContent] = useState('');

  const submit = async () => {
    if (content.trim().length === 0) return;
    await onSend(content.trim());
    setContent('');
    await onTyping(false);
  };

  return (
    <div className="message-input">
      <textarea className="form-input" rows={2} value={content} onFocus={() => void onTyping(true)} onBlur={() => void onTyping(false)} onChange={(event) => setContent(event.target.value)} />
      <Button type="button" icon="message" onClick={() => void submit()}>Send</Button>
    </div>
  );
};
