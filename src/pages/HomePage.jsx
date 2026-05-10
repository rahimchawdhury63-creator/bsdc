import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPosts } from '../firebase';
import { useAuth } from '../AuthContext';
import PostCard from '../components/PostCard';
import { SkeletonList } from '../components/Skeleton';

const TABS = [
  { key: 'all', label: 'All', icon: '◈' },
  { key: 'qa', label: 'Q&A', icon: '❓' },
  { key: 'blog', label: 'Blog', icon: '📝' },
  { key: 'wiki', label: 'Wiki', icon: '📚' },
  { key: 'snippet', label: 'Code', icon: '💻' },
  { key: 'project', label: 'Projects', icon: '🚀' },
];

const POPULAR_TAGS = [
  'JavaScript', 'Python', 'React', 'Laravel', 'Django',
  'Node.js', 'বাংলা', 'Android', 'Flutter', 'PHP',
  'MySQL', 'MongoDB', 'DevOps', 'AI/ML', 'Freelancing',
];

const CodeSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const CommunityBannerSVG = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="55" fill="rgba(0,106,78,0.15)" stroke="#006A4E" strokeWidth="2" strokeDasharray="8 4"/>
    <circle cx="60" cy="40" r="18" fill="#006A4E"/>
    <text x="60" y="46" textAnchor="middle" fontFamily="Inter" fontSize="16" fontWeight="900" fill="white">BD</text>
    <circle cx="25" cy="80" r="12" fill="#004d38"/>
    <text x="25" y="85" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#6EE7B7">DEV</text>
    <circle cx="95" cy="80" r="12" fill="#004d38"/>
    <text x="95" y="85" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#6EE7B7">CODE</text>
    <line x1="43" y1="55" x2="35" y2="69" stroke="#6EE7B7" strokeWidth="2"/>
    <line x1="77" y1="55" x2="85" y2="69" stroke="#6EE7B7" strokeWidth="2"/>
    <line x1="37" y1="80" x2="83" y2="80" stroke="#6EE7B7" strokeWidth="1" strokeDasharray="4 3"/>
  </svg>
);

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState({ posts: '2.4K+', members: '8.1K+', solved: '1.2K+' });

  const loadPosts = useCallback(async (type, reset = true) => {
    if (reset) {
      setLoading(true);
      setPosts([]);
      setLastDoc(null);
    }
    try {
      const typeFilter = type === 'all' ? null : type;
      const { posts: newPosts, lastDoc: newLastDoc } = await getPosts(typeFilter, 15);
      setPosts(newPosts);
      setLastDoc(newLastDoc);
      setHasMore(newPosts.length === 15);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const typeFilter = activeTab === 'all' ? null : activeTab;
      const { posts: more, lastDoc: newLast } = await getPosts(typeFilter, 15, lastDoc);
      setPosts(p => [...p, ...more]);
      setLastDoc(newLast);
      setHasMore(more.length === 15);
    } catch (e) {
      console.error(e);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    loadPosts(activeTab, true);
  }, [activeTab, loadPosts]);

  const homepageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'BSDC — Bangladesh Software Development Community',
    description: 'বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি',
    url: 'https://www.bsdc.info.bd',
    mainEntity: {
      '@type': 'OnlineCommunity',
      name: 'Bangladesh Software Development Community',
      description: 'A community for Bangladeshi software developers',
      url: 'https://www.bsdc.info.bd',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is BSDC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BSDC (Bangladesh Software Development Community) is the premier online platform for Bangladeshi software developers to share knowledge, ask questions, write blogs, share code snippets, and collaborate on projects.',
        },
      },
      {
        '@type': 'Question',
        name: 'BSDC কী?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BSDC হলো বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি যেখানে ডেভেলপাররা প্রশ্ন করতে, জ্ঞান শেয়ার করতে এবং একসাথে বাড়তে পারেন।',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I join BSDC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can join BSDC for free by registering with your email, Google, GitHub, or Yahoo account at bsdc.info.bd/register',
        },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>BSDC — Bangladesh Software Development Community | বাংলাদেশের #1 ডেভেলপার কমিউনিটি</title>
        <meta name="description" content="BSDC — বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি। Q&A, Wiki, Blog, Code Snippets, Projects শেয়ার করুন। 8,000+ Bangladeshi developers এর সাথে যোগ দিন।" />
        <meta name="keywords" content="Bangladesh software development community, BSDC, বাংলাদেশ ডেভেলপার, programming forum Bangladesh, tech community BD, সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি, coding help Bangladesh, web development Bangladesh" />
        <link rel="canonical" href="https://www.bsdc.info.bd/" />
        <script type="application/ld+json">{JSON.stringify(homepageJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      {/* HERO */}
      <section className="hero" aria-label="BSDC Hero Section">
        <div className="hero-inner">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <CommunityBannerSVG />
          </div>
          <div className="hero-badge">
            <CodeSVG />
            Bangladesh's #1 Developer Community · ২০২৬
          </div>
          <h1>
            <span className="accent">বাংলাদেশের সেরা</span><br />
            Software Development Community
          </h1>
          <p>
            BSDC-তে আপনাকে স্বাগতম! এখানে হাজারো Bangladeshi developers একসাথে শিখছেন, শেখাচ্ছেন, এবং বড় হচ্ছেন।
            Ask questions, share knowledge, write blogs, post code snippets — সব এক জায়গায়।
            <br /><br />
            Welcome to Bangladesh Software Development Community — the definitive platform where Bangladeshi software engineers,
            web developers, mobile app creators, DevOps engineers, AI/ML researchers, and tech enthusiasts connect,
            collaborate, and grow together. Whether you code in JavaScript, Python, PHP, Java, or any other language,
            BSDC is your home.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/create" className="btn btn-primary btn-lg">
                + Create Post
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                Join Free — যোগ দিন
              </Link>
            )}
            <Link to="/post" className="btn btn-outline btn-lg" style={{ borderColor: '#6EE7B7', color: '#6EE7B7' }}>
              Browse Q&amp;A
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{stats.members}</span>
              <span className="hero-stat-label">Developers</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">{stats.posts}</span>
              <span className="hero-stat-label">Posts</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">{stats.solved}</span>
              <span className="hero-stat-label">Solved</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="page-wrapper">
        <main className="page-main" role="main">

          {/* SEO CONTENT BLOCK */}
          <section
            aria-label="About BSDC"
            style={{
              background: 'var(--white)', borderRadius: 'var(--radius)',
              border: '1px solid var(--gray-2)', padding: 28, marginBottom: 24,
            }}
            itemScope itemType="https://schema.org/Article"
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 12 }} itemProp="headline">
              বাংলাদেশের সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি — BSDC
            </h2>
            <div className="article-content" itemProp="articleBody">
              <p>
                <strong>BSDC (Bangladesh Software Development Community)</strong> হলো বাংলাদেশের সবচেয়ে বড় এবং সক্রিয় সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি প্ল্যাটফর্ম।
                আমরা বিশ্বাস করি যে <strong>জ্ঞান ভাগ করে নেওয়া</strong> একটি দেশের প্রযুক্তি খাতকে এগিয়ে নিয়ে যায়।
                BSDC-তে আপনি যেকোনো <strong>প্রোগ্রামিং প্রশ্ন</strong> করতে পারবেন, <strong>কোড স্নিপেট</strong> শেয়ার করতে পারবেন,
                <strong>টেকনিক্যাল ব্লগ</strong> লিখতে পারবেন এবং আপনার <strong>প্রজেক্ট</strong> শেয়ার করতে পারবেন।
              </p>
              <p>
                Bangladesh has a rapidly growing tech ecosystem with over <strong>600,000+ software developers</strong> working locally and
                internationally. BSDC serves as the central knowledge hub for this community — a place where a junior developer
                from Dhaka can get help from a senior engineer in San Francisco, all in their native language.
              </p>
              <h3>কী কী পাবেন BSDC-তে?</h3>
              <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                <li><strong>Q&amp;A Forum</strong> — Stack Overflow-এর মতো প্রশ্ন-উত্তর সিস্টেম, Solved/Unsolved ট্র্যাকিং সহ</li>
                <li><strong>Wiki</strong> — বাংলা ও English-এ টেকনিক্যাল ডকুমেন্টেশন এবং টিউটোরিয়াল</li>
                <li><strong>Blog</strong> — ডেভেলপারদের জন্য ডেভেলপারদের লেখা প্রযুক্তি নিবন্ধ</li>
                <li><strong>Code Snippets</strong> — Syntax highlighting সহ রেডি-টু-ইউজ কোড উদাহরণ</li>
                <li><strong>Projects</strong> — আপনার সফটওয়্যার প্রজেক্ট showcase করুন</li>
                <li><strong>Developer ID Card</strong> — আপনার ডেভেলপার পরিচয় QR কোড সহ</li>
              </ul>
              <p>
                <strong>Freelancing Bangladesh</strong>, <strong>Remote Work</strong>, <strong>Web Development</strong>,
                <strong>Mobile App Development</strong>, <strong>Machine Learning</strong>, <strong>Cloud Computing</strong> —
                সকল বিষয়ে আলোচনা হয় এখানে।
              </p>
            </div>
          </section>

          {/* TABS */}
          <div className="tabs" role="tablist" aria-label="Content filter tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls="posts-panel"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* POSTS */}
          <div id="posts-panel" role="tabpanel" aria-label={`${activeTab} posts`}>
            {loading ? (
              <SkeletonList count={6} />
            ) : posts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3 style={{ color: 'var(--dark)', marginBottom: 8 }}>No posts yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                  Be the first to post in this category!
                </p>
                {user
                  ? <Link to="/create" className="btn btn-primary">Create First Post</Link>
                  : <Link to="/register" className="btn btn-primary">Join to Post</Link>
                }
              </div>
            ) : (
              <>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
                {hasMore && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <button
                      className="btn btn-outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore
                        ? <><span className="loading-spinner" style={{ borderTopColor: 'var(--green)', borderColor: 'rgba(0,106,78,0.2)' }} /> Loading…</>
                        : 'Load More Posts'
                      }
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="page-sidebar" role="complementary" aria-label="Sidebar">
          {!user && (
            <div className="sidebar-widget" style={{ background: 'linear-gradient(135deg, var(--dark), #0f172a)', color: 'var(--white)' }}>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 8 }}>
                  Join BSDC Today
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: 16, lineHeight: 1.6 }}>
                  বাংলাদেশের সেরা ডেভেলপার কমিউনিটির অংশ হন। Free forever.
                </p>
                <Link to="/register" className="btn btn-primary btn-block">
                  Register Free
                </Link>
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.8rem', color: '#64748B' }}>
                  Already a member? <Link to="/login" style={{ color: '#6EE7B7' }}>Sign in</Link>
                </div>
              </div>
            </div>
          )}

          <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Popular Tags
            </div>
            <div className="sidebar-widget-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {POPULAR_TAGS.map(tag => (
                  <Link
                    key={tag}
                    to={`/post?tag=${encodeURIComponent(tag)}`}
                    className="sidebar-tag"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Quick Links
            </div>
            <div className="sidebar-widget-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/post?type=qa', label: 'Latest Q&A' },
                { to: '/post?type=blog', label: 'Recent Blogs' },
                { to: '/post?type=snippet', label: 'Code Snippets' },
                { to: '/wiki', label: 'Wiki Articles' },
                { to: '/post?type=project', label: 'Community Projects' },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: '0.88rem', color: 'var(--dark)',
                    padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-bg)'; e.currentTarget.style.color = 'var(--green)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--dark)'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              About BSDC
            </div>
            <div className="sidebar-widget-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
                Founded by <strong style={{ color: 'var(--dark)' }}>Rizwan Rahim Chowdhury</strong> in 2026,
                BSDC is Bangladesh's premier developer community.
              </p>
              <Link to="/about" className="btn btn-outline btn-sm btn-block">
                Learn More →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
