import { useEffect, useMemo, useState } from 'react';
import { Button } from '@components/ui/Button';
import { createComment, subscribeToPostComments, type BSDCComment } from '@/services/comment.service';
import { useAuth } from '@/hooks/useAuth';
import { CommentItem } from './CommentItem';

/** Firestore-backed comment section with nested replies grouped client-side. */
export const CommentSection = ({ postId }: { readonly postId: string }) => {
  const { firebaseUser } = useAuth();
  const [comments, setComments] = useState<readonly BSDCComment[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeToPostComments(postId, setComments, setError), [postId]);

  const rootComments = useMemo(() => comments.filter((comment) => comment.parentId === null), [comments]);
  const repliesByParent = useMemo(() => {
    const grouped = new Map<string, BSDCComment[]>();
    comments.filter((comment) => comment.parentId !== null).forEach((comment) => {
      const parentId = comment.parentId || '';
      grouped.set(parentId, [...(grouped.get(parentId) || []), comment]);
    });
    return grouped;
  }, [comments]);

  const submitComment = async () => {
    if (!firebaseUser) {
      setError('Login is required to comment.');
      return;
    }
    if (content.trim().length < 2) {
      setError('Comment must be at least 2 characters.');
      return;
    }
    const result = await createComment({ postId, authorId: firebaseUser.uid, content });
    if (result.ok) {
      setContent('');
      setError(null);
    } else {
      setError(result.error);
    }
  };

  return (
    <section className="comment-section" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments</h2>
      <div className="comment-form">
        <textarea className="form-input" rows={4} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a respectful technical comment" />
        <Button type="button" icon="comment" onClick={() => void submitComment()}>Post comment</Button>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="comment-list">
        {rootComments.length === 0 ? <p className="text-muted">No comments yet.</p> : rootComments.map((comment) => <CommentItem comment={comment} replies={repliesByParent.get(comment.id) || []} key={comment.id} />)}
      </div>
    </section>
  );
};
