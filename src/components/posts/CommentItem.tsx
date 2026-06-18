import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { createComment, type BSDCComment } from '@/services/comment.service';
import { useAuth } from '@/hooks/useAuth';

/** Recursive comment item with nested reply creation. */
export const CommentItem = ({ comment, replies }: { readonly comment: BSDCComment; readonly replies: readonly BSDCComment[] }) => {
  const { firebaseUser } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  const submitReply = async () => {
    if (!firebaseUser || replyText.trim().length < 2) return;
    await createComment({ postId: comment.postId, authorId: firebaseUser.uid, parentId: comment.id, content: replyText });
    setReplyText('');
    setShowReply(false);
  };

  return (
    <article className="comment-item">
      <header className="comment-item__header">
        <strong>{comment.authorId}</strong>
      </header>
      <p>{comment.content}</p>
      <Button type="button" variant="ghost" onClick={() => setShowReply((value) => !value)}>Reply</Button>
      {showReply ? (
        <div className="comment-reply-form">
          <textarea className="form-input" rows={3} value={replyText} onChange={(event) => setReplyText(event.target.value)} />
          <Button type="button" onClick={() => void submitReply()}>Submit reply</Button>
        </div>
      ) : null}
      {replies.length > 0 ? (
        <div className="comment-replies">
          {replies.map((reply) => <CommentItem comment={reply} replies={[]} key={reply.id} />)}
        </div>
      ) : null}
    </article>
  );
};
