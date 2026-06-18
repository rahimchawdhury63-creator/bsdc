import { useParams } from 'react-router-dom';
import { Spinner } from '@components/ui/Spinner';
import { usePost } from '@/hooks/usePost';
import { CommentSection } from '@components/posts/CommentSection';
import { PostActions } from '@components/posts/PostActions';
import { PostMenu } from '@components/posts/PostMenu';
import { PostSEO } from '@components/posts/PostSEO';

/** Individual post page loaded by Firestore document ID. */
export const PostDetail = () => {
  const { id } = useParams();
  const { post, isLoading, error } = usePost(id);

  if (isLoading) {
    return <div className="feed-status"><Spinner /></div>;
  }

  if (error) {
    return <div className="feed-status feed-status--error">{error}</div>;
  }

  if (!post) {
    return <div className="feed-empty"><h1>Post not found</h1><p className="text-muted">The requested Firestore post does not exist.</p></div>;
  }

  return (
    <article className="post-detail" aria-labelledby="post-detail-title">
      <PostSEO post={post} />
      <header className="post-detail__header">
        <span className="post-card__type">{post.type}</span>
        <h1 id="post-detail-title">{post.title}</h1>
        <p className="text-muted">Author ID: {post.authorId}</p>
        <PostMenu post={post} />
      </header>
      {post.imageUrls.length > 0 ? <div className="post-detail__images">{post.imageUrls.map((url) => <img src={url} alt={post.title} loading="lazy" key={url} />)}</div> : null}
      <div className="post-detail__content">{post.content}</div>
      {post.codeContent ? <pre className="post-code-block"><code>{post.codeContent}</code></pre> : null}
      {post.pollOptions ? <div className="poll-results">{post.pollOptions.map((option) => <p key={option.id}>{option.label}: {option.votesCount}</p>)}</div> : null}
      <PostActions post={post} />
      <CommentSection postId={post.id} />
    </article>
  );
};
