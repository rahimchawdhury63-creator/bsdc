import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPosts } from '../firebase';
import { SkeletonList } from '../components/Skeleton';
import SearchBar from '../components/SearchBar';

const CATEGORIES = ['All', 'JavaScript', 'Python', 'React', 'Laravel', 'DevOps', 'Database', 'Android', 'Flutter', 'General'];

export default function WikiPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { posts: data, lastDoc: ld } = await getPosts('wiki', 20);
        setPosts(data);
        setLastDoc(ld);
        setHasMore(data.length === 20);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter(p => p.tags?.includes(activeCategory));

  const wikiJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'BSDC Wiki — Bangladesh Software Development Wiki',
    description: 'বাংলা ও English-এ বাংলাদেশের সফটওয়্যার ডেভেলপমেন্ট উইকি — টেকনিক্যাল ডকুমেন্টেশন, টিউটোরিয়াল এবং গাইড।',
    url: 'https://www.bsdc.info.bd/wiki',
    publisher: { '@type': 'Organization', name: 'Bangladesh Software Development Community' },
  };

  return (
    <>
      <Helmet>
        <title>Wiki — BSDC | বাংলাদেশ সফটওয়্যার ডেভেলপমেন্ট উইকি | Technical Documentation in Bangla</title>
        <meta name="description" content="BSDC Wiki — বাংলা ও English-এ সফটওয়্যার ডেভেলপমেন্টের টেকনিক্যাল ডকুমেন্টেশন, টিউটোরিয়াল এবং গাইড। JavaScript, Python, React, Laravel, DevOps এবং আরো অনেক কিছু।" />
        <meta name="keywords" content="BSDC wiki, Bangladesh programming wiki, বাংলা প্রোগ্রামিং টিউটোরিয়াল, software development documentation Bangladesh, tech wiki BD, JavaScript tutorial Bangla, Python tutorial Bangladesh" />
        <link rel="canonical" href="https://www.bsdc.info.bd/wiki" />
        <script type="application/ld+json">{JSON.stringify(wikiJsonLd)}</script>
      </Helmet>

      <main role="main">
        <section style={{
          background: 'linear-gradient(135deg, var(--dark), #1a3a2e)',
          padding: '48px 16px', color: 'var(--white)', textAlign: 'center',
        }} aria-label="Wiki header">
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <span className="badge badge-green" style={{ marginBottom: 12, display: 'inline-block' }}>BSDC Wiki</span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 12 }}>
              Bangladesh Software Development Wiki
            </h1>
            <p style={{ color: '#CBD5E1', marginBottom: 24, fontSize: '0.97rem' }}>
              বাংলা ও English-এ টেকনিক্যাল ডকুমেন্টেশন, টিউটোরিয়াল এবং গাইড।
              Community-powered knowledge base for Bangladeshi developers.
            </p>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <SearchBar fullWidth />
            </div>
          </div>
        </section>

        <div className="page-wrapper">
          <div className="page-main">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`sidebar-tag ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  style={activeCategory === cat ? { background: 'var(--green-bg)', color: 'var(--green)', fontWeight: 700 } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? <SkeletonList count={5} /> : (
              <>
                {filtered.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: 'var(--text-muted)' }}>No wiki articles yet. <Link to="/create" style={{ color: 'var(--green)' }}>Write one!</Link></p>
                  </div>
                ) : filtered.map(post => (
                  <article key={post.id} className="post-card" itemScope itemType="https://schema.org/Article">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span className="type-badge type-wiki">Wiki</span>
                      {post.tags?.slice(0, 3).map(t => (
                        <span key={t} className="badge badge-gray" style={{ fontSize: '0.72rem' }}>#{t}</span>
                      ))}
                    </div>
                    <h2 className="post-card-title" itemProp="headline">
                      <Link to={`/post/${post.slug || post.id}`}>{post.title}</Link>
                    </h2>
                    <p className="post-card-excerpt" itemProp="description">
                      {post.body?.replace(/<[^>]+>/g, '').slice(0, 200)}…
                    </p>
                    <div className="post-card-footer">
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        By {post.authorName}
                      </span>
                      <Link to={`/post/${post.slug || post.id}`} className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }}>
                        Read Article →
                      </Link>
                    </div>
                  </article>
                ))}
              </>
            )}
          </div>

          <aside className="page-sidebar" role="complementary">
            <div className="sidebar-widget">
              <div className="sidebar-widget-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Contribute to Wiki
              </div>
              <div className="sidebar-widget-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Share your knowledge! Write a wiki article about any software development topic in Bangla or English.
                </p>
                <Link to="/create?type=wiki" className="btn btn-primary btn-sm btn-block">
                  Write Wiki Article
                </Link>
              </div>
            </div>

            <div className="sidebar-widget">
              <div className="sidebar-widget-header">Topics</div>
              <div className="sidebar-widget-body">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {CATEGORIES.slice(1).map(cat => (
                    <button key={cat} className="sidebar-tag" onClick={() => setActiveCategory(cat)}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
