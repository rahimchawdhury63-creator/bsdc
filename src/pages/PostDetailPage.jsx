import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Prism from 'prismjs';
import {
  getPostBySlug, getComments, addComment,
  upvotePost, markSolved, db
} from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { SkeletonDetail } from '../components/Skeleton';

function timeAgo(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-BD');
}

const UpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const TYPE_LABELS = { qa: 'Q&A', wiki: 'Wiki', blog: 'Blog', snippet: 'Code Snippet', project: 'Project', post: 'Post' };

export default function PostDetailPage() {
  const { slug } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const p = await getPostBySlug(slug);
      if (!p) { setLoading(false); return; }
      setPost(p);
      setUpvotes(p.upvotes || 0);
      setHasUpvoted(p.upvotedBy?.includes(user?.uid) || false);

      const cmts = await getComments(p.id);
      setComments(cmts);

      await updateDoc(doc(db, 'posts', p.id), { views: increment(1) });
      setLoading(false);
    };
    if (slug) load();
  }, [slug, user?.uid]);

  useEffect(() => {
    if (post?.code && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [post]);

  const handleUpvote = async () => {
    if (!user) { navigate('/login'); return; }
    await upvotePost(post.id, user.uid);
    if (hasUpvoted) {
      setUpvotes(p => p - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(p => p + 1);
      setHasUpvoted(true);
    }
  };

  const handleMarkSolved = async () => {
    if (!user || user.uid !== post.authorId) return;
    await markSolved(post.id);
    setPost(p => ({ ...p, solved: true }));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const data = {
        text: commentText.trim(),
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || 'Anonymous',
        authorPhoto: profile?.photoURL || user.photoURL || '',
      };
      const ref = await addComment(post.id, data);
      setComments(p => [...p, { id: ref.id, ...data, createdAt: { toDate: () => new Date() } }]);
      await updateDoc(doc(db, 'posts', post.id), { commentCount: increment(1) });
      setCommentText('');
    } catch (e) { console.error(e); }
    setCommenting(false);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = async () => {
    if (!post?.code) return;
    await navigator.clipboard.writeText(post.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container-sm" style={{ padding: '32px 16px' }}>
        <div className="card"><SkeletonDetail /></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 16px' }}>
        <h2 style={{ color: 'var(--dark)', marginBottom: 12 }}>Post Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
          This post may have been removed or the URL is incorrect.
        </p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  const postUrl = `https://www.bsdc.info.bd/post/${slug}`;
  const publishDate = post.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
  const bodyText = post.body?.replace(/<[^>]+>/g, '') || '';
  const excerpt = bodyText.slice(0, 200);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': post.type === 'blog' ? 'BlogPosting' : post.type === 'wiki' ? 'TechArticle' : 'Article',
    headline: post.title,
    description: excerpt,
    author: { '@type': 'Person', name: post.authorName, url: `https://www.bsdc.info.bd/profile/${post.authorId}` },
    publisher: {
      '@type': 'Organization',
      name: 'Bangladesh Software Development Community',
      logo: { '@type': 'ImageObject', url: 'https://www.bsdc.info.bd/favicon.ico' },
    },
    datePublished: publishDate,
    dateModified: post.updatedAt?.toDate?.()?.toISOString() || publishDate,
    url: postUrl,
    image: post.coverImage || 'https://www.bsdc.info.bd/og-image.png',
    keywords: post.tags?.join(', ') || '',
    inLanguage: ['en', 'bn'],
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  };

  const qaJsonLd = post.type === 'qa' ? {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: post.title,
      text: bodyText,
      author: { '@type': 'Person', name: post.authorName },
      dateCreated: publishDate,
      answerCount: comments.length,
      upvoteCount: upvotes,
      ...(post.solved && comments.length > 0 ? {
        acceptedAnswer: {
          '@type': 'Answer',
          text: comments[0]?.text || '',
          author: { '@type': 'Person', name: comments[0]?.authorName || '' },
          upvoteCount: 0,
        },
      } : {}),
    },
  } : null;

  const codeSnippetJsonLd = post.type === 'snippet' ? {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: post.title,
    description: bodyText,
    programmingLanguage: { '@type': 'ComputerLanguage', name: post.language || 'Unknown' },
    author: { '@type': 'Person', name: post.authorName },
    codeRepository: postUrl,
    datePublished: publishDate,
  } : null;

  return (
    <>
      <Helmet>
        <title>{post.title} — BSDC | Bangladesh Software Development Community</title>
        <meta name="description" content={`${excerpt} — ${TYPE_LABELS[post.type] || 'Post'} on BSDC by ${post.authorName}. Tags: ${post.tags?.join(', ')}`} />
        <meta name="keywords" content={`${post.tags?.join(', ')}, BSDC, Bangladesh software development, ${post.authorName}, ${post.type} Bangladesh, programming ${post.tags?.[0]} Bangladesh`} />
        <meta name="author" content={post.authorName} />
        <meta property="og:title" content={`${post.title} — BSDC`} />
        <meta property="og:description" content={excerpt} />
        <meta property="og:image" content={post.coverImage || 'https://www.bsdc.info.bd/og-image.png'} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={publishDate} />
        <meta property="article:author" content={post.authorName} />
        <meta property="article:tag" content={post.tags?.join(',')} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} — BSDC`} />
        <meta name="twitter:description" content={excerpt} />
        <meta name="twitter:image" content={post.coverImage || 'https://www.bsdc.info.bd/og-image.png'} />
        <link rel="canonical" href={postUrl} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        {qaJsonLd && <script type="application/ld+json">{JSON.stringify(qaJsonLd)}</script>}
        {codeSnippetJsonLd && <script type="application/ld+json">{JSON.stringify(codeSnippetJsonLd)}</script>}
      </Helmet>

      <div className="page-wrapper">
        <main className="page-main" role="main">
          <article itemScope itemType={`https://schema.org/${post.type === 'blog' ? 'BlogPosting' : 'Article'}`}>

            {/* Post Header */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-body">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" style={{ marginBottom: 12 }}>
                  <ol style={{ display: 'flex', gap: 8, alignItems: 'center', listStyle: 'none', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <li><Link to="/" style={{ color: 'var(--green)' }}>Home</Link></li>
                    <li>›</li>
                    <li><Link to="/post" style={{ color: 'var(--green)' }}>Posts</Link></li>
                    <li>›</li>
                    <li style={{ color: 'var(--text-muted)' }}>{post.title.slice(0, 40)}{post.title.length > 40 ? '…' : ''}</li>
                  </ol>
                </nav>

                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={`type-badge type-${post.type}`}>{TYPE_LABELS[post.type] || 'Post'}</span>
                  {post.solved && (
                    <span className="badge badge-success">
                      <CheckIcon /> Solved
                    </span>
                  )}
                  {post.tags?.map(tag => (
                    <Link key={tag} to={`/post?tag=${encodeURIComponent(tag)}`} className="sidebar-tag" style={{ fontSize: '0.75rem' }}>
                      #{tag}
                    </Link>
                  ))}
                </div>

                <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.7rem)', fontWeight: 800, color: 'var(--dark)', lineHeight: 1.3, marginBottom: 16 }} itemProp="headline">
                  {post.title}
                </h1>

                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <Link to={`/profile/${post.authorId}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {post.authorPhoto
                      ? <img src={post.authorPhoto} alt={post.authorName} className="avatar avatar-md" />
                      : <span className="avatar-placeholder avatar-md" style={{ fontSize: '1rem' }}>{post.authorName?.[0]?.toUpperCase()}</span>
                    }
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--dark)' }} itemProp="author">{post.authorName}</div>
                      <time style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} dateTime={publishDate}>
                        {timeAgo(post.createdAt)}
                      </time>
                    </div>
                  </Link>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{post.views || 0} views</span>
                  </div>
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}
                    loading="lazy"
                    itemProp="image"
                  />
                )}

                {/* Body Content */}
                {post.body && (
                  <div className="article-content" style={{ whiteSpace: 'pre-wrap' }} itemProp="articleBody">
                    {post.body}
                  </div>
                )}

                {/* Code Block */}
                {post.code && (
                  <div className="code-block-wrap" style={{ marginTop: 20 }}>
                    <span className="code-lang-label">{post.language || 'code'}</span>
                    <button className="code-copy-btn" onClick={handleCopyCode} aria-label="Copy code">
                      {codeCopied ? (
                        <><CheckIcon /> Copied!</>
                      ) : (
                        <><CopyIcon /> Copy</>
                      )}
                    </button>
                    <pre className={`language-${post.language || 'javascript'}`}>
                      <code ref={codeRef} className={`language-${post.language || 'javascript'}`}>
                        {post.code}
                      </code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="card-footer" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className={`upvote-btn ${hasUpvoted ? 'active' : ''}`}
                  onClick={handleUpvote}
                  aria-pressed={hasUpvoted}
                  style={{ fontSize: '0.92rem', padding: '8px 16px' }}
                >
                  <UpIcon />
                  {upvotes} Upvote{upvotes !== 1 ? 's' : ''}
                </button>

                {post.type === 'qa' && !post.solved && user?.uid === post.authorId && (
                  <button
                    className="btn btn-sm"
                    onClick={handleMarkSolved}
                    style={{ background: 'var(--success)', color: 'white' }}
                  >
                    <CheckIcon /> Mark as Solved
                  </button>
                )}

                <button className="btn btn-outline btn-sm" onClick={handleCopyLink}>
                  {copied ? '✓ Copied!' : 'Share Link'}
                </button>

                {user?.uid === post.authorId && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Your post
                  </span>
                )}
              </div>
            </div>

            {/* COMMENTS */}
            <section aria-label="Comments" style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 16 }}>
                {comments.length} {post.type === 'qa' ? 'Answer' : 'Comment'}{comments.length !== 1 ? 's' : ''}
              </h2>

              {/* Comment Form */}
              {user ? (
                <form onSubmit={handleComment} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {profile?.photoURL
                      ? <img src={profile.photoURL} alt={profile.displayName} className="avatar avatar-sm" style={{ flexShrink: 0, marginTop: 6 }} />
                      : <span className="avatar-placeholder avatar-sm" style={{ fontSize: '0.8rem', flexShrink: 0, marginTop: 6 }}>{profile?.displayName?.[0]?.toUpperCase()}</span>
                    }
                    <div style={{ flex: 1 }}>
                      <textarea
                        className="form-textarea"
                        style={{ minHeight: 90, resize: 'vertical' }}
                        placeholder={post.type === 'qa' ? 'Write your answer…\n\nআপনার উত্তর লিখুন…' : 'Write a comment…'}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        required
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={commenting || !commentText.trim()}>
                          {commenting
                            ? <><span className="loading-spinner" /> Posting…</>
                            : post.type === 'qa' ? 'Post Answer' : 'Post Comment'
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <p style={{ color: 'var(--green)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Sign in to {post.type === 'qa' ? 'answer this question' : 'leave a comment'}
                  </p>
                  <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                </div>
              )}

              {/* Comments List */}
              {comments.map((comment, idx) => (
                <div
                  key={comment.id}
                  style={{
                    background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-2)',
                    padding: 16, marginBottom: 12,
                    ...(post.solved && idx === 0 && post.type === 'qa' ? { borderLeft: '4px solid var(--success)' } : {}),
                  }}
                  itemScope itemType="https://schema.org/Comment"
                >
                  {post.solved && idx === 0 && post.type === 'qa' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span className="badge badge-success"><CheckIcon /> Accepted Answer</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {comment.authorPhoto
                      ? <img src={comment.authorPhoto} alt={comment.authorName} className="avatar avatar-sm" style={{ flexShrink: 0 }} />
                      : <span className="avatar-placeholder avatar-sm" style={{ fontSize: '0.8rem', flexShrink: 0 }}>{comment.authorName?.[0]?.toUpperCase()}</span>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Link to={`/profile/${comment.authorId}`} style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }} itemProp="author">
                          {comment.authorName}
                        </Link>
                        <time style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} dateTime={comment.createdAt?.toDate?.()?.toISOString()}>
                          {timeAgo(comment.createdAt)}
                        </time>
                      </div>
                      <div style={{ fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }} itemProp="text">
                        {comment.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No {post.type === 'qa' ? 'answers' : 'comments'} yet.
                  {user ? ' Be the first!' : ' Sign in to respond.'}
                </div>
              )}
            </section>
          </article>
        </main>

        {/* Sidebar */}
        <aside className="page-sidebar" role="complementary" aria-label="Post sidebar">
          <div className="sidebar-widget">
            <div className="sidebar-widget-header">Post Info</div>
            <div className="sidebar-widget-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Type', value: TYPE_LABELS[post.type] || 'Post' },
                  { label: 'Upvotes', value: upvotes },
                  { label: 'Views', value: post.views || 0 },
                  { label: 'Answers', value: comments.length },
                  { label: 'Status', value: post.solved ? '✓ Solved' : '○ Open' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="sidebar-widget-header">Author</div>
            <div className="sidebar-widget-body">
              <Link to={`/profile/${post.authorId}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                {post.authorPhoto
                  ? <img src={post.authorPhoto} alt={post.authorName} className="avatar avatar-md" />
                  : <span className="avatar-placeholder avatar-md" style={{ fontSize: '1.1rem' }}>{post.authorName?.[0]?.toUpperCase()}</span>
                }
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--dark)' }}>{post.authorName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--green)' }}>View Profile →</div>
                </div>
              </Link>
            </div>
          </div>

          {post.tags?.length > 0 && (
            <div className="sidebar-widget">
              <div className="sidebar-widget-header">Tags</div>
              <div className="sidebar-widget-body">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {post.tags.map(tag => (
                    <Link key={tag} to={`/post?tag=${encodeURIComponent(tag)}`} className="sidebar-tag">#{tag}</Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="sidebar-widget">
            <div className="sidebar-widget-body">
              <Link to="/create" className="btn btn-primary btn-sm btn-block" style={{ marginBottom: 8 }}>
                + Create Post
              </Link>
              <Link to="/post" className="btn btn-outline btn-sm btn-block">
                Browse All Posts
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
