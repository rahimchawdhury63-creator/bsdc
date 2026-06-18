import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useStories } from '@/hooks/useStories';

/** Text story creator connected to the real Firestore stories collection. */
export const StoryCreator = () => {
  const { firebaseUser, isAuthenticated } = useAuth();
  const { createStory } = useStories();
  const [textContent, setTextContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!firebaseUser || textContent.trim().length < 3) {
      setMessage('Write at least 3 characters before publishing a story.');
      return;
    }

    setIsSaving(true);
    const ok = await createStory({ authorId: firebaseUser.uid, textContent: textContent.trim(), backgroundColor: '#1B4332' });
    setIsSaving(false);
    setMessage(ok ? 'Story published for 24 hours.' : 'Unable to publish story.');
    if (ok) {
      setTextContent('');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="story-creator" aria-labelledby="story-creator-title">
      <h2 id="story-creator-title">Create story</h2>
      <Input id="story-text" label="Story text" value={textContent} maxLength={160} onChange={(event) => setTextContent(event.target.value)} />
      {message ? <p className={message.includes('published') ? 'form-success' : 'form-error'}>{message}</p> : null}
      <Button type="button" icon="plus" isLoading={isSaving} onClick={() => void handleCreate()}>Publish story</Button>
    </section>
  );
};
