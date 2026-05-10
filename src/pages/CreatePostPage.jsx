import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../AuthContext';
import { db, uploadToImgBB } from '../firebase';
import {
  collection, addDoc, doc,
  updateDoc, increment, serverTimestamp,
  getDoc, setDoc
} from 'firebase/firestore';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const POST_TYPES = [
  {
    key: 'qa',
    label: 'Q&A',
    desc: 'Ask a question',
    longDesc: 'Get answers from Bangladesh\'s best developers',
    color: '#7C3AED',
    bg: '#EDE9FE',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'blog',
    label: 'Blog',
    desc: 'Write an article',
    longDesc: 'Share your knowledge with the community',
    color: '#1E40AF',
    bg: '#DBEAFE',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'wiki',
    label: 'Wiki',
    desc: 'Document a topic',
    longDesc: 'Build the Bangladesh dev knowledge base',
    color: '#92400E',
    bg: '#FEF3C7',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    key: 'snippet',
    label: 'Code Snippet',
    desc: 'Share reusable code',
    longDesc: 'Help others with working code examples',
    color: '#065F46',
    bg: '#D1FAE5',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    key: 'project',
    label: 'Project',
    desc: 'Showcase your work',
    longDesc: 'Show Bangladesh what you have built',
    color: '#9F1239',
    bg: '#FFE4E6',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    key: 'post',
    label: 'Discussion',
    desc: 'Start a discussion',
    longDesc: 'Share thoughts, news, or anything dev-related',
    color: '#475569',
    bg: '#F1F5F9',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

const LANGUAGES = [
  'javascript','typescript','python','php','java',
  'css','html','bash','sql','dart','c','cpp',
  'rust','go','kotlin','swift','ruby','scala',
];

const POPULAR_TAGS = [
  'javascript','python','react','laravel','django',
  'nodejs','php','java','flutter','android',
  'mysql','mongodb','devops','docker','aws',
  'ai','machine-learning','freelancing','career','beginners',
];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function generateSlug(title) {
  const base   = slugify(title);
  const suffix = Date.now().toString(36);
  return base ? `${base}-${suffix}` : `post-${suffix}`;
}

/* reading time */
function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/* keyword density checker */
function getKeywordScore(title, body, tags) {
  let score = 0;
  if (title.length >= 30) score += 20;
  if (title.length >= 50) score += 10;
  if (body.length >= 300)  score += 20;
  if (body.length >= 800)  score += 20;
  if (tags.length >= 3)    score += 15;
  if (tags.length >= 5)    score += 10;
  const hasQuestion = /\?|how|what|why|when|where|কিভাবে|কী|কেন/i.test(title);
  if (hasQuestion && body.length > 100) score += 5;
  return Math.min(100, score);
}

/* ─────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────── */
const Icons = {
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Tag: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  SEO: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────
   SEO SCORE METER
───────────────────────────────────────── */
function SEOScoreMeter({ score, title, body, tags }) {
  const checks = [
    { pass: title.length >= 30,  label: 'Title is descriptive (30+ chars)' },
    { pass: title.length >= 50,  label: 'Title is rich (50+ chars)' },
    { pass: body.length  >= 300, label: 'Content is detailed (300+ chars)' },
    { pass: body.length  >= 800, label: 'Content is comprehensive (800+ chars)' },
    { pass: tags.length  >= 3,   label: 'Enough tags (3+)' },
    { pass: tags.length  >= 5,   label: 'Rich tags (5+)' },
    {
      pass: /\u0980-\u09FF/.test(body) || /\u0980-\u09FF/.test(title),
      label: 'Bilingual content (EN + বাংলা) — boosts local SEO'
    },
  ];

  const color = score >= 80 ? '#059669'
    : score >= 50 ? '#D97706'
    : '#DC2626';

  return (
    <div style={{
      background: 'var(--white)',
      border: `1px solid ${color}30`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        background: `${color}10`,
        borderBottom: `1px solid ${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.85rem', color }}>
          <Icons.SEO /> SEO Score
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.1rem', color }}>{score}/100</div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        {/* Progress bar */}
        <div style={{ height: 6, background: 'var(--gray-2)', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${score}%`,
            background: `linear-gradient(90deg, ${color}, ${color}90)`,
            borderRadius: 3, transition: 'width 0.5s ease',
          }} />
        </div>
        {/* Checks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {checks.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem' }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: c.pass ? '#D1FAE5' : 'var(--gray-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {c.pass
                  ? <Icons.Check />
                  : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gray-3)' }} />
                }
              </div>
              <span style={{ color: c.pass ? 'var(--text)' : 'var(--text-muted)' }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   WRITING TIPS
───────────────────────────────────────── */
const TIPS = {
  qa: [
    'Start with "How to…", "What is…", or "Why does…"',
    'Describe what you tried first',
    'Include error messages exactly',
    'Add your code snippet in the code editor below',
    'বাংলায় বিস্তারিত লিখলে বাংলাদেশি ডেভেলপাররা সহজে খুঁজে পাবেন',
  ],
  blog: [
    'Use a compelling headline with keywords',
    'Write an introduction that hooks readers',
    'Use headings to structure (H2, H3)',
    'Include code examples where relevant',
    'End with a summary or call-to-action',
    'বাংলা + English মিশিয়ে লিখলে বেশি পাঠক পাবেন',
  ],
  wiki: [
    'Start with a clear definition',
    'Cover prerequisites and requirements',
    'Use step-by-step instructions',
    'Add examples for every concept',
    'Keep it evergreen — avoid time-sensitive info',
  ],
  snippet: [
    'Give the snippet a descriptive name',
    'Explain what the code does in the description',
    'Add comments inside the code',
    'Mention the language version (e.g. Python 3.11)',
    'Note any dependencies or requirements',
  ],
  project: [
    'Start with what problem the project solves',
    'List the tech stack used',
    'Include a GitHub link or demo URL in the body',
    'Add screenshots via the image upload',
    'Mention if it is open source',
  ],
  post: [
    'Be specific about the topic',
    'Encourage discussion with a question',
    'Add relevant tags for discoverability',
    'Keep it respectful and constructive',
  ],
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function CreatePostPage() {
  const { user, profile } = useAuth();
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();

  /* Form state */
  const [type,         setType]         = useState(searchParams.get('type') || 'qa');
  const [title,        setTitle]        = useState('');
  const [body,         setBody]         = useState('');
  const [code,         setCode]         = useState('');
  const [lang,         setLang]         = useState('javascript');
  const [tags,         setTags]         = useState([]);
  const [tagInput,     setTagInput]     = useState('');
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [coverUrl,     setCoverUrl]     = useState('');

  /* UI state */
  const [mode,         setMode]         = useState('write'); // write | preview
  const [submitting,   setSubmitting]   = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error,        setError]        = useState('');
  const [autoSaved,    setAutoSaved]    = useState(false);
  const [charCount,    setCharCount]    = useState(0);

  const fileRef    = useRef(null);
  const titleRef   = useRef(null);
  const bodyRef    = useRef(null);
  const autoSaveRef = useRef(null);

  /* SEO score */
  const seoScore = getKeywordScore(title, body, tags);

  /* ── Focus title on mount ──────────────────── */
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  /* ── Auto-save draft to localStorage ──────── */
  useEffect(() => {
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (title || body) {
        localStorage.setItem('bsdc_draft', JSON.stringify({ type, title, body, code, lang, tags }));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 2000);
    return () => clearTimeout(autoSaveRef.current);
  }, [type, title, body, code, lang, tags]);

  /* ── Restore draft ─────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem('bsdc_draft');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.title || d.body) {
          const restore = window.confirm('You have an unsaved draft. Restore it?');
          if (restore) {
            setType(d.type || 'qa');
            setTitle(d.title || '');
            setBody(d.body || '');
            setCode(d.code || '');
            setLang(d.lang || 'javascript');
            setTags(d.tags || []);
          } else {
            localStorage.removeItem('bsdc_draft');
          }
        }
      } catch {}
    }
  }, []);

  /* ── Char count ────────────────────────────── */
  useEffect(() => {
    setCharCount(body.length);
  }, [body]);

  /* ── Prism highlight in preview ────────────── */
  useEffect(() => {
    if (mode === 'preview') {
      Prism.highlightAll();
    }
  }, [mode]);

  /* ── Guard: not logged in ──────────────────── */
  if (!user) {
    return (
      <main style={{ textAlign: 'center', padding: '80px 16px' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" style={{ margin: '0 auto 20px' }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>
          Sign In to Create a Post
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Join BSDC to share knowledge with Bangladesh's developer community
        </p>
        <Link to="/login" state={{ from: '/create' }} className="btn btn-primary btn-lg">
          Sign In to Continue
        </Link>
      </main>
    );
  }

  /* ── Tag management ────────────────────────── */
  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09FF\-\.#\+]/g, '')
      .replace(/^#+/, '');
    if (!t || tags.includes(t) || tags.length >= 8) return;
    setTags(p => [...p, t]);
    setTagInput('');
  };

  const removeTag = tag => setTags(p => p.filter(t => t !== tag));

  const addPopularTag = tag => {
    if (tags.includes(tag) || tags.length >= 8) return;
    setTags(p => [...p, tag]);
  };

  /* ── Image handling ────────────────────────── */
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be under 8MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--gray-2)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageChange({ target: { files: [file] } });
    }
  };

  /* ── Code tab key ──────────────────────────── */
  const handleCodeKeyDown = e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end   = e.target.selectionEnd;
      const val   = e.target.value;
      const next  = val.substring(0, start) + '  ' + val.substring(end);
      setCode(next);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  /* ── SUBMIT — FIXED ────────────────────────── */
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    /* Validation */
    if (!title.trim()) {
      setError('Please add a title for your post.');
      titleRef.current?.focus();
      return;
    }
    if (title.trim().length < 10) {
      setError('Title must be at least 10 characters.');
      titleRef.current?.focus();
      return;
    }
    if (type !== 'snippet' && !body.trim()) {
      setError('Please add some content to your post.');
      bodyRef.current?.focus();
      return;
    }
    if (type === 'snippet' && !code.trim()) {
      setError('Please add your code snippet.');
      return;
    }
    if (tags.length === 0) {
      setError('Please add at least one tag.');
      return;
    }

    setSubmitting(true);

    try {
      /* 1. Upload image if selected */
      let finalCoverUrl = coverUrl;
      if (imageFile && !coverUrl) {
        setUploadingImg(true);
        try {
          finalCoverUrl = await uploadToImgBB(imageFile);
          setCoverUrl(finalCoverUrl);
        } catch (imgErr) {
          console.warn('Image upload failed, continuing without image:', imgErr);
          /* Don't block post creation if image fails */
        }
        setUploadingImg(false);
      }

      /* 2. Generate slug */
      const slug = generateSlug(title.trim());

      /* 3. Build post object */
      const authorName  = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Anonymous';
      const authorPhoto = profile?.photoURL    || user.photoURL    || '';
      const wordCount   = (title + ' ' + body + ' ' + tags.join(' ')).trim().split(/\s+/).length;

      const postData = {
        type,
        title:        title.trim(),
        body:         body.trim(),
        code:         type === 'snippet' ? code.trim() : (code.trim() || ''),
        language:     (type === 'snippet' || code.trim()) ? lang : '',
        tags,
        slug,
        coverImage:   finalCoverUrl || '',
        authorId:     user.uid,
        authorName,
        authorPhoto,
        upvotes:      0,
        upvotedBy:    [],
        views:        0,
        commentCount: 0,
        solved:       false,
        wordCount,
        readingTime:  readingTime(title + ' ' + body),
        seoScore,
        createdAt:    serverTimestamp(),
        updatedAt:    serverTimestamp(),
      };

      /* 4. Write to Firestore */
      const postRef = await addDoc(collection(db, 'posts'), postData);

      /* 5. Update user post count */
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          await updateDoc(userRef, {
            postCount:  increment(1),
            reputation: increment(5),
          });
        } else {
          /* Create user doc if missing */
          await setDoc(userRef, {
            uid:          user.uid,
            displayName:  authorName,
            email:        user.email || '',
            photoURL:     authorPhoto,
            postCount:    1,
            reputation:   5,
            joinedAt:     serverTimestamp(),
          });
        }
      } catch (userUpdateErr) {
        /* Non-critical — post is already saved */
        console.warn('User update error (non-critical):', userUpdateErr);
      }

      /* 6. Clear draft */
      localStorage.removeItem('bsdc_draft');

      /* 7. Navigate to new post */
      navigate(`/post/${slug}`, { replace: true });

    } catch (err) {
      console.error('Post creation error:', err);

      /* Parse Firebase error codes */
      const code = err?.code || '';
      if (code === 'permission-denied') {
        setError('Permission denied. Please sign out and sign in again.');
      } else if (code === 'unavailable') {
        setError('Network error. Please check your connection and try again.');
      } else if (code === 'resource-exhausted') {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(`Failed to publish: ${err?.message || 'Unknown error'}. Please try again.`);
      }
    }

    setSubmitting(false);
  };

  /* ── Active type config ────────────────────── */
  const activeType = POST_TYPES.find(t => t.key === type) || POST_TYPES[0];

  /* ── Highlight preview code 2.0.0.0 ────────────────── */
  const getHighlighted = () => {
  try {
    if (code && Prism.languages && Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  } catch (err) {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
};
const highlighted = getHighlighted();

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      <Helmet>
        <title>Create Post — BSDC | Bangladesh Software Development Community</title>
        <meta name="description" content="Create and share Q&A questions, blog articles, wiki docs, code snippets or projects on BSDC — Bangladesh's #1 developer community." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main style={{ background: 'var(--gray)', minHeight: '100vh', padding: '0 0 60px' }}>

        {/* ── TOP BAR ── */}
        <div style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--gray-2)',
          position: 'sticky', top: 'var(--navbar-h)',
          zIndex: 100,
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                ← Back
              </Link>
              <span style={{ color: 'var(--gray-3)' }}>|</span>
              <span style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '0.95rem' }}>
                New {activeType.label}
              </span>
              {autoSaved && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                  <Icons.Check /> Draft saved
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`btn btn-sm ${mode === 'write' ? 'btn-dark' : 'btn-outline'}`}
                onClick={() => setMode('write')}
              >
                <Icons.Edit /> Write
              </button>
              <button
                className={`btn btn-sm ${mode === 'preview' ? 'btn-dark' : 'btn-outline'}`}
                onClick={() => setMode('preview')}
              >
                <Icons.Eye /> Preview
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={submitting || uploadingImg}
                style={{ minWidth: 120 }}
              >
                {submitting
                  ? <><span className="loading-spinner" /> Publishing…</>
                  : uploadingImg
                  ? <><span className="loading-spinner" /> Uploading…</>
                  : '🚀 Publish Post'
                }
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

          {/* ── LEFT: EDITOR ── */}
          <div>

            {/* Error alert */}
            {error && (
              <div style={{
                background: '#FEE2E2', border: '1px solid #FECACA',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px',
                fontSize: '0.9rem', color: 'var(--danger)', marginBottom: 16,
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }} role="alert">
                <Icons.Info />
                <div style={{ flex: 1 }}>{error}</div>
                <button onClick={() => setError('')} style={{ background: 'none', color: 'var(--danger)', padding: 0 }}>
                  <Icons.Close />
                </button>
              </div>
            )}

            {/* ── POST TYPE SELECTOR ── */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)', marginBottom: 12 }}>
                Post Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                {POST_TYPES.map(pt => (
                  <button
                    key={pt.key}
                    type="button"
                    onClick={() => setType(pt.key)}
                    style={{
                      padding: '12px 14px', textAlign: 'left',
                      border: `2px solid ${type === pt.key ? pt.color : 'var(--gray-2)'}`,
                      borderRadius: 'var(--radius-sm)',
                      background: type === pt.key ? pt.bg : 'var(--white)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ color: type === pt.key ? pt.color : 'var(--text-muted)', marginBottom: 6 }}>
                      {pt.icon}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: type === pt.key ? pt.color : 'var(--dark)' }}>
                      {pt.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {pt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── WRITE / PREVIEW ── */}
            {mode === 'write' ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>

                {/* Title */}
                <div style={{ padding: '20px 20px 0' }}>
                  <textarea
                    ref={titleRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={
                      type === 'qa'      ? 'What is your question? Be specific and clear…'
                      : type === 'blog'  ? 'Write a compelling blog post title…'
                      : type === 'wiki'  ? 'Wiki article title…'
                      : type === 'snippet' ? 'Code snippet name (e.g. "React custom useFetch hook")'
                      : type === 'project' ? 'Project name and what it does…'
                      : 'Discussion topic or question…'
                    }
                    maxLength={200}
                    rows={2}
                    style={{
                      width: '100%', border: 'none', outline: 'none',
                      fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                      fontWeight: 800, color: 'var(--dark)',
                      lineHeight: 1.3, resize: 'none',
                      fontFamily: 'inherit', background: 'transparent',
                      padding: 0,
                    }}
                    aria-label="Post title"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingBottom: 14, borderBottom: '1px solid var(--gray-2)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: title.length < 10 ? 'var(--danger)' : title.length < 30 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                      {title.length < 10 ? 'Too short' : title.length < 30 ? 'Good' : title.length < 80 ? 'Great' : 'Perfect'} title
                    </span>
                    <span>{title.length}/200</span>
                  </div>
                </div>

                {/* Body */}
                {type !== 'snippet' && (
                  <div style={{ padding: '0 20px' }}>
                    <textarea
                      ref={bodyRef}
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder={
                        type === 'qa'
                          ? `Describe your problem in detail:\n\n1. What are you trying to do?\n2. What have you already tried?\n3. What error or unexpected behavior are you seeing?\n\nআপনার সমস্যা বিস্তারিত বর্ণনা করুন (বাংলায়ও লিখতে পারেন)…`
                          : type === 'blog'
                          ? `## Introduction\n\nStart your article here…\n\nআপনার ব্লগ পোস্ট লিখুন (বাংলায়ও লিখতে পারেন)…`
                          : type === 'wiki'
                          ? `## Overview\n\nDefine the topic clearly…\n\n## Requirements\n\n## Step-by-Step Guide\n\n## Examples\n\n## Summary`
                          : type === 'project'
                          ? `## About This Project\n\n## Tech Stack\n\n## Features\n\n## How to Use\n\n## GitHub / Demo Link`
                          : 'Share your thoughts, news, or ideas with the BSDC community…'
                      }
                      style={{
                        width: '100%', border: 'none', outline: 'none',
                        minHeight: type === 'blog' || type === 'wiki' ? 360 : 220,
                        fontSize: '0.97rem', lineHeight: 1.8,
                        resize: 'vertical', fontFamily: 'inherit',
                        color: 'var(--text)', background: 'transparent',
                        padding: '16px 0',
                      }}
                      aria-label="Post content"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--gray-2)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{readingTime(body)} min read · {charCount} chars</span>
                      <span style={{ color: charCount > 300 ? 'var(--success)' : 'var(--text-muted)' }}>
                        {charCount < 100 ? 'Add more detail' : charCount < 300 ? 'Getting better' : charCount < 800 ? 'Good length' : 'Excellent!'}
                      </span>
                    </div>
                  </div>
                </div>
                }}
                
    {/* Code editor */}
{(type === 'snippet' || type === 'qa') && (
  <div style={{ borderTop: '1px solid var(--gray-2)', background: '#0d1117' }}>
    {/* Code toolbar */}
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      borderBottom: '1px solid #21262d',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          style={{
            background: '#21262d',
            color: '#8b949e',
            border: '1px solid #30363d',
            borderRadius: 4,
            padding: '3px 8px',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <span style={{ fontSize: '0.72rem', color: '#484f58' }}>
        {type === 'snippet' ? 'Code *' : 'Code (optional)'}
      </span>
    </div>

    {/* FIXED textarea — no onKeyDown Tab handler */}
    <textarea
      value={code}
      onChange={e => {
        try {
          setCode(e.target.value);
        } catch (err) {
          console.error('Code input error:', err);
        }
      }}
      placeholder={`// Write your ${lang} code here...`}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      style={{
        width: '100%',
        minHeight: 220,
        background: '#0d1117',
        color: '#c9d1d9',
        border: 'none',
        outline: 'none',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: '0.875rem',
        lineHeight: 1.7,
        padding: 16,
        resize: 'vertical',
        display: 'block',
        boxSizing: 'border-box',
      }}
    />
    aria-label="Code editor"
  </div>
)}: charCount < 800 ? 'Good length' : 'Excellent!'}
                      </span>
                    </div>
                  </div>
                )}

                

                {/* Image upload (blog/project) */}
                {(type === 'blog' || type === 'project' || type === 'wiki') && (
                  <div style={{ borderTop: '1px solid var(--gray-2)', padding: 20 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--dark)', marginBottom: 10 }}>
                      Cover Image <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <div
                      style={{
                        border: `2px dashed ${imagePreview ? 'var(--green)' : 'var(--gray-2)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: imagePreview ? 0 : 32,
                        textAlign: 'center', cursor: 'pointer',
                        background: imagePreview ? 'transparent' : 'var(--gray)',
                        transition: 'all 0.2s', overflow: 'hidden',
                        position: 'relative',
                      }}
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--green)'; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-2)'; }}
                      onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Cover preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setImagePreview(''); setImageFile(null); setCoverUrl(''); }}
                            style={{
                              position: 'absolute', top: 8, right: 8,
                              background: 'rgba(0,0,0,0.7)', color: 'white',
                              border: 'none', borderRadius: '50%',
                              width: 28, height: 28,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                            aria-label="Remove image"
                          >
                            <Icons.Close />
                          </button>
                        </>
                      ) : (
                        <>
                          <Icons.Upload />
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 8 }}>
                            Drag & drop or click to upload
                          </p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                            PNG, JPG, GIF · Max 8MB
                          </p>
                        </>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </div>
                )}

                {/* Tags section */}
                <div style={{ borderTop: '1px solid var(--gray-2)', padding: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--dark)', marginBottom: 10 }}>
                    <Icons.Tag /> Tags <span style={{ color: 'var(--danger)' }}>*</span>
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                      (helps people find your post)
                    </span>
                  </label>

                  {/* Selected tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {tags.map(tag => (
                      <span key={tag} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: activeType.bg, color: activeType.color,
                        padding: '5px 12px', borderRadius: 100,
                        fontSize: '0.82rem', fontWeight: 600,
                        border: `1px solid ${activeType.color}40`,
                      }}>
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          style={{ background: 'none', color: activeType.color, padding: 0, fontSize: '1rem', lineHeight: 1, cursor: 'pointer' }}
                          aria-label={`Remove tag ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {tags.length < 8 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          placeholder={tags.length === 0 ? 'Add tags (e.g. javascript, react)…' : 'Add more…'}
                          style={{
                            border: 'none', outline: 'none',
                            fontSize: '0.88rem', minWidth: 180,
                            background: 'transparent', fontFamily: 'inherit',
                          }}
                          aria-label="Add tag"
                        />
                        <button type="button" className="btn btn-sm btn-outline" onClick={addTag} style={{ flexShrink: 0 }}>
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Popular tags */}
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                      Suggested tags:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {POPULAR_TAGS
                        .filter(t => !tags.includes(t))
                        .slice(0, 12)
                        .map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addPopularTag(tag)}
                            disabled={tags.length >= 8}
                            style={{
                              padding: '3px 9px', borderRadius: 100,
                              border: '1px solid var(--gray-2)',
                              background: 'var(--white)', cursor: 'pointer',
                              fontSize: '0.75rem', color: 'var(--text-muted)',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = activeType.color; e.currentTarget.style.color = activeType.color; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          >
                            +{tag}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ── PREVIEW MODE ── */
              <div style={{ background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-2)', background: 'var(--gray)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>
                    Preview — {activeType.label}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {readingTime(body)} min read
                  </span>
                </div>

                <div style={{ padding: 24 }}>
                  {imagePreview && (
                    <img src={imagePreview} alt="Cover" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 8, marginBottom: 20 }} />
                  )}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span style={{ background: activeType.bg, color: activeType.color, padding: '3px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {activeType.label}
                    </span>
                    {tags.map(t => (
                      <span key={t} style={{ background: 'var(--gray)', color: 'var(--dark)', padding: '3px 10px', borderRadius: 100, fontSize: '0.75rem' }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.7rem)', fontWeight: 800, color: 'var(--dark)', lineHeight: 1.3, marginBottom: 20 }}>
                    {title || <span style={{ color: 'var(--gray-3)' }}>Untitled post…</span>}
                  </h1>

                  {body && (
                    <div className="article-content" style={{ whiteSpace: 'pre-wrap' }}>
                      {body}
                    </div>
                  )}

                  {code && (
                    <div className="code-block-wrap" style={{ marginTop: 20 }}>
                      <span className="code-lang-label">{lang}</span>
                      <pre className={`language-${lang}`}>
                        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
                      </pre>
                    </div>
                  )}

                  {!title && !body && !code && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <p>Start writing to see a preview here</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit button (mobile) */}
            <button
              className="btn btn-primary btn-block"
              onClick={handleSubmit}
              disabled={submitting || uploadingImg}
              style={{ padding: 14, fontSize: '1rem' }}
            >
              {submitting
                ? <><span className="loading-spinner" /> Publishing your post…</>
                : uploadingImg
                ? <><span className="loading-spinner" /> Uploading image…</>
                : '🚀 Publish Post'
              }
            </button>
          </div>

          {/* ── RIGHT: SIDEBAR ── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* SEO Score */}
            <SEOScoreMeter
              score={seoScore}
              title={title}
              body={body}
              tags={tags}
            />

            {/* Writing tips */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <div style={{
                padding: '12px 16px', fontWeight: 700, fontSize: '0.85rem',
                color: 'var(--dark)', borderBottom: '1px solid var(--gray-2)',
                background: activeType.bg, color: activeType.color,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {activeType.icon} {activeType.label} Tips
              </div>
              <div style={{ padding: '14px 16px' }}>
                {(TIPS[type] || TIPS.post).map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.82rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: activeType.bg, color: activeType.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                      {i + 1}
                    </div>
                    <span style={{ color: 'var(--text)', lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Post summary */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--dark)', borderBottom: '1px solid var(--gray-2)' }}>
                Post Summary
              </div>
              <div style={{ padding: '14px 16px' }}>
                {[
                  { label: 'Type',       value: activeType.label },
                  { label: 'Title len',  value: `${title.length} chars` },
                  { label: 'Body len',   value: `${body.length} chars` },
                  { label: 'Read time',  value: `~${readingTime(body)} min` },
                  { label: 'Tags',       value: `${tags.length}/8` },
                  { label: 'Has code',   value: code ? 'Yes' : 'No' },
                  { label: 'Has image',  value: imagePreview ? 'Yes' : 'No' },
                  { label: 'SEO score',  value: `${seoScore}/100` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community guidelines */}
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,106,78,0.2)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>
                BSDC Community Guidelines
              </p>
              {[
                'Be respectful and constructive',
                'No spam or self-promotion only',
                'Credit sources and authors',
                'Use English or বাংলা',
                'Keep content dev-related',
              ].map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, fontSize: '0.78rem', color: 'var(--green-dark)', marginBottom: 5, alignItems: 'flex-start' }}>
                  <Icons.Check />
                  {g}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      {/* Responsive sidebar collapse */}
      <style>{`
        @media (max-width: 768px) {
          main > div > div {
            grid-template-columns: 1fr !important;
          }
          main > div > div > aside {
            order: -1;
          }
        }
      `}</style>
    </>
  );
}
