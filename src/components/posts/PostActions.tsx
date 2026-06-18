import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { recordPostShare, reportPost, savePost, togglePostLike } from '@/services/post-action.service';
import { useAuth } from '@/hooks/useAuth';
import type { BSDCPost } from '@/types';

/** Interactive post actions backed by Firestore counters and documents. */
export const PostActions = ({ post }: { readonly post: BSDCPost }) => {
  const { firebaseUser } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  const requireAuth = (): string | null => {
    if (!firebaseUser) {
      setMessage('Login is required for this action.');
      return null;
    }
    return firebaseUser.uid;
  };

  const handleLike = async () => {
    const userId = requireAuth();
    if (!userId) return;
    const result = await togglePostLike(userId, post.id);
    setMessage(result.ok ? 'Like status updated.' : result.error);
  };

  const handleSave = async () => {
    const userId = requireAuth();
    if (!userId) return;
    const result = await savePost(userId, post.id);
    setMessage(result.ok ? 'Post saved.' : result.error);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    await navigator.clipboard.writeText(url);
    const result = await recordPostShare(post.id);
    setMessage(result.ok ? 'Post link copied.' : result.error);
  };

  const handleReport = async () => {
    const userId = requireAuth();
    if (!userId) return;
    const reason = window.prompt('Describe the issue with this post.');
    if (!reason) return;
    const result = await reportPost(userId, post.id, reason);
    setMessage(result.ok ? 'Report submitted for review.' : result.error);
  };

  return (
    <section className="post-actions" aria-label="Post actions">
      <Button type="button" variant="ghost" icon="heart" onClick={() => void handleLike()}>Like</Button>
      <Button type="button" variant="ghost" icon="bookmark" onClick={() => void handleSave()}>Save</Button>
      <Button type="button" variant="ghost" icon="share" onClick={() => void handleShare()}>Share</Button>
      <Button type="button" variant="ghost" icon="shield" onClick={() => void handleReport()}>Report</Button>
      {message ? <p className="form-helper" role="status">{message}</p> : null}
    </section>
  );
};
