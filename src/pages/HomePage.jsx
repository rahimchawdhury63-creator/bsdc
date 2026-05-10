import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { db, getPosts } from '../firebase';
import {
  collection, query, orderBy, limit,
  getDocs, where, getCountFromServer
} from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import { SkeletonList } from '../components/Skeleton';

/* ═══════════════════════════════════════════════
   SVG ICON LIBRARY
═══════════════════════════════════════════════ */
const I = {
  Code: function() {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    );
  },
  Users: function() {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    );
  },
  Post: function() {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    );
  },
  Check: function() {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    );
  },
  Trophy: function() {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
    );
  },
  Star: function() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    );
  },
  QA: function() {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    );
  },
  Arrow: function() {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    );
  },
  Globe: function() {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    );
  },
  Zap: function() {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    );
  },
  Book: function() {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    );
  },
  Fire: function() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
      </svg>
    );
  },
  Shield: function() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    );
  },
};

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */
var TABS = [
  { key: 'all',     label: 'All' },
  { key: 'qa',      label: 'Q&A' },
  { key: 'blog',    label: 'Blog' },
  { key: 'wiki',    label: 'Wiki' },
  { key: 'snippet', label: 'Code' },
  { key: 'project', label: 'Projects' },
  { key: 'post',    label: 'Discussion' },
];

var POPULAR_TAGS = [
  'JavaScript', 'Python', 'React', 'Laravel', 'Django',
  'Node.js', 'বাংলা', 'Android', 'Flutter', 'PHP',
  'MySQL', 'MongoDB', 'DevOps', 'Docker', 'AI/ML',
  'TypeScript', 'Next.js', 'Vue.js', 'CSS', 'AWS',
  'Freelancing', 'Career', 'Beginners', 'Git',
];

/* ═══════════════════════════════════════════════
   HELPER: Real Stats from Firestore
═══════════════════════════════════════════════ */
async function fetchRealStats() {
  var stats = {
    posts:    0,
    members:  0,
    solved:   0,
    qa:       0,
    blogs:    0,
    snippets: 0,
    projects: 0,
    wikis:    0,
  };
  try {
    var postsSnap   = await getCountFromServer(collection(db, 'posts'));
    stats.posts     = postsSnap.data().count;

    var usersSnap   = await getCountFromServer(collection(db, 'users'));
    stats.members   = usersSnap.data().count;

    var solvedSnap  = await getCountFromServer(
      query(collection(db, 'posts'), where('solved', '==', true))
    );
    stats.solved    = solvedSnap.data().count;

    var qaSnap      = await getCountFromServer(
      query(collection(db, 'posts'), where('type', '==', 'qa'))
    );
    stats.qa        = qaSnap.data().count;

    var blogSnap    = await getCountFromServer(
      query(collection(db, 'posts'), where('type', '==', 'blog'))
    );
    stats.blogs     = blogSnap.data().count;

    var snippetSnap = await getCountFromServer(
      query(collection(db, 'posts'), where('type', '==', 'snippet'))
    );
    stats.snippets  = snippetSnap.data().count;

    var projectSnap = await getCountFromServer(
      query(collection(db, 'posts'), where('type', '==', 'project'))
    );
    stats.projects  = projectSnap.data().count;

    var wikiSnap    = await getCountFromServer(
      query(collection(db, 'posts'), where('type', '==', 'wiki'))
    );
    stats.wikis     = wikiSnap.data().count;

  } catch (err) {
    console.warn('Stats fetch error:', err);
  }
  return stats;
}

/* ═══════════════════════════════════════════════
   HELPER: Top Contributors
═══════════════════════════════════════════════ */
async function fetchTopContributors(cnt) {
  try {
    var q = query(
      collection(db, 'users'),
      orderBy('reputation', 'desc'),
      limit(cnt || 5)
    );
    var snap = await getDocs(q);
    return snap.docs.map(function(d) { return { id: d.id, ...d.data() }; });
  } catch (err) {
    console.warn('Top contributors fetch error:', err);
    return [];
  }
}

/* ═══════════════════════════════════════════════
   HELPER: Trending Posts (most upvoted recent)
═══════════════════════════════════════════════ */
async function fetchTrendingPosts(cnt) {
  try {
    var q = query(
      collection(db, 'posts'),
      orderBy('upvotes', 'desc'),
      limit(cnt || 5)
    );
    var snap = await getDocs(q);
    return snap.docs.map(function(d) { return { id: d.id, ...d.data() }; });
  } catch (err) {
    console.warn('Trending fetch error:', err);
    return [];
  }
}

/* Format large numbers */
function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: Stat Card
═══════════════════════════════════════════════ */
function StatCard(props) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 14,
      padding: '22px 20px',
      textAlign: 'center',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      cursor: 'default',
      flex: 1,
      minWidth: 120,
    }}
      onMouseEnter={function(e) {
        e.currentTarget.style.background = 'rgba(110,231,183,0.1)';
        e.currentTarget.style.transform  = 'translateY(-4px)';
        e.currentTarget.style.boxShadow  = '0 12px 24px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={function(e) {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform  = '';
        e.currentTarget.style.boxShadow  = '';
      }}
    >
      <div style={{ color: '#6EE7B7', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
        {props.icon}
      </div>
      <div style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
        fontWeight: 900,
        color: '#6EE7B7',
        lineHeight: 1,
        fontFamily: 'var(--font-mono)',
      }}>
        {props.value}
      </div>
      <div style={{
        fontSize: '0.78rem',
        color: '#94A3B8',
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 600,
      }}>
        {props.label}
      </div>
      {props.sub && (
        <div style={{ fontSize: '0.72rem', color: '#6EE7B7', marginTop: 4, fontWeight: 600 }}>
          {props.sub}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: Top Contributor Card (like শিক্ষক বাতায়ন)
═══════════════════════════════════════════════ */
function ContributorCard(props) {
  var user = props.user;
  var rank = props.rank;
  var medalColor = rank === 1 ? '#F59E0B' : rank === 2 ? '#94A3B8' : rank === 3 ? '#CD7F32' : 'var(--green)';
  var bgGradient = rank === 1
    ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
    : rank === 2
    ? 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)'
    : rank === 3
    ? 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)'
    : 'var(--white)';

  return (
    <Link
      to={'/profile/' + user.uid}
      style={{
        background: bgGradient,
        border: '2px solid ' + medalColor + '40',
        borderRadius: 'var(--radius)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.2s',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={function(e) {
        e.currentTarget.style.transform  = 'translateY(-2px)';
        e.currentTarget.style.boxShadow  = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = medalColor;
      }}
      onMouseLeave={function(e) {
        e.currentTarget.style.transform  = '';
        e.currentTarget.style.boxShadow  = '';
        e.currentTarget.style.borderColor = medalColor + '40';
      }}
    >
      {/* Rank badge */}
      <div style={{
        position: 'absolute',
        top: -1,
        right: -1,
        background: medalColor,
        color: rank <= 3 ? '#fff' : '#fff',
        padding: '2px 10px',
        borderRadius: '0 0 0 8px',
        fontSize: '0.72rem',
        fontWeight: 800,
      }}>
        #{rank}
      </div>

      {/* Avatar */}
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName + ' — BSDC Top Contributor'}
          style={{
            width: 50, height: 50,
            borderRadius: 12,
            border: '3px solid ' + medalColor,
            objectFit: 'cover',
            flexShrink: 0,
          }}
          loading="lazy"
        />
      ) : (
        <div style={{
          width: 50, height: 50,
          borderRadius: 12,
          border: '3px solid ' + medalColor,
          background: 'var(--green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem',
          fontWeight: 800,
          color: 'white',
          flexShrink: 0,
        }}>
          {(user.displayName || 'U')[0].toUpperCase()}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--dark)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {user.displayName || 'Developer'}
        </div>
        <div style={{
          display: 'flex', gap: 10, marginTop: 4,
          fontSize: '0.75rem', color: 'var(--text-muted)',
        }}>
          <span title="Reputation" style={{ display: 'flex', alignItems: 'center', gap: 3, color: medalColor, fontWeight: 700 }}>
            <I.Star /> {user.reputation || 0}
          </span>
          <span title="Posts" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <I.Post /> {user.postCount || 0}
          </span>
        </div>
        {user.skills && user.skills.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {user.skills.slice(0, 3).map(function(s) {
              return (
                <span key={s} style={{
                  padding: '1px 7px',
                  borderRadius: 100,
                  background: medalColor + '18',
                  color: medalColor,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                }}>
                  {s}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: Trending Post Item
═══════════════════════════════════════════════ */
function TrendingPostItem(props) {
  var post = props.post;
  var idx  = props.index;
  var slug = post.slug || post.id;
  var TYPE_COLORS = {
    qa: '#7C3AED', blog: '#1E40AF', wiki: '#92400E',
    snippet: '#065F46', project: '#9F1239', post: '#475569',
  };
  var TYPE_LABELS = {
    qa: 'Q&A', blog: 'Blog', wiki: 'Wiki',
    snippet: 'Code', project: 'Project', post: 'Post',
  };
  var clr = TYPE_COLORS[post.type] || '#475569';

  return (
    <Link
      to={'/post/' + slug}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid var(--gray-2)',
        textDecoration: 'none',
        transition: 'all 0.15s',
      }}
      onMouseEnter={function(e) {
        e.currentTarget.style.paddingLeft = '8px';
        e.currentTarget.style.background  = 'var(--green-bg)';
        e.currentTarget.style.borderRadius = '6px';
      }}
      onMouseLeave={function(e) {
        e.currentTarget.style.paddingLeft = '0';
        e.currentTarget.style.background  = '';
        e.currentTarget.style.borderRadius = '';
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: idx < 3 ? 'var(--green)' : 'var(--gray-2)',
        color: idx < 3 ? 'white' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.78rem', fontWeight: 800, flexShrink: 0, marginTop: 2,
      }}>
        {idx + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.85rem', fontWeight: 600,
          color: 'var(--dark)', lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {post.title}
        </div>
        <div style={{
          display: 'flex', gap: 8, marginTop: 5,
          fontSize: '0.72rem', color: 'var(--text-muted)',
          alignItems: 'center',
        }}>
          <span style={{
            background: clr + '15', color: clr,
            padding: '1px 6px', borderRadius: 4,
            fontWeight: 700, fontSize: '0.68rem',
          }}>
            {TYPE_LABELS[post.type] || 'Post'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            ▲ {post.upvotes || 0}
          </span>
          <span>{post.commentCount || 0} ans</span>
        </div>
      </div>
    </Link>
  );
}
/* ═══════════════════════════════════════════════
   MAIN HOMEPAGE COMPONENT
═══════════════════════════════════════════════ */
export default function HomePage() {
  var { user }    = useAuth();
  var navigate    = useNavigate();

  /* State */
  var [activeTab,    setActiveTab]    = useState('all');
  var [posts,        setPosts]        = useState([]);
  var [loading,      setLoading]      = useState(true);
  var [lastDoc,      setLastDoc]      = useState(null);
  var [hasMore,      setHasMore]      = useState(true);
  var [loadingMore,  setLoadingMore]  = useState(false);
  var [stats,        setStats]        = useState({ posts: 0, members: 0, solved: 0, qa: 0, blogs: 0, snippets: 0, projects: 0, wikis: 0 });
  var [contributors, setContributors] = useState([]);
  var [trending,     setTrending]     = useState([]);
  var [statsLoading, setStatsLoading] = useState(true);
  var [contribLoading, setContribLoading] = useState(true);

  /* ── Load real-time stats ── */
  useEffect(function() {
    var mounted = true;
    fetchRealStats().then(function(s) {
      if (mounted) {
        setStats(s);
        setStatsLoading(false);
      }
    });
    return function() { mounted = false; };
  }, []);

  /* ── Load top contributors ── */
  useEffect(function() {
    var mounted = true;
    fetchTopContributors(8).then(function(c) {
      if (mounted) {
        setContributors(c);
        setContribLoading(false);
      }
    });
    return function() { mounted = false; };
  }, []);

  /* ── Load trending posts ── */
  useEffect(function() {
    var mounted = true;
    fetchTrendingPosts(6).then(function(t) {
      if (mounted) setTrending(t);
    });
    return function() { mounted = false; };
  }, []);

  /* ── Load posts by tab ── */
  var loadPosts = useCallback(async function(type, reset) {
    if (reset) {
      setLoading(true);
      setPosts([]);
      setLastDoc(null);
    }
    try {
      var typeFilter = type === 'all' ? null : type;
      var result = await getPosts(typeFilter, 12);
      setPosts(result.posts);
      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === 12);
    } catch (e) {
      console.error('Posts load error:', e);
    }
    setLoading(false);
  }, []);

  useEffect(function() {
    loadPosts(activeTab, true);
  }, [activeTab, loadPosts]);

  var loadMore = async function() {
    if (!hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    var typeFilter = activeTab === 'all' ? null : activeTab;
    try {
      var result = await getPosts(typeFilter, 12, lastDoc);
      setPosts(function(p) { return p.concat(result.posts); });
      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === 12);
    } catch (e) {
      console.error(e);
    }
    setLoadingMore(false);
  };

  /* ── JSON-LD Schemas ── */
  var jsonLdWebPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'BSDC — Bangladesh Software Development Community',
    description: 'বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি — Q&A, Wiki, Blog, Code Snippets, Projects',
    url: 'https://www.bsdc.info.bd',
    inLanguage: ['en', 'bn'],
    isPartOf: { '@type': 'WebSite', name: 'Bangladesh Software Development Community', url: 'https://www.bsdc.info.bd' },
    primaryImageOfPage: { '@type': 'ImageObject', url: 'https://www.bsdc.info.bd/og-image.png' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bsdc.info.bd/' }
      ],
    },
  };

  var jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'OnlineCommunity',
    name: 'Bangladesh Software Development Community',
    alternateName: 'BSDC',
    url: 'https://www.bsdc.info.bd',
    logo: 'https://www.bsdc.info.bd/favicon.ico',
    foundingDate: '2026',
    founder: { '@type': 'Person', name: 'Rizwan Rahim Chowdhury', url: 'https://www.bsdc.info.bd/about' },
    areaServed: { '@type': 'Country', name: 'Bangladesh' },
    knowsAbout: ['Software Development', 'Web Development', 'Mobile Development', 'AI/ML', 'DevOps', 'Programming', 'JavaScript', 'Python', 'React', 'Laravel'],
    interactionStatistic: [
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/WriteAction', userInteractionCount: stats.posts },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/JoinAction',  userInteractionCount: stats.members },
    ],
  };

  var jsonLdFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is BSDC?',
        acceptedAnswer: { '@type': 'Answer', text: 'BSDC (Bangladesh Software Development Community) is the premier online platform for Bangladeshi software developers to share knowledge, ask questions, write blogs, share code snippets, and collaborate on projects in both Bangla and English.' },
      },
      {
        '@type': 'Question',
        name: 'BSDC কী?',
        acceptedAnswer: { '@type': 'Answer', text: 'BSDC হলো বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি যেখানে ডেভেলপাররা প্রশ্ন করতে, জ্ঞান শেয়ার করতে এবং একসাথে শিখতে পারেন। এটি বাংলা এবং English উভয় ভাষায় কাজ করে।' },
      },
      {
        '@type': 'Question',
        name: 'How do I join BSDC?',
        acceptedAnswer: { '@type': 'Answer', text: 'You can join BSDC for free by registering with your email, Google, GitHub, Yahoo, or Apple account at bsdc.info.bd/register. The platform is 100% free forever.' },
      },
      {
        '@type': 'Question',
        name: 'Is BSDC free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! BSDC is completely free for all Bangladeshi developers. There are no hidden costs, premium tiers, or paywalls. We believe knowledge should be accessible to everyone.' },
      },
      {
        '@type': 'Question',
        name: 'Can I post in Bangla on BSDC?',
        acceptedAnswer: { '@type': 'Answer', text: 'Absolutely! BSDC fully supports বাংলা content. You can ask questions, write blogs, and create wiki articles in Bangla, English, or both. Bilingual content actually ranks better in search engines.' },
      },
      {
        '@type': 'Question',
        name: 'Who founded BSDC?',
        acceptedAnswer: { '@type': 'Answer', text: 'BSDC was founded by Rizwan Rahim Chowdhury in 2026 with the mission to create a world-class software development community rooted in Bangladesh.' },
      },
      {
        '@type': 'Question',
        name: 'What can I share on BSDC?',
        acceptedAnswer: { '@type': 'Answer', text: 'You can share Q&A questions, technical blog posts, wiki articles, code snippets with syntax highlighting, and showcase your projects. All content types support both Bangla and English.' },
      },
      {
        '@type': 'Question',
        name: 'How does the reputation system work?',
        acceptedAnswer: { '@type': 'Answer', text: 'You earn reputation points when you create posts, get upvotes, and have your answers marked as solved. Higher reputation unlocks badges like Newcomer, Regular, Pro, Expert, and Legend.' },
      },
    ],
  };

  return (
    <>
      <Helmet>
        {/* PRIMARY SEO */}
        <title>BSDC — Bangladesh Software Development Community | বাংলাদেশের #1 ডেভেলপার কমিউনিটি ২০২৬</title>
        <meta name="description" content="BSDC — বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি। Q&A, Wiki, Blog, Code Snippets, Projects শেয়ার করুন। 100% Free. Join Bangladesh's premier developer community for JavaScript, Python, React, Laravel, AI/ML, DevOps and more — in Bangla and English." />
        <meta name="keywords" content="Bangladesh software development community, BSDC, বাংলাদেশ ডেভেলপার কমিউনিটি, Bangladeshi developers, programming forum Bangladesh, software engineer Bangladesh, web development BD, JavaScript Bangla, Python tutorial Bangla, React Bangladesh, Laravel Bangladesh, coding community Bangladesh, freelancing Bangladesh, tech community Dhaka, programming questions Bangla, developer Q&A BD, code snippets Bangladesh, open source Bangladesh, AI ML Bangladesh, mobile app development BD, Android Bangladesh, Flutter Bangladesh, DevOps Bangladesh, cloud Bangladesh, backend Bangladesh, frontend Bangladesh, full stack Bangladesh, সফটওয়্যার ডেভেলপমেন্ট, প্রোগ্রামিং বাংলাদেশ, কোডিং কমিউনিটি, ওয়েব ডেভেলপমেন্ট" />
        <meta name="author" content="Rizwan Rahim Chowdhury" />
        <link rel="canonical" href="https://www.bsdc.info.bd/" />

        {/* OPEN GRAPH */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BSDC — Bangladesh Software Development Community" />
        <meta property="og:description" content="বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি। Join thousands of Bangladeshi developers." />
        <meta property="og:url" content="https://www.bsdc.info.bd/" />
        <meta property="og:image" content="https://www.bsdc.info.bd/og-image.png" />
        <meta property="og:site_name" content="Bangladesh Software Development Community" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="bn_BD" />

        {/* TWITTER */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BSDC — Bangladesh Software Development Community" />
        <meta name="twitter:description" content="বাংলাদেশের #1 ডেভেলপার কমিউনিটি। Q&A, Blog, Code, Projects." />
        <meta name="twitter:image" content="https://www.bsdc.info.bd/og-image.png" />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLdWebPage)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLdOrg)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLdFAQ)}</script>
      </Helmet>

      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1E293B 50%, #006A4E 100%)',
        color: 'var(--white)',
        padding: '64px 16px 56px',
        position: 'relative',
        overflow: 'hidden',
      }} aria-label="BSDC Hero">

        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236EE7B7\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,106,78,0.25)',
              border: '1px solid rgba(110,231,183,0.4)',
              color: '#6EE7B7',
              padding: '6px 16px',
              borderRadius: 100,
              fontSize: '0.85rem',
              fontWeight: 700,
              backdropFilter: 'blur(8px)',
            }}>
              <I.Code /> Bangladesh's #1 Developer Community · ২০২৬
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(1.7rem, 5vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            textAlign: 'center',
            marginBottom: 18,
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #6EE7B7, #34D399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              বাংলাদেশের সেরা
            </span>
            <br />
            Software Development Community
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            color: '#CBD5E1',
            textAlign: 'center',
            maxWidth: 720,
            margin: '0 auto 32px',
            lineHeight: 1.7,
          }}>
            BSDC-তে আপনাকে স্বাগতম! হাজারো Bangladeshi developers এর সাথে যোগ দিন। Ask questions, share knowledge, write blogs — সব এক জায়গায়। Join Bangladesh's premier platform for software engineers, web developers, and tech enthusiasts.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: 48,
          }}>
            {user ? (
              <Link to="/create" className="btn btn-primary btn-lg" style={{ minWidth: 200 }}>
                <I.Zap /> Create Post
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg" style={{ minWidth: 200 }}>
                Join BSDC Free →
              </Link>
            )}
            <Link to="/post" className="btn btn-outline btn-lg" style={{
              borderColor: '#6EE7B7', color: '#6EE7B7', minWidth: 200,
            }}>
              Browse Q&A
            </Link>
          </div>

          {/* Live Stats */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            flexWrap: 'wrap', maxWidth: 900, margin: '0 auto',
          }}>
            <StatCard
              icon={<I.Users />}
              value={statsLoading ? '...' : fmtNum(stats.members)}
              label="Developers"
              sub="and growing"
            />
            <StatCard
              icon={<I.Post />}
              value={statsLoading ? '...' : fmtNum(stats.posts)}
              label="Total Posts"
              sub="all content"
            />
            <StatCard
              icon={<I.Check />}
              value={statsLoading ? '...' : fmtNum(stats.solved)}
              label="Solved Q&A"
              sub="problems fixed"
            />
            <StatCard
              icon={<I.Globe />}
              value="100%"
              label="Free Forever"
              sub="no premium"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TOP CONTRIBUTORS — শিক্ষক বাতায়ন STYLE
      ═══════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(180deg, #f0faf6 0%, var(--white) 100%)',
        padding: '48px 16px',
        borderBottom: '1px solid var(--gray-2)',
      }} aria-label="Top BSDC Contributors">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            textAlign: 'center', marginBottom: 32,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--green-bg)', color: 'var(--green)',
              padding: '4px 14px', borderRadius: 100,
              fontSize: '0.78rem', fontWeight: 700, marginBottom: 12,
            }}>
              <I.Trophy /> TOP CONTRIBUTORS
            </span>
            <h2 style={{
              fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
              fontWeight: 900,
              color: 'var(--dark)',
              marginBottom: 8,
            }}>
              সেরা কনটেন্ট নির্মাতা — Top Developers of BSDC
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 600, margin: '0 auto' }}>
              বাংলাদেশের সেরা ডেভেলপার যারা BSDC কমিউনিটিতে সবচেয়ে বেশি অবদান রেখেছেন।
              The most active and helpful contributors who power Bangladesh's developer community.
            </p>
          </div>

          {contribLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {[1, 2, 3, 4].map(function(i) {
                return (
                  <div key={i} className="skeleton" style={{ height: 92, borderRadius: 'var(--radius)' }} />
                );
              })}
            </div>
          ) : contributors.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {contributors.map(function(u, idx) {
                return <ContributorCard key={u.id} user={u} rank={idx + 1} />;
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: 40, color: 'var(--text-muted)',
            }}>
              <p>Be the first top contributor!</p>
              {!user && (
                <Link to="/register" className="btn btn-primary" style={{ marginTop: 16 }}>
                  Join BSDC
                </Link>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/contributors" className="btn btn-outline">
              View All Top Contributors <I.Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT GRID
      ═══════════════════════════════════════════ */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '32px 16px',
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: 24,
      }} className="bsdc-main-grid">

        {/* LEFT COLUMN */}
        <main role="main">

          {/* ─── 4000-WORD SEO CONTENT BLOCK ─── */}
          <article style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--gray-2)',
            padding: 'clamp(20px, 4vw, 36px)',
            marginBottom: 28,
          }} itemScope itemType="https://schema.org/Article">

            <header style={{ marginBottom: 20 }}>
              <span style={{
                display: 'inline-block',
                background: 'var(--green-bg)', color: 'var(--green)',
                padding: '4px 12px', borderRadius: 100,
                fontSize: '0.75rem', fontWeight: 700, marginBottom: 12,
              }}>
                ABOUT BSDC
              </span>
              <h2 style={{
                fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
                fontWeight: 900,
                color: 'var(--dark)',
                lineHeight: 1.3,
              }} itemProp="headline">
                বাংলাদেশের সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি — BSDC: Where Bangladesh Codes Together
              </h2>
            </header>

            <div className="article-content" itemProp="articleBody" style={{ fontSize: '0.95rem', lineHeight: 1.85 }}>

              {/* === BANGLA SECTION 1 (~500 words) === */}
              <h3 style={{ fontSize: '1.15rem', color: 'var(--green)', marginTop: 24, marginBottom: 12 }}>
                🇧🇩 BSDC — বাংলাদেশের ডেভেলপারদের নিজস্ব ঘর
              </h3>

              <p>
                <strong>BSDC (Bangladesh Software Development Community)</strong> হলো বাংলাদেশের সবচেয়ে বড় এবং সক্রিয় সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি প্ল্যাটফর্ম। আমরা বিশ্বাস করি যে <strong>জ্ঞান ভাগ করে নেওয়া</strong> একটি দেশের প্রযুক্তি খাতকে এগিয়ে নিয়ে যায়। বাংলাদেশের প্রতিটি প্রান্তে — ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী, খুলনা, বরিশাল, রংপুর থেকে শুরু করে ময়মনসিংহ পর্যন্ত — হাজারো ট্যালেন্টেড ডেভেলপার আছেন যাদের <strong>একটি কমন প্ল্যাটফর্ম</strong> দরকার ছিল। সেই অভাব পূরণ করতেই BSDC-এর জন্ম।
              </p>

              <p>
                BSDC-তে আপনি যেকোনো <strong>প্রোগ্রামিং প্রশ্ন</strong> করতে পারবেন বাংলায় বা ইংরেজিতে, <strong>কোড স্নিপেট শেয়ার</strong> করতে পারবেন syntax highlighting সহ, <strong>টেকনিক্যাল ব্লগ</strong> লিখতে পারবেন আপনার অভিজ্ঞতা থেকে, <strong>উইকি আর্টিকেল</strong> তৈরি করতে পারবেন কমিউনিটির জন্য, এবং আপনার <strong>প্রজেক্ট showcase</strong> করতে পারবেন বিশ্বের সামনে।
              </p>

              <p>
                BSDC শুধু একটি ওয়েবসাইট নয় — এটি একটি <strong>আন্দোলন</strong>। বাংলাদেশের ডেভেলপাররা যেন আর Stack Overflow-এ বাংলায় প্রশ্ন করতে গিয়ে closed না হয়, যেন আর Reddit-এ "Where are you from?" শুনতে না হয়, যেন আর Discord-এ ভাষাগত সমস্যায় না পড়েন — সেজন্যই BSDC।
              </p>

              <p>
                আমাদের <strong>Q&amp;A সেকশন</strong>-এ Stack Overflow-এর মতো সিস্টেম আছে — Solved/Unsolved tracking, Upvotes, Accepted Answer, Tag-based organization সব কিছু। কিন্তু পার্থক্য হলো, এখানে আপনি বাংলায় প্রশ্ন করলে কেউ আপনাকে ছোট করবে না। বরং বাংলাদেশের সিনিয়র ডেভেলপাররা আপনাকে আপনার ভাষায় সাহায্য করবেন।
              </p>

              <p>
                <strong>Wiki সেকশনে</strong> পাবেন বাংলা ও English-এ সফটওয়্যার ডেভেলপমেন্টের comprehensive documentation। JavaScript থেকে Python, React থেকে Laravel, MySQL থেকে MongoDB, Android থেকে Flutter — সব topics-এর জন্য step-by-step tutorial. কমিউনিটি দ্বারা লিখিত, কমিউনিটি দ্বারা maintained.
              </p>

              <p>
                <strong>Blog সেকশনে</strong> বাংলাদেশের সিনিয়র ডেভেলপাররা শেয়ার করেন তাদের অভিজ্ঞতা — Freelancing journey, Remote work tips, Career growth strategies, Tech industry insights, Startup stories. প্রতিটি ব্লগ পোস্ট SEO-অপ্টিমাইজড, যাতে Google search-এ ranking পায়।
              </p>

              <p>
                <strong>Code Snippets সেকশনে</strong> পাবেন ready-to-use code examples 25+ programming languages-এ। Syntax highlighting সহ, copy button সহ, language selector সহ — সব কিছু production-ready।
              </p>

              <p>
                <strong>Projects সেকশনে</strong> বাংলাদেশের ডেভেলপাররা showcase করেন তাদের কাজ — startups, side projects, open-source contributions, freelance work. এটি শুধু portfolio নয়, এটি inspiration-এর source.
              </p>

              {/* === ENGLISH SECTION 1 (~700 words) === */}
              <h3 style={{ fontSize: '1.15rem', color: 'var(--green)', marginTop: 32, marginBottom: 12 }}>
                🌏 BSDC — Bangladesh's Premier Developer Knowledge Hub
              </h3>

              <p>
                Bangladesh has emerged as one of the fastest-growing technology hubs in South Asia. With over <strong>650,000+ active software developers</strong> working both locally and internationally, the country produces world-class talent year after year. From the bustling tech parks of Dhaka and the IT zones of Chittagong, to remote freelancers in Rangpur and Sylhet, Bangladeshi developers are building products used by millions across the globe.
              </p>

              <p>
                Yet despite this incredible talent pool, <strong>Bangladesh has lacked a dedicated, native-language developer community platform</strong> for far too long. International platforms like Stack Overflow, GitHub Discussions, and Dev.to are excellent resources, but they don't address the unique challenges Bangladeshi developers face: language barriers when explaining complex technical problems, cultural context that gets lost in translation, time zone mismatches with Western communities, and the lack of region-specific job opportunities and freelancing tips.
              </p>

              <p>
                <strong>BSDC (Bangladesh Software Development Community)</strong> was built to fill this gap. Founded in 2026 by <strong>Rizwan Rahim Chowdhury</strong>, BSDC is a 100% free, open community platform designed specifically for Bangladeshi developers — whether you're a CSE student in BUET, a junior developer in your first job at Pathao or bKash, a senior engineer at Brain Station 23 or Tiger IT, a freelancer working with international clients, or a Bangladeshi developer abroad in Silicon Valley, London, Singapore, or Dubai.
              </p>

              <p>
                Our mission is simple but ambitious: <strong>to create a world-class software development community rooted in Bangladesh</strong>. We want every Bangladeshi developer, regardless of their background, education, or location, to have free access to the highest quality technical knowledge — in their native language.
              </p>

              <p>
                <strong>Why does this matter?</strong> Because language is more than just communication — it's how we think. When a developer can ask a complex question in Bangla and receive a detailed answer in Bangla from a senior engineer who understands their cultural context, the learning happens 10x faster. When tutorials are written by Bangladeshi developers for Bangladeshi developers, examples become more relevant — using bKash payment integration instead of Stripe, deploying to local hosting providers, handling Bangladeshi date formats and Bengali Unicode properly.
              </p>

              <p>
                BSDC offers six powerful content types, each optimized for different learning needs:
              </p>

              <p>
                <strong>1. Q&amp;A Forum:</strong> A Stack Overflow-style question and answer system with upvotes, accepted answers, solved-state tracking, and tag organization. Ask any programming question in Bangla, English, or both. Get answers from Bangladesh's most experienced developers, who understand not just the technical problem but also your context.
              </p>

              <p>
                <strong>2. Technical Wiki:</strong> Community-maintained documentation covering every major technology used by Bangladeshi developers — JavaScript, TypeScript, Python, PHP, Java, Kotlin, Swift, React, Vue, Angular, Next.js, Laravel, Django, Spring Boot, Node.js, Express, FastAPI, MySQL, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, Google Cloud, Azure, DigitalOcean, Vercel, Netlify, Cloudflare, and many more.
              </p>

              <p>
                <strong>3. Developer Blog:</strong> A platform for Bangladeshi developers to share their stories, tutorials, and insights. From "How I landed my first remote job at $5000/month" to "Building a SaaS product from Dhaka" to "Deep dive into React Server Components" — the BSDC blog covers it all. Every blog post is SEO-optimized to rank on Google for both English and Bangla search queries.
              </p>

              <p>
                <strong>4. Code Snippets:</strong> A library of reusable, well-commented code examples in 25+ programming languages. Each snippet includes syntax highlighting (powered by Prism.js), one-click copy, language indicator, and detailed descriptions. Perfect for those moments when you need a working example fast.
              </p>

              <p>
                <strong>5. Project Showcase:</strong> Show Bangladesh — and the world — what you've built. Whether it's a hackathon project, a freelance gig, an open-source library, or your startup's MVP, the projects section gives Bangladeshi developers a place to gain visibility, get feedback, and inspire others.
              </p>

              <p>
                <strong>6. Discussion Forum:</strong> For broader conversations about the developer life — career advice, industry trends, salary discussions, remote work tips, freelancing strategies, mental health, work-life balance, and the unique experience of being a Bangladeshi developer in a globalized industry.
              </p>

              {/* === BANGLA SECTION 2 (~500 words) === */}
              <h3 style={{ fontSize: '1.15rem', color: 'var(--green)', marginTop: 32, marginBottom: 12 }}>
                💎 BSDC কেন বেছে নেবেন? — Why Choose BSDC
              </h3>

              <p>
                <strong>১. সম্পূর্ণ বিনামূল্যে:</strong> BSDC ১০০% ফ্রি এবং সবসময়ই ফ্রি থাকবে। কোনো premium subscription নেই, কোনো paywall নেই, কোনো hidden cost নেই। আমরা বিশ্বাস করি জ্ঞান সবার জন্য — সেটা ধনী বা গরিব, ঢাকার ছাত্র বা গ্রামের ফ্রিল্যান্সার, যেকেউই হোক।
              </p>

              <p>
                <strong>২. বাংলা ও English উভয় ভাষায়:</strong> আমরাই একমাত্র developer community যেখানে আপনি স্বাচ্ছন্দ্যে বাংলায় প্রশ্ন করতে পারবেন এবং উত্তরও বাংলায় পাবেন। কেউ আপনাকে "speak English" বলবে না।
              </p>

              <p>
                <strong>৩. বাংলাদেশী context:</strong> এখানের সব tutorial, code example, এবং discussion বাংলাদেশের context-এ লেখা। bKash integration, Pathao API, NID verification, Bengali date handling, Local hosting tips — সব কিছু relevant।
              </p>

              <p>
                <strong>৪. Modern, Fast, Mobile-friendly:</strong> BSDC built using React, Vite, Firebase, এবং Cloudflare CDN দিয়ে। ফলে যেকোনো device থেকে — স্মার্টফোন, ট্যাবলেট, ডেস্কটপ — সবখানে lightning fast load হয়।
              </p>

              <p>
                <strong>৫. SEO-অপ্টিমাইজড:</strong> আপনি যা লিখবেন তা Google-এ ranking পাবে। আমাদের প্রতিটি page-এ proper JSON-LD schema, meta tags, semantic HTML, sitemap, robots.txt এবং llms.txt আছে — যাতে Search Engine এবং AI assistants উভয়েই আপনার content সঠিকভাবে index করতে পারে।
              </p>

              <p>
                <strong>৬. Reputation system এবং gamification:</strong> প্রতিটি contribution-এর জন্য আপনি reputation points পাবেন। Newcomer থেকে শুরু করে Legend পর্যন্ত — অনেক badge আছে অর্জনের জন্য। আপনার Profile-এ থাকবে নিজস্ব Developer ID Card with QR Code, যা physical card-এর মতোই দেখতে।
              </p>

              <p>
                <strong>৭. Push Notifications:</strong> OneSignal-powered notifications দিয়ে আপনি real-time জানতে পারবেন আপনার প্রশ্নের উত্তর, comment, mention, এবং নতুন posts।
              </p>

              <p>
                <strong>৮. Privacy ও Security:</strong> আপনার data সুরক্ষিত। Firebase Authentication ব্যবহার করি যা Google-এর enterprise-grade security দিয়ে protected। কোনো password আমরা store করি না — সব OAuth-based।
              </p>

              <p>
                <strong>৯. Open Community Guidelines:</strong> আমরা spam-free, respectful, constructive কমিউনিটি বানাচ্ছি। কোনো harassment নেই, কোনো racism নেই, কোনো sexism নেই। সবাই সবাইকে সম্মান করি।
              </p>

              <p>
                <strong>১০. Founder যোগাযোগে আছেন:</strong> আমাদের Founder Rizwan Rahim Chowdhury স্বয়ং কমিউনিটিতে active. আপনার যেকোনো feedback, suggestion, বা concern সরাসরি তাঁর কাছে পৌঁছাবে।
              </p>

              {/* === ENGLISH SECTION 2 (~800 words) === */}
              <h3 style={{ fontSize: '1.15rem', color: 'var(--green)', marginTop: 32, marginBottom: 12 }}>
                🚀 The Bangladeshi Developer Ecosystem — Why BSDC Matters Now
              </h3>

              <p>
                Bangladesh's IT sector has experienced explosive growth in the past decade. According to industry reports, the country's software exports crossed $1.4 billion in 2025, with a projected growth to $5 billion by 2030. The Bangladesh government's "Smart Bangladesh 2041" vision places software development at the center of the country's economic transformation. With initiatives like Hi-Tech Parks across the country, dedicated freelancing zones, and government incentives for IT companies, the timing has never been better for a thriving developer community.
              </p>

              <p>
                But growth brings challenges. As more students enroll in CSE programs across Bangladesh's 50+ universities offering computer science degrees — from BUET, BUET, DUET, RUET, KUET, CUET, IUT, NSU, BRAC, AIUB, EWU, UIU, IUB, AUST, MIST, and many private institutions — the demand for high-quality, accessible learning resources has skyrocketed. Traditional university curricula, while strong in fundamentals, often lag behind the rapidly evolving industry. Bangladeshi developers need a place where they can stay current with the latest frameworks, tools, and best practices.
              </p>

              <p>
                <strong>Freelancing has become a major career path</strong> for Bangladeshi developers. Bangladesh ranks #2 globally on platforms like Upwork and Freelancer.com in terms of total active freelancers. Tens of thousands of developers earn their primary income through international clients, and the freelancing community needs dedicated resources: how to negotiate rates, handle international payments, deal with payment gateways, manage time zones with US/EU clients, build a strong portfolio, and grow from $5/hour to $50/hour and beyond.
              </p>

              <p>
                <strong>The startup ecosystem</strong> in Bangladesh has also matured significantly. Companies like Pathao, bKash, ShareTrip, Chaldal, Foodpanda Bangladesh, Sheba.xyz, Daraz, 10 Minute School, ShopUp, iFarmer, Praava Health, and dozens more are building world-class products powered by Bangladeshi engineering teams. These companies hire continuously, but the talent pipeline needs strengthening. BSDC serves as both a learning platform for aspiring developers and a recruiting ground for these companies (we plan to add a jobs section in 2026).
              </p>

              <p>
                <strong>Open source contribution</strong> from Bangladesh has been growing steadily. GitHub data shows Bangladeshi developers among the top 30 countries by open-source activity. Projects like SUST CSE Society's open-source initiatives, the Bengali language localization efforts for various tools, and individual contributions to major projects like Linux Kernel, React, Vue, and others are putting Bangladesh on the global open-source map. BSDC encourages and showcases these contributions through dedicated project posts.
              </p>

              <p>
                <strong>Mobile development</strong> is another huge area for Bangladeshi developers. With smartphone penetration crossing 70% and mobile internet users exceeding 110 million, the demand for Android, iOS, and cross-platform mobile apps is enormous. From e-commerce apps to ride-sharing, food delivery to digital banking, education to healthcare — mobile is where Bangladesh is innovating the fastest. BSDC has dedicated tags for Android, Kotlin, Swift, Flutter, React Native, and Ionic, with active discussions and tutorials.
              </p>

              <p>
                <strong>AI and Machine Learning</strong> represent the next frontier. Bangladeshi researchers and engineers are increasingly contributing to cutting-edge AI work. From NLP for Bengali language to computer vision for agricultural applications, from healthcare AI for rural Bangladesh to fintech AI for financial inclusion, BSDC's AI/ML community is growing rapidly. We host discussions on TensorFlow, PyTorch, Hugging Face, OpenAI APIs, RAG systems, vector databases, and prompt engineering.
              </p>

              <p>
                <strong>DevOps and cloud</strong> skills are in high demand. As Bangladeshi companies modernize their infrastructure and freelancers take on enterprise clients, knowledge of AWS, Google Cloud, Azure, Docker, Kubernetes, CI/CD pipelines, infrastructure as code (Terraform, Ansible), monitoring (Prometheus, Grafana), and security best practices becomes critical. BSDC's DevOps section is curated by senior engineers actively working in cloud-native environments.
              </p>

              <p>
                <strong>Web3, blockchain, and emerging technologies</strong> also have a growing community in Bangladesh, despite regulatory uncertainties. From smart contract development to NFT marketplaces, from DeFi protocols to crypto trading bots, BSDC welcomes discussions on these frontier technologies while maintaining a focus on educational content and ethical practices.
              </p>

              <p>
                Beyond technical content, BSDC also focuses on the <strong>human side of being a developer</strong>. Mental health in tech, work-life balance, dealing with imposter syndrome, navigating workplace politics, salary negotiation, communicating with non-technical stakeholders, leadership skills for tech leads — these soft skills are equally important and often overlooked. Our blog and discussion sections cover these topics extensively.
              </p>

              <p>
                <strong>For Bangladeshi developers abroad</strong>, BSDC serves as a connection point to home. Whether you're working at FAANG in Silicon Valley, a fintech in London, a startup in Berlin, or a major tech company in Dubai or Singapore, BSDC keeps you connected with the Bangladesh tech ecosystem, helps you mentor junior developers back home, and provides a platform to share your global experience with the next generation of Bangladeshi engineers.
              </p>

              {/* === FINAL CTA === */}
              <div style={{
                background: 'linear-gradient(135deg, var(--green-bg), #ecfdf5)',
                borderRadius: 'var(--radius)',
                padding: 24, marginTop: 28,
                border: '1px solid var(--green)',
                textAlign: 'center',
              }}>
                <h3 style={{ color: 'var(--green-dark)', marginBottom: 8, fontSize: '1.1rem' }}>
                  Ready to join Bangladesh's #1 developer community?
                </h3>
                <p style={{ color: 'var(--text)', marginBottom: 16, fontSize: '0.9rem' }}>
                  ১০০% ফ্রি · বাংলা + English · {fmtNum(stats.members)}+ developers · Founded in Bangladesh
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {!user ? (
                    <Link to="/register" className="btn btn-primary">Join BSDC Free →</Link>
                  ) : (
                    <Link to="/create" className="btn btn-primary">Create Your First Post</Link>
                  )}
                  <Link to="/about" className="btn btn-outline">Learn About BSDC</Link>
                </div>
              </div>
            </div>
          </article>

          {/* ─── TABS + POSTS ─── */}
          <section aria-label="Latest BSDC Posts">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)' }}>
                Latest Posts
              </h2>
              <Link to="/post" style={{ fontSize: '0.85rem', color: 'var(--green)', fontWeight: 600 }}>
                See all <I.Arrow />
              </Link>
            </div>

            <div className="tabs" role="tablist">
              {TABS.map(function(tab) {
                return (
                  <button
                    key={tab.key}
                    className={'tab-btn ' + (activeTab === tab.key ? 'active' : '')}
                    onClick={function() { setActiveTab(tab.key); }}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <SkeletonList count={6} />
            ) : posts.length === 0 ? (
              <div style={{
                background: 'var(--white)', border: '1px solid var(--gray-2)',
                borderRadius: 'var(--radius)', padding: 48, textAlign: 'center',
              }}>
                <h3 style={{ color: 'var(--dark)', marginBottom: 8 }}>No posts yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                  Be the first to post in this category!
                </p>
                <Link to={user ? '/create' : '/register'} className="btn btn-primary">
                  {user ? 'Create First Post' : 'Join to Post'}
                </Link>
              </div>
            ) : (
              <>
                {posts.map(function(p) {
                  return <PostCard key={p.id} post={p} />;
                })}
                {hasMore && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <button
                      className="btn btn-outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? 'Loading…' : 'Load More Posts'}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside role="complementary" aria-label="BSDC Sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {!user && (
            <div style={{
              background: 'linear-gradient(135deg, var(--dark), #0f172a)',
              borderRadius: 'var(--radius)', padding: 24, color: 'var(--white)',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 8 }}>
                Join BSDC Today
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: 16 }}>
                বাংলাদেশের সেরা ডেভেলপার কমিউনিটির অংশ হন। Free forever.
              </p>
              <Link to="/register" className="btn btn-primary btn-block">Register Free</Link>
              <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.78rem', color: '#64748B' }}>
                Member? <Link to="/login" style={{ color: '#6EE7B7' }}>Sign in</Link>
              </div>
            </div>
          )}

          {/* Trending Posts */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <I.Fire /> Trending This Week
            </div>
            <div className="sidebar-widget-body" style={{ padding: '4px 16px' }}>
              {trending.length > 0 ? trending.map(function(p, i) {
                return <TrendingPostItem key={p.id} post={p} index={i} />;
              }) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '12px 0' }}>
                  No trending posts yet.
                </p>
              )}
            </div>
          </div>

          {/* Content stats by type */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <I.Post /> Content by Type
            </div>
            <div className="sidebar-widget-body">
              {[
                { label: 'Q&A',      count: stats.qa,       color: '#7C3AED', link: '/post?type=qa' },
                { label: 'Blog Posts', count: stats.blogs,  color: '#1E40AF', link: '/post?type=blog' },
                { label: 'Wiki',     count: stats.wikis,    color: '#92400E', link: '/post?type=wiki' },
                { label: 'Code Snippets', count: stats.snippets, color: '#065F46', link: '/post?type=snippet' },
                { label: 'Projects', count: stats.projects, color: '#9F1239', link: '/post?type=project' },
              ].map(function(item) {
                return (
                  <Link key={item.label} to={item.link} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', fontSize: '0.88rem', color: 'var(--dark)',
                    borderBottom: '1px solid var(--gray-2)',
                  }}>
                    <span>{item.label}</span>
                    <span style={{
                      background: item.color + '15', color: item.color,
                      padding: '1px 8px', borderRadius: 100,
                      fontWeight: 700, fontSize: '0.75rem',
                    }}>
                      {fmtNum(item.count)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <I.Star /> Popular Tags
            </div>
            <div className="sidebar-widget-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {POPULAR_TAGS.map(function(tag) {
                  return (
                    <Link key={tag} to={'/post?tag=' + encodeURIComponent(tag)} className="sidebar-tag">
                      #{tag}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <I.Shield /> About BSDC
            </div>
            <div className="sidebar-widget-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
                Founded by <strong style={{ color: 'var(--dark)' }}>Rizwan Rahim Chowdhury</strong> in 2026.
                Bangladesh's premier developer community.
              </p>
              <Link to="/about" className="btn btn-outline btn-sm btn-block">
                Learn More →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════
          RESPONSIVE STYLES
      ═══════════════════════════════════════════ */}
      <style>{`
        @media (max-width: 900px) {
          .bsdc-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .tabs {
            overflow-x: auto;
            scrollbar-width: none;
          }
          .tabs::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
