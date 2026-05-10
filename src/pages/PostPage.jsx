import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPosts } from '../firebase';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import { SkeletonList } from '../components/Skeleton';
import { useAuth } from '../AuthContext';

const TYPES = [
  { key: 'all', label: 'All Posts' },
  { key: 'qa', label: 'Q&A' },
  { key: 'blog', label: 'Blog' },
  { key: 'wiki', label: 'Wiki' },
  { key: 'snippet', label: 'Code' },
  { key: 'project', label: 'Projects' },
  { key: 'post', label: 'Text Posts' },
];

export default function PostPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'all';
  const tagParam = searchParams.get('tag') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const type = typeParam === 'all' ? null : typeParam;
      const { posts: data, lastDoc: ld } = await getPosts(type, 20);
      const filtered = tagParam ? data.filter(p => p.tags?.includes(tagParam)) : data;
      setPosts(filtered);
      setLastDoc(ld);
      setHasMore(data.length === 20);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [typeParam, tagParam]);

  useEffect(() => { load(); }, [load]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    const type = typeParam === 'all' ? null : typeParam;
    const { posts: more, lastDoc: ld } = await getPosts(type, 20, lastDoc);
    const filtered = tagParam ? more.filter(p => p.tags?.includes(tagParam)) : more;
    setPosts(p => [...p, ...filtered]);
    setLastDoc(ld);
    setHasMore(more.length === 20);
    setLoadingMore(false);
  };

  const postPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `BSDC ${typeParam === 'all' ? 'Posts' : TYPES.find(t => t.key === typeParam)?.label} — Bangladesh Software Development Community`,
    url: `https://www.bsdc.info.bd/post`,
    description: 'Browse Q&A, Wiki, Blog, Code Snippets and Projects by Bangladeshi developers on BSDC.',
  };

  return (
    <>
      <Helmet>
        <title>{typeParam === 'all' ? 'All Posts' : TYPES.find(t => t.key === typeParam)?.label} — BSDC | বাংলাদেশ সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি</title>
        <meta name="description" content={`Browse ${typeParam === 'all' ? 'all posts' : TYPES.find(t => t.key === typeParam)?.label} on BSDC — Bangladesh Software Development Community. ${tagParam ? `Filtered by tag: #${tagParam}.` : 'Q&A, Blogs, Code Snippets, Projects by Bangladeshi developers.'}`} />
        <meta name="keywords" content={`BSDC posts, ${tagParam || 'programming'}, Bangladesh developer community, ${typeParam} Bangladesh, software development forum BD`} />
        <link rel="canonical" href={`https://www.bsdc.info.bd/post`} />
        <script type="application/ld+json">{JSON.stringify(postPageJsonLd)}</script>
      </Helmet>

      <main role="main">
        <section style={{ background: 'var(--dark)', padding: '32px 16px', color: 'var(--white)' }} aria-label="Posts header">
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>
                {tagParam ? `#${tagParam}` : TYPES.find(t => t.key === typeParam)?.label || 'Posts'}
              </h1>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>
                {tagParam ? `Posts tagged with #${tagParam}` : 'বাংলাদেশের ডেভেলপারদের পোস্ট, প্রশ্ন ও কন্টেন্ট'}
              </p>
            </div>
            {user && (
              <Link to="/create" className="btn btn-primary">
                + Create Post
              </Link>
            )}
          </div>
        </section>

        <div className="page-wrapper">
          <div className="page-main">
            <div style={{ marginBottom: 16 }}>
              <SearchBar fullWidth />
            </div>

            <div className="tabs" role="tablist">
              {TYPES.map(t => (
                <button
                  key={t.key}
                  className={`tab-btn ${typeParam === t.key ? 'active' : ''}`}
                  onClick={() => setSearchParams({ type: t.key })}
                  role="tab"
                  aria-selected={typeParam === t.key}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? <SkeletonList count={8} /> : (
              posts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                    {tagParam ? `No posts with tag #${tagParam}` : 'No posts found.'}
                  </p>
                  {user && <Link to="/create" className="btn btn-primary">Create First Post</Link>}
                </div>
              ) : (
                <>
                  {posts.map(post => <PostCard key={post.id} post={post} />)}
                  {hasMore && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <button className="btn btn-outline" onClick={loadMore} disabled={loadingMore}>
                        {loadingMore ? <><span className="loading-spinner" style={{ borderColor: 'rgba(0,106,78,0.2)', borderTopColor: 'var(--green)' }} /> Loading…</> : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              )
            )}
          </div>

          <aside className="page-sidebar" role="complementary">
            <div className="sidebar-widget">
              <div className="sidebar-widget-header">Filter by Type</div>
              <div className="sidebar-widget-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {TYPES.map(t => (
                  <button key={t.key} onClick={() => setSearchParams({ type: t.key })}
                    style={{
                      textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                      border: 'none', background: typeParam === t.key ? 'var(--green-bg)' : 'transparent',
                      color: typeParam === t.key ? 'var(--green)' : 'var(--dark)', fontWeight: typeParam === t.key ? 700 : 400,
                      cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {!user && (
              <div className="sidebar-widget" style={{ background: 'linear-gradient(135deg, var(--dark), #0f172a)', color: 'white' }}>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 800, marginBottom: 8, fontSize: '1rem' }}>Join BSDC</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: 16, lineHeight: 1.6 }}>
                    Sign up to post questions, share code, and join Bangladesh's largest developer community.
                  </p>
                  <Link to="/register" className="btn btn-primary btn-sm btn-block">Join Free</Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
