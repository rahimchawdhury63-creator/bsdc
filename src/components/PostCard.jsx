import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { upvotePost } from '../firebase';

const UpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const CommentIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const TYPE_LABELS = { qa: 'Q&A', wiki: 'Wiki', blog: 'Blog', snippet: 'Code', project: 'Project', post: 'Post' };

function timeAgo(ts) {
  if (!ts) return '';
  const now = Date.now();
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((now - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-BD');
}

export default function PostCard({ post, onUpvote }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(
    post.upvotedBy?.includes(user?.uid) || false
  );
  const [upvoting, setUpvoting] = useState(false);

  const slug = post.slug || post.id;
  const postUrl = `/post/${slug}`;

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (upvoting) return;
    setUpvoting(true);
    try {
      await upvotePost(post.id, user.uid);
      if (hasUpvoted) {
        setUpvotes(p => p - 1);
        setHasUpvoted(false);
      } else {
        setUpvotes(p => p + 1);
        setHasUpvoted(true);
      }
      onUpvote?.();
    } catch (e) {
      console.error(e);
    }
    setUpvoting(false);
  };

  const avatarLetter = post.authorName?.[0]?.toUpperCase() || 'A';

  return (
    <article className={`post-card ${post.solved ? 'solved' : ''}`} itemScope itemType="https://schema.org/Article">
      <meta itemProp="datePublished" content={post.createdAt?.toDate?.()?.toISOString() || ''} />
      <meta itemProp="author" content={post.authorName || ''} />

      <div className="post-card-header">
        {post.authorPhoto
          ? <img src={post.authorPhoto} alt={post.authorName} className="post-card-avatar" loading="lazy" />
          : (
            <span className="avatar-placeholder" style={{
              width: 40, height: 40, fontSize: '1rem',
              border: '2px solid var(--green-bg)',
            }}>
              {avatarLetter}
            </span>
          )
        }
        <div className="post-card-meta">
          <Link
            to={`/profile/${post.authorId}`}
            className="post-card-author"
            onClick={e => e.stopPropagation()}
          >
            {post.authorName || 'Anonymous'}
          </Link>
          <div className="post-card-time">
            <time dateTime={post.createdAt?.toDate?.()?.toISOString()}>
              {timeAgo(post.createdAt)}
            </time>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span className={`type-badge type-${post.type || 'post'}`}>
            {TYPE_LABELS[post.type] || 'Post'}
          </span>
          {post.solved && (
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              <CheckIcon /> Solved
            </span>
          )}
        </div>
      </div>

      <h2 className="post-card-title" itemProp="headline">
        <Link to={postUrl}>{post.title}</Link>
      </h2>

      {post.body && (
        <p className="post-card-excerpt" itemProp="description">
          {post.body.replace(/<[^>]+>/g, '').slice(0, 180)}
          {post.body.length > 180 ? '…' : ''}
        </p>
      )}

      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {post.tags.slice(0, 5).map(tag => (
            <Link
              key={tag}
              to={`/post?tag=${encodeURIComponent(tag)}`}
              className="sidebar-tag"
              style={{ fontSize: '0.75rem' }}
              onClick={e => e.stopPropagation()}
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div className="post-card-footer">
        <button
          className={`upvote-btn ${hasUpvoted ? 'active' : ''}`}
          onClick={handleUpvote}
          disabled={upvoting}
          aria-label={`Upvote (${upvotes})`}
          aria-pressed={hasUpvoted}
        >
          <UpIcon />
          {upvotes}
        </button>

        <Link to={postUrl} className="post-stat" aria-label={`${post.commentCount || 0} comments`}>
          <CommentIcon /> {post.commentCount || 0}
        </Link>

        <span className="post-stat" aria-label={`${post.views || 0} views`}>
          <EyeIcon /> {post.views || 0}
        </span>

        <Link to={postUrl} className="btn btn-sm btn-outline" style={{ marginLeft: 'auto', padding: '4px 12px' }}>
          Read More
        </Link>
      </div>
    </article>
  );
}
