import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPosts } from '../firebase';
import { SkeletonList } from '../components/Skeleton';

function timeAgo(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { posts: data, lastDoc: ld } = await getPosts('blog', 12);
        setPosts(data);
        setLastDoc(ld);
        setHasMore(data.length === 12);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const blogListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'BSDC Blog — Bangladesh Software Development Blog',
    description: 'বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট ব্লগ — বাংলা ও English-এ প্রযুক্তি নিবন্ধ।',
    url: 'https://www.bsdc.info.bd/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Bangladesh Software Development Community',
      logo: { '@type': 'ImageObject', url: 'https://www.bsdc.info.bd/favicon.ico' },
    },
    blogPost: posts.slice(0, 5).map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      author: { '@type': 'Person', name: p.authorName },
      datePublished: p.createdAt?.toDate?.()?.toISOString(),
      url: `https://www.bsdc.info.bd/post/${p.slug || p.id}`,
    })),
  };

  return (
    <>
      <Helmet>
        <title>Blog — BSDC | বাংলাদেশ সফটওয়্যার ডেভেলপমেন্ট ব্লগ | Tech Articles in Bangla & English</title>
        <meta name="description" content="BSDC Blog — বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট ব্লগ। বাংলা ও English-এ Web Development, Mobile App, AI/ML, DevOps, Freelancing এবং আরো অনেক বিষয়ে প্রযুক্তি নিবন্ধ পড়ুন।" />
        <meta name="keywords" content="Bangladesh tech blog, BSDC blog, বাংলা টেক ব্লগ, software development Bangladesh, programming articles Bangla, web development blog BD, technology blog Bangladesh, ডেভেলপমেন্ট ব্লগ বাংলা" />
        <link rel="canonical" href="https://www.bsdc.info.bd/blog" />
        <script type="application/ld+json">{JSON.stringify(blogListJsonLd)}</script>
      </Helmet>

      <main role="main">
        <section style={{
          background: 'linear-gradient(135deg, #1E293B, #0f172a)',
          padding: '48px 16px', color: 'var(--white)', textAlign: 'center',
        }} aria-label="Blog header">
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <span className="badge badge-green" style={{ marginBottom: 12, display: 'inline-block' }}>
              BSDC Blog
            </span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 12 }}>
              Bangladesh Software Development Blog
            </h1>
            <p style={{ color: '#CBD5E1', fontSize: '0.97rem', lineHeight: 1.7 }}>
              বাংলাদেশের ডেভেলপারদের জন্য বাংলা ও English-এ সেরা প্রযুক্তি নিবন্ধ।
              Web Dev, Mobile, AI/ML, Freelancing এবং আরো অনেক কিছু।
            </p>
          </div>
        </section>

        <div className="container" style={{ padding: '32px 16px' }}>
          {loading ? <SkeletonList count={6} /> : (
            <>
              <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {posts.map((post, index) => (
                  <article
                    key={post.id}
                    className="card"
                    style={{ cursor: 'pointer' }}
                    itemScope itemType="https://schema.org/BlogPosting"
                    onClick={() => window.location.href = `/post/${post.slug || post.id}`}
                  >
                    <meta itemProp="datePublished" content={post.createdAt?.toDate?.()?.toISOString()} />
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        style={{ width: '100%', height: 180, objectFit: 'cover' }}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        itemProp="image"
                      />
                    )}
                    <div className="card-body">
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span className="type-badge type-blog">Blog</span>
                        {post.tags?.slice(0, 2).map(t => (
                          <span key={t} className="badge badge-gray" style={{ fontSize: '0.72rem' }}>#{t}</span>
                        ))}
                      </div>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 8, lineHeight: 1.4 }} itemProp="headline">
                        <Link to={`/post/${post.slug || post.id}`} style={{ color: 'inherit' }}>{post.title}</Link>
                      </h2>
                      <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} itemProp="description">
                        {post.body?.replace(/<[^>]+>/g, '').slice(0, 150)}…
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="avatar-placeholder" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                            {post.authorName?.[0]?.toUpperCase()}
                          </span>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark)' }} itemProp="author">{post.authorName}</div>
                            <time style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }} dateTime={post.createdAt?.toDate?.()?.toISOString()}>
                              {timeAgo(post.createdAt)}
                            </time>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {post.views || 0} views
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No blog posts yet.</p>
                  <Link to="/create?type=blog" className="btn btn-primary">Write First Blog Post</Link>
                </div>
              )}

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <button className="btn btn-outline" onClick={async () => {
                    const { posts: more, lastDoc: ld } = await getPosts('blog', 12, lastDoc);
                    setPosts(p => [...p, ...more]);
                    setLastDoc(ld);
                    setHasMore(more.length === 12);
                  }}>
                    Load More Articles
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
