import { Link } from 'react-router-dom';
import { SVGIcon } from '@components/ui/SVGIcon';
import type { BSDCPost } from '@/types';

/** Formats a Firestore timestamp-like object for compact feed display. */
const formatPostDate = (post: BSDCPost): string => {
  const seconds = typeof post.createdAt?.seconds === 'number' ? post.createdAt.seconds : 0;
  if (!seconds) {
    return 'Recently';
  }
  return new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(seconds * 1000));
};

/** Creates a canonical route for the post based on type and slug. */
const getPostPath = (post: BSDCPost): string => `/${post.type}/${encodeURIComponent(post.slug || post.id)}`;

/** Card renderer for real Firestore post documents. */
export const PostCard = ({ post }: { readonly post: BSDCPost }) => (
  <article className="post-card" aria-labelledby={`post-${post.id}-title`}>
    <header className="post-card__header">
      <div className="post-card__avatar" aria-hidden="true"><SVGIcon name="user" width={22} height={22} decorative /></div>
      <div className="post-card__meta">
        <p className="text-small">Author ID: {post.authorId}</p>
        <time className="text-small text-muted" dateTime={typeof post.createdAt?.toDate === 'function' ? post.createdAt.toDate().toISOString() : undefined}>{formatPostDate(post)}</time>
      </div>
      <span className="post-card__type">{post.type}</span>
    </header>
    <Link className="post-card__title-link" to={getPostPath(post)}>
      <h2 id={`post-${post.id}-title`}>{post.title || 'Untitled post'}</h2>
    </Link>
    {post.excerpt || post.content ? <p className="post-card__excerpt">{post.excerpt || post.content.slice(0, 220)}</p> : null}
    {post.imageUrls.length > 0 ? (
      <div className="post-card__images" aria-label="Post images">
        {post.imageUrls.slice(0, 3).map((url) => <img src={url} alt={post.title || 'BSDC post image'} loading="lazy" key={url} />)}
      </div>
    ) : null}
    {post.tags.length > 0 ? (
      <div className="tag-row" aria-label="Post tags">
        {post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </div>
    ) : null}
    <footer className="post-card__actions" aria-label="Post engagement summary">
      <span><SVGIcon name="heart" width={18} height={18} decorative /> {post.likesCount}</span>
      <span><SVGIcon name="comment" width={18} height={18} decorative /> {post.commentsCount}</span>
      <span><SVGIcon name="share" width={18} height={18} decorative /> {post.sharesCount}</span>
      <span><SVGIcon name="trend" width={18} height={18} decorative /> {post.viewsCount}</span>
    </footer>
  </article>
);
