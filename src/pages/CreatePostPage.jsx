import React, {
  useState, useRef, useEffect, useCallback
} from 'react';
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

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
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
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'php', 'java',
  'css', 'html', 'bash', 'sql', 'dart', 'c', 'cpp',
  'rust', 'go', 'kotlin', 'swift', 'ruby', 'scala',
  'r', 'matlab', 'perl', 'lua', 'haskell',
];

const POPULAR_TAGS = [
  'javascript', 'python', 'react', 'laravel', 'django',
  'nodejs', 'php', 'java', 'flutter', 'android',
  'mysql', 'mongodb', 'devops', 'docker', 'aws',
  'ai', 'machine-learning', 'freelancing', 'career',
  'beginners', 'typescript', 'nextjs', 'vuejs', 'css',
];

const TIPS = {
  qa: [
    'Start with "How to…", "What is…", or "Why does…"',
    'Describe what you tried first',
    'Include exact error messages',
    'Add your code in the code editor below',
    'Mention your environment (OS, version)',
    'বাংলায় লিখলে বাংলাদেশি ডেভেলপাররা সহজে খুঁজে পাবেন',
  ],
  blog: [
    'Use a compelling headline with target keywords',
    'Write an introduction that hooks the reader',
    'Use headings to structure content (H2, H3)',
    'Include code examples where relevant',
    'End with a summary or call-to-action',
    'বাংলা + English মিশিয়ে লিখলে বেশি পাঠক পাবেন',
    'Aim for 800+ words for better SEO ranking',
  ],
  wiki: [
    'Start with a clear one-line definition',
    'Cover prerequisites and requirements first',
    'Use numbered lists for step-by-step instructions',
    'Add working examples for every concept',
    'Keep it evergreen — avoid time-sensitive info',
    'Link to related topics and resources',
  ],
  snippet: [
    'Give the snippet a descriptive name',
    'Explain what the code does in the description',
    'Add comments inside the code',
    'Mention language version (e.g. Python 3.11)',
    'Note any dependencies or packages needed',
    'Show both input and expected output',
  ],
  project: [
    'Start with what problem the project solves',
    'List the complete tech stack used',
    'Include GitHub link or demo URL in the body',
    'Add screenshots via the image upload',
    'Mention if it is open source',
    'Include setup/installation instructions',
  ],
  post: [
    'Be specific about the discussion topic',
    'Encourage engagement with a direct question',
    'Add relevant tags for discoverability',
    'Keep it respectful and constructive',
    'Share your own opinion to spark discussion',
  ],
};

const PLACEHOLDERS = {
  title: {
    qa:      'What is your question? Be specific and clear…',
    blog:    'Write a compelling blog post title with keywords…',
    wiki:    'Wiki article title (e.g. "How to set up Laravel on Ubuntu")…',
    snippet: 'Code snippet name (e.g. "React custom useFetch hook")…',
    project: 'Project name and what it does in one line…',
    post:    'Discussion topic, news, or question…',
  },
  body: {
    qa:      'Describe your problem in detail:\n\n1. What are you trying to do?\n2. What have you already tried?\n3. What error or unexpected behavior are you seeing?\n4. What is your environment (OS, language version)?\n\nআপনার সমস্যা বিস্তারিত বর্ণনা করুন…',
    blog:    '## Introduction\n\nStart your article here. Tell readers what they will learn.\n\n## Main Content\n\nWrite your main content here…\n\n## Conclusion\n\nSummarize the key points.\n\nআপনার ব্লগ পোস্ট লিখুন…',
    wiki:    '## Overview\n\nDefine the topic clearly in 1-2 sentences.\n\n## Prerequisites\n\n- Requirement 1\n- Requirement 2\n\n## Step-by-Step Guide\n\n### Step 1\n\n### Step 2\n\n## Examples\n\n## Summary',
    project: '## About This Project\n\nWhat problem does this solve?\n\n## Tech Stack\n\n- Frontend:\n- Backend:\n- Database:\n\n## Features\n\n- Feature 1\n- Feature 2\n\n## How to Use\n\n## GitHub / Demo Link',
    post:    'Share your thoughts, news, or ideas with the BSDC community…\n\nআপনার মতামত শেয়ার করুন…',
    snippet: 'Describe what this code does and when to use it…\n\nকোডটি কী করে এবং কখন ব্যবহার করবেন তা বর্ণনা করুন…',
  },
};

/* ═══════════════════════════════════════════
   HELPER FUNCTIONS
═══════════════════════════════════════════ */
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
  return base ? (base + '-' + suffix) : ('post-' + suffix);
}

function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function wordCount(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function getSEOScore(title, body, tags, type) {
  let score = 0;
  if (title.length >= 20)  score += 15;
  if (title.length >= 40)  score += 10;
  if (title.length >= 60)  score += 5;
  if (body.length  >= 100) score += 10;
  if (body.length  >= 300) score += 15;
  if (body.length  >= 800) score += 15;
  if (tags.length  >= 2)   score += 10;
  if (tags.length  >= 4)   score += 10;
  if (tags.length  >= 6)   score += 5;
  const banglaRegex = /[\u0980-\u09FF]/;
  if (banglaRegex.test(body) || banglaRegex.test(title)) score += 10;
  const hasQuestion = /\?|how|what|why|when|where|কিভাবে|কী|কেন/i.test(title);
  if (hasQuestion) score += 5;
  return Math.min(100, score);
}

function getTitleQuality(len) {
  if (len === 0)   return { label: 'Start typing…', color: 'var(--text-muted)' };
  if (len < 10)    return { label: 'Too short', color: 'var(--danger)' };
  if (len < 20)    return { label: 'Getting there', color: '#D97706' };
  if (len < 40)    return { label: 'Good', color: '#0284C7' };
  if (len < 80)    return { label: 'Great!', color: 'var(--success)' };
  return           { label: 'Perfect!', color: 'var(--success)' };
}

function getBodyQuality(len) {
  if (len === 0)   return { label: 'Write your content…', color: 'var(--text-muted)' };
  if (len < 100)   return { label: 'Too short', color: 'var(--danger)' };
  if (len < 300)   return { label: 'Getting better', color: '#D97706' };
  if (len < 800)   return { label: 'Good length', color: '#0284C7' };
  return           { label: 'Excellent!', color: 'var(--success)' };
}

/* ═══════════════════════════════════════════
   SEO SCORE METER COMPONENT
═══════════════════════════════════════════ */
function SEOScoreMeter({ score, title, body, tags }) {
  const color = score >= 75 ? '#059669'
    : score >= 50 ? '#D97706'
    : '#DC2626';

  const label = score >= 75 ? 'Great SEO'
    : score >= 50 ? 'Average SEO'
    : 'Needs Work';

  const checks = [
    { pass: title.length >= 20,  text: 'Title is descriptive (20+ chars)' },
    { pass: title.length >= 40,  text: 'Title is keyword-rich (40+ chars)' },
    { pass: body.length  >= 300, text: 'Content is detailed (300+ chars)' },
    { pass: body.length  >= 800, text: 'Content is comprehensive (800+ chars)' },
    { pass: tags.length  >= 2,   text: 'Has multiple tags (2+)' },
    { pass: tags.length  >= 5,   text: 'Rich in tags (5+)' },
    {
      pass: /[\u0980-\u09FF]/.test(body + title),
      text: 'Bilingual (EN + বাংলা) boosts local SEO',
    },
    {
      pass: /\?|how|what|why|when|কিভাবে|কী|কেন/i.test(title),
      text: 'Question format (great for Q&A SEO)',
    },
  ];

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-2)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        background: color + '12',
        borderBottom: '1px solid ' + color + '25',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontWeight: 700, fontSize: '0.85rem', color,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          SEO Score — {label}
        </div>
        <div style={{
          fontWeight: 900, fontSize: '1.2rem', color,
          fontFamily: 'var(--font-mono)',
        }}>
          {score}/100
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{
          height: 8, background: 'var(--gray-2)',
          borderRadius: 4, marginBottom: 14,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: score + '%',
            background: 'linear-gradient(90deg, ' + color + ', ' + color + '90)',
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {checks.map(function(c, i) {
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start',
                gap: 8, fontSize: '0.78rem',
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: c.pass ? '#D1FAE5' : 'var(--gray-2)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, marginTop: 1,
                }}>
                  {c.pass && (
                    <svg width="10" height="10" viewBox="0 0 24 24"
                      fill="none" stroke="#059669" strokeWidth="3"
                      strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span style={{ color: c.pass ? 'var(--text)' : 'var(--text-muted)', lineHeight: 1.4 }}>
                  {c.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function CreatePostPage() {
  const { user, profile }  = useAuth();
  const navigate           = useNavigate();
  const [searchParams]     = useSearchParams();

  /* ── Form state ── */
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

  /* ── UI state ── */
  const [mode,         setMode]         = useState('write');
  const [submitting,   setSubmitting]   = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  const [autoSaved,    setAutoSaved]    = useState(false);
  const [showGuide,    setShowGuide]    = useState(false);
  const [dragOver,     setDragOver]     = useState(false);
  const [tipExpanded,  setTipExpanded]  = useState(true);

  /* ── Refs ── */
  const fileRef     = useRef(null);
  const titleRef    = useRef(null);
  const bodyRef     = useRef(null);
  const autoSaveRef = useRef(null);

  /* ── Computed ── */
  const seoScore    = getSEOScore(title, body, tags, type);
  const activeType  = POST_TYPES.find(function(t) { return t.key === type; }) || POST_TYPES[0];
  const titleQ      = getTitleQuality(title.length);
  const bodyQ       = getBodyQuality(body.length);
  const words       = wordCount(body);

  /* ── Focus title on mount ── */
  useEffect(function() {
    titleRef.current && titleRef.current.focus();
  }, []);

  /* ── Auto-save draft ── */
  useEffect(function() {
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(function() {
      if (title || body || code) {
        try {
          localStorage.setItem('bsdc_draft', JSON.stringify({
            type: type,
            title: title,
            body: body,
            code: code,
            lang: lang,
            tags: tags,
            savedAt: Date.now(),
          }));
          setAutoSaved(true);
          setTimeout(function() { setAutoSaved(false); }, 2000);
        } catch (e) {
          /* localStorage might be full — ignore */
        }
      }
    }, 2500);
    return function() { clearTimeout(autoSaveRef.current); };
  }, [type, title, body, code, lang, tags]);

  /* ── Restore draft on load ── */
  useEffect(function() {
    try {
      var saved = localStorage.getItem('bsdc_draft');
      if (!saved) return;
      var d = JSON.parse(saved);
      if (!d.title && !d.body && !d.code) return;
      var age = Date.now() - (d.savedAt || 0);
      if (age > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('bsdc_draft');
        return;
      }
      var restore = window.confirm(
        'You have an unsaved draft from ' +
        new Date(d.savedAt).toLocaleString() +
        '. Restore it?'
      );
      if (restore) {
        setType(d.type    || 'qa');
        setTitle(d.title  || '');
        setBody(d.body    || '');
        setCode(d.code    || '');
        setLang(d.lang    || 'javascript');
        setTags(d.tags    || []);
      } else {
        localStorage.removeItem('bsdc_draft');
      }
    } catch (e) {
      /* ignore parse errors */
    }
  }, []);

  /* ── Guard: not logged in ── */
  if (!user) {
    return (
      <main style={{ textAlign: 'center', padding: '80px 16px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--green-bg)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 10 }}>
          Sign In to Create a Post
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.97rem' }}>
          Join BSDC to share knowledge with Bangladesh's developer community
        </p>
        <Link to="/login" state={{ from: '/create' }} className="btn btn-primary btn-lg">
          Sign In to Continue
        </Link>
      </main>
    );
  }

  /* ── Tag management ── */
  function addTag() {
    var t = tagInput.trim().toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09FF\-\.#+]/g, '')
      .replace(/^#+/, '');
    if (!t || tags.includes(t) || tags.length >= 8) return;
    setTags(function(p) { return p.concat([t]); });
    setTagInput('');
  }

  function removeTag(tag) {
    setTags(function(p) { return p.filter(function(t) { return t !== tag; }); });
  }

  function addPopularTag(tag) {
    if (tags.includes(tag) || tags.length >= 8) return;
    setTags(function(p) { return p.concat([tag]); });
  }

  /* ── Image handling ── */
  function handleImageChange(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be under 8MB');
      return;
    }
    setImageFile(file);
    var reader = new FileReader();
    reader.onload = function() { setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageChange({ target: { files: [file] } });
    }
  }

  /* ── Code change handler ── */
  function handleCodeChange(e) {
    try {
      setCode(e.target.value);
    } catch (err) {
      console.error('Code input error:', err);
    }
  }

  /* ── Clear draft and form ── */
  function clearDraft() {
    try { localStorage.removeItem('bsdc_draft'); } catch (e) {}
    setTitle('');
    setBody('');
    setCode('');
    setTags([]);
    setTagInput('');
    setImageFile(null);
    setImagePreview('');
    setCoverUrl('');
    setError('');
  }

  /* ══════════════════════════════════════════
     SUBMIT HANDLER — FULLY FIXED
  ══════════════════════════════════════════ */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    /* Validation */
    if (!title.trim()) {
      setError('Please add a title for your post.');
      titleRef.current && titleRef.current.focus();
      return;
    }
    if (title.trim().length < 10) {
      setError('Title must be at least 10 characters long.');
      titleRef.current && titleRef.current.focus();
      return;
    }
    if (type !== 'snippet' && !body.trim()) {
      setError('Please add some content to your post.');
      bodyRef.current && bodyRef.current.focus();
      return;
    }
    if (type === 'snippet' && !code.trim()) {
      setError('Please add your code in the code editor below.');
      return;
    }
    if (tags.length === 0) {
      setError('Please add at least one tag to help people find your post.');
      return;
    }

    setSubmitting(true);

    /* Step 1: Upload image (non-blocking) */
    var finalCoverUrl = coverUrl;
    if (imageFile && !coverUrl) {
      setUploadingImg(true);
      try {
        finalCoverUrl = await uploadToImgBB(imageFile);
        setCoverUrl(finalCoverUrl);
      } catch (imgErr) {
        console.warn('Image upload failed — continuing without image:', imgErr);
        /* Post still publishes without image */
      }
      setUploadingImg(false);
    }

    /* Step 2: Build slug */
    var slug = generateSlug(title.trim());

    /* Step 3: Build author info */
    var authorName  = (profile && profile.displayName)
      || user.displayName
      || (user.email && user.email.split('@')[0])
      || 'Anonymous';
    var authorPhoto = (profile && profile.photoURL) || user.photoURL || '';

    /* Step 4: Build post data */
    var postData = {
      type:         type,
      title:        title.trim(),
      body:         body.trim(),
      code:         code.trim(),
      language:     code.trim() ? lang : '',
      tags:         tags,
      slug:         slug,
      coverImage:   finalCoverUrl || '',
      authorId:     user.uid,
      authorName:   authorName,
      authorPhoto:  authorPhoto,
      upvotes:      0,
      upvotedBy:    [],
      views:        0,
      commentCount: 0,
      solved:       false,
      wordCount:    wordCount(title + ' ' + body),
      readingTime:  readingTime(title + ' ' + body),
      seoScore:     seoScore,
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
    };

    try {
      /* Step 5: Write post to Firestore */
      var postRef = await addDoc(collection(db, 'posts'), postData);

      /* Step 6: Update user stats (non-critical) */
      try {
        var userRef  = doc(db, 'users', user.uid);
        var userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          await updateDoc(userRef, {
            postCount:  increment(1),
            reputation: increment(5),
            updatedAt:  serverTimestamp(),
          });
        } else {
          await setDoc(userRef, {
            uid:         user.uid,
            displayName: authorName,
            email:       user.email || '',
            photoURL:    authorPhoto,
            bio:         '',
            skills:      [],
            location:    'Bangladesh',
            role:        'member',
            postCount:   1,
            reputation:  5,
            joinedAt:    serverTimestamp(),
            updatedAt:   serverTimestamp(),
          });
        }
      } catch (userErr) {
        /* User update failed — post already saved, this is non-critical */
        console.warn('User stats update failed (non-critical):', userErr.code || userErr.message);
      }

      /* Step 7: Clear draft from localStorage */
      try { localStorage.removeItem('bsdc_draft'); } catch (e) {}

      /* Step 8: Show success and navigate */
      setSuccess('Post published! Redirecting…');
      setTimeout(function() {
        navigate('/post/' + slug);
      }, 800);

    } catch (err) {
      console.error('Post creation failed:', err);

      var errCode = err && err.code ? err.code : '';
      var errMsg  = '';

      if (errCode === 'permission-denied') {
        errMsg = 'Permission denied. Please sign out and sign in again, then retry.';
      } else if (errCode === 'unavailable') {
        errMsg = 'Network error. Please check your connection and try again.';
      } else if (errCode === 'resource-exhausted') {
        errMsg = 'Too many requests. Please wait a moment and try again.';
      } else if (errCode === 'not-found') {
        errMsg = 'Database error. Please refresh the page and try again.';
      } else if (errCode === 'unauthenticated') {
        errMsg = 'Session expired. Please sign in again.';
      } else {
        errMsg = 'Failed to publish. Please try again.';
        if (err && err.message) errMsg += ' (' + err.message + ')';
      }

      setError(errMsg);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  /* ── Safe preview code ── */
  function getPreviewCode() {
    if (!code) return '';
    try {
      if (Prism.languages && Prism.languages[lang]) {
        return Prism.highlight(code, Prism.languages[lang], lang);
      }
    } catch (e) {}
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <>
      <Helmet>
        <title>Create Post — BSDC | Bangladesh Software Development Community</title>
        <meta name="description" content="Create and share Q&A questions, blog articles, wiki docs, code snippets or projects on BSDC — Bangladesh's #1 developer community." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main style={{ background: 'var(--gray)', minHeight: '100vh', paddingBottom: 60 }}>

        {/* ── STICKY TOP BAR ── */}
        <div style={{
          background: 'var(--white)',
          borderBottom: '2px solid var(--green)',
          position: 'sticky',
          top: 'var(--navbar-h)',
          zIndex: 100,
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/" style={{
                color: 'var(--text-muted)', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </Link>
              <span style={{ color: 'var(--gray-3)' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: activeType.bg, color: activeType.color,
                  padding: '3px 10px', borderRadius: 100,
                  fontSize: '0.78rem', fontWeight: 700,
                }}>
                  {activeType.label}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '0.9rem' }}>
                  New Post
                </span>
              </div>
              {autoSaved && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Draft saved
                </span>
              )}
            </div>

            {/* Right */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className={'btn btn-sm ' + (mode === 'write' ? 'btn-dark' : 'btn-outline')}
                onClick={function() { setMode('write'); }}
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Write
              </button>
              <button
                className={'btn btn-sm ' + (mode === 'preview' ? 'btn-dark' : 'btn-outline')}
                onClick={function() { setMode('preview'); }}
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Preview
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={submitting || uploadingImg}
                type="button"
                style={{ minWidth: 130 }}
              >
                {submitting
                  ? (
                    <>
                      <span className="loading-spinner" style={{ width: 14, height: 14 }} />
                      Publishing…
                    </>
                  )
                  : uploadingImg
                  ? (
                    <>
                      <span className="loading-spinner" style={{ width: 14, height: 14 }} />
                      Uploading…
                    </>
                  )
                  : '🚀 Publish Post'
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '24px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 20,
          alignItems: 'start',
        }}>

          {/* ══════════════════════════
              LEFT — EDITOR
          ══════════════════════════ */}
          <div>

            {/* Success alert */}
            {success && (
              <div style={{
                background: '#D1FAE5',
                border: '1px solid #A7F3D0',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.9rem',
                color: 'var(--success)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontWeight: 600,
              }} role="status">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {success}
              </div>
            )}

            {/* Error alert */}
            {error && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.9rem',
                color: 'var(--danger)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }} role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ flex: 1 }}>{error}</span>
                <button
                  onClick={function() { setError(''); }}
                  type="button"
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--danger)', cursor: 'pointer',
                    padding: 0, flexShrink: 0,
                  }}
                  aria-label="Dismiss error"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* ── POST TYPE SELECTOR ── */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-2)',
              borderRadius: 'var(--radius)',
              padding: 20,
              marginBottom: 16,
            }}>
              <label style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '0.88rem',
                color: 'var(--dark)',
                marginBottom: 12,
              }}>
                Post Type
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))',
                gap: 8,
              }}>
                {POST_TYPES.map(function(pt) {
                  return (
                    <button
                      key={pt.key}
                      type="button"
                      onClick={function() { setType(pt.key); }}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'left',
                        border: '2px solid ' + (type === pt.key ? pt.color : 'var(--gray-2)'),
                        borderRadius: 'var(--radius-sm)',
                        background: type === pt.key ? pt.bg : 'var(--white)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        color: type === pt.key ? pt.color : 'var(--text-muted)',
                        marginBottom: 6,
                      }}>
                        {pt.icon}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: type === pt.key ? pt.color : 'var(--dark)',
                        marginBottom: 3,
                      }}>
                        {pt.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {pt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══════════════════════════
                WRITE MODE
            ══════════════════════════ */}
            {mode === 'write' && (
              <div style={{
                background: 'var(--white)',
                border: '1px solid var(--gray-2)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                marginBottom: 16,
              }}>

                {/* Title input */}
                <div style={{ padding: '20px 20px 0' }}>
                  <textarea
                    ref={titleRef}
                    value={title}
                    onChange={function(e) { setTitle(e.target.value); }}
                    placeholder={PLACEHOLDERS.title[type] || 'Write your title here…'}
                    maxLength={200}
                    rows={2}
                    aria-label="Post title"
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: 'clamp(1.1rem, 3vw, 1.45rem)',
                      fontWeight: 800,
                      color: 'var(--dark)',
                      lineHeight: 1.35,
                      resize: 'none',
                      fontFamily: 'inherit',
                      background: 'transparent',
                      padding: 0,
                      display: 'block',
                      width: '100%',
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    paddingBottom: 14,
                    borderBottom: '1px solid var(--gray-2)',
                    fontSize: '0.75rem',
                  }}>
                    <span style={{ color: titleQ.color, fontWeight: 600 }}>
                      {titleQ.label}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {title.length}/200
                    </span>
                  </div>
                </div>

                {/* Body textarea — only for non-snippet */}
                {type !== 'snippet' && (
                  <div style={{ padding: '0 20px' }}>
                    <textarea
                      ref={bodyRef}
                      value={body}
                      onChange={function(e) { setBody(e.target.value); }}
                      placeholder={PLACEHOLDERS.body[type] || 'Write your content here…'}
                      aria-label="Post content"
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        minHeight: (type === 'blog' || type === 'wiki') ? 380 : 240,
                        fontSize: '0.97rem',
                        lineHeight: 1.85,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        color: 'var(--text)',
                        background: 'transparent',
                        padding: '16px 0',
                        display: 'block',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderTop: '1px solid var(--gray-2)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}>
                      <span>
                        {readingTime(body)} min read
                        {' · '}
                        {words} words
                        {' · '}
                        {body.length} chars
                      </span>
                      <span style={{ color: bodyQ.color, fontWeight: 600 }}>
                        {bodyQ.label}
                      </span>
                    </div>
                  </div>
                )}

                {/* Code editor — for snippet and qa */}
                {(type === 'snippet' || type === 'qa') && (
                  <div style={{
                    borderTop: '1px solid var(--gray-2)',
                    background: '#0d1117',
                  }}>
                    {/* Toolbar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 16px',
                      borderBottom: '1px solid #21262d',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
                        </div>
                        <select
                          value={lang}
                          onChange={function(e) { setLang(e.target.value); }}
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
                          {LANGUAGES.map(function(l) {
                            return (
                              <option key={l} value={l}>{l}</option>
                            );
                          })}
                        </select>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#484f58' }}>
                        {type === 'snippet' ? 'Code *' : 'Code (optional)'}
                      </span>
                    </div>

                    {/* Code textarea */}
                    <textarea
                      value={code}
                      onChange={handleCodeChange}
                      placeholder={'// Write your ' + lang + ' code here...\n// আপনার কোড এখানে লিখুন'}
                      spellCheck={false}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      aria-label="Code editor"
                      style={{
                        width: '100%',
                        minHeight: 240,
                        background: '#0d1117',
                        color: '#c9d1d9',
                        border: 'none',
                        outline: 'none',
                        fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
                        fontSize: '0.875rem',
                        lineHeight: 1.75,
                        padding: 16,
                        resize: 'vertical',
                        display: 'block',
                        boxSizing: 'border-box',
                        tabSize: 2,
                      }}
                    />
                    <div style={{
                      padding: '6px 16px',
                      borderTop: '1px solid #21262d',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: '#484f58',
                    }}>
                      <span>{code.split('\n').length} lines · {code.length} chars</span>
                      <button
                        type="button"
                        onClick={function() { setCode(''); }}
                        style={{
                          background: 'none', border: 'none',
                          color: '#484f58', cursor: 'pointer',
                          fontSize: '0.72rem',
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Image upload for blog/project/wiki */}
                {(type === 'blog' || type === 'project' || type === 'wiki') && (
                  <div style={{ borderTop: '1px solid var(--gray-2)', padding: 20 }}>
                    <label style={{
                      display: 'block',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: 'var(--dark)',
                      marginBottom: 10,
                    }}>
                      Cover Image
                      {' '}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                        (optional)
                      </span>
                    </label>
                    <div
                      onClick={function() { fileRef.current && fileRef.current.click(); }}
                      onDragOver={function(e) { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={function() { setDragOver(false); }}
                      onDrop={handleDrop}
                      style={{
                        border: '2px dashed ' + (dragOver ? 'var(--green)' : imagePreview ? 'var(--green)' : 'var(--gray-2)'),
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: dragOver ? 'var(--green-bg)' : imagePreview ? 'transparent' : 'var(--gray)',
                        position: 'relative',
                        minHeight: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Cover preview"
                            style={{
                              width: '100%',
                              maxHeight: 200,
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          <button
                            type="button"
                            onClick={function(e) {
                              e.stopPropagation();
                              setImagePreview('');
                              setImageFile(null);
                              setCoverUrl('');
                            }}
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: 'rgba(0,0,0,0.65)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              lineHeight: 1,
                            }}
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: 24 }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                            stroke={dragOver ? 'var(--green)' : 'var(--text-muted)'}
                            strokeWidth="1.5" strokeLinecap="round"
                            style={{ margin: '0 auto 8px' }}>
                            <polyline points="16 16 12 12 8 16"/>
                            <line x1="12" y1="12" x2="12" y2="21"/>
                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                          </svg>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                            {dragOver ? 'Drop image here' : 'Click or drag to upload cover image'}
                          </p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                            PNG, JPG, GIF — Max 8MB
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}

                {/* Tags section */}
                <div style={{ borderTop: '1px solid var(--gray-2)', padding: 20 }}>
                  <label style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: 'var(--dark)',
                    marginBottom: 10,
                  }}>
                    Tags{' '}
                    <span style={{ color: 'var(--danger)' }}>*</span>
                    {' '}
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                      — helps people find your post ({tags.length}/8)
                    </span>
                  </label>

                  {/* Selected tags */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginBottom: 10,
                    minHeight: 36,
                    alignItems: 'center',
                  }}>
                    {tags.map(function(tag) {
                      return (
                        <span key={tag} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: activeType.bg,
                          color: activeType.color,
                          padding: '5px 12px',
                          borderRadius: 100,
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          border: '1px solid ' + activeType.color + '40',
                        }}>
                          #{tag}
                          <button
                            type="button"
                            onClick={function() { removeTag(tag); }}
                            aria-label={'Remove tag ' + tag}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: activeType.color,
                              padding: 0,
                              fontSize: '1rem',
                              lineHeight: 1,
                              cursor: 'pointer',
                            }}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}

                    {tags.length < 8 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="text"
                          value={tagInput}
                          onChange={function(e) { setTagInput(e.target.value); }}
                          onKeyDown={function(e) {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          placeholder={tags.length === 0 ? 'Add tags (e.g. javascript, react)…' : 'Add more…'}
                          style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.88rem',
                            minWidth: 160,
                            background: 'transparent',
                            fontFamily: 'inherit',
                          }}
                          aria-label="Add tag"
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={addTag}
                          style={{ flexShrink: 0 }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Popular tags */}
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                      Suggested:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {POPULAR_TAGS.filter(function(t) {
                        return !tags.includes(t);
                      }).slice(0, 14).map(function(tag) {
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={function() { addPopularTag(tag); }}
                            disabled={tags.length >= 8}
                            style={{
                              padding: '3px 10px',
                              borderRadius: 100,
                              border: '1px solid var(--gray-2)',
                              background: 'var(--white)',
                              cursor: tags.length >= 8 ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              transition: 'all 0.15s',
                              opacity: tags.length >= 8 ? 0.5 : 1,
                            }}
                            onMouseEnter={function(e) {
                              if (tags.length < 8) {
                                e.currentTarget.style.borderColor = activeType.color;
                                e.currentTarget.style.color = activeType.color;
                              }
                            }}
                            onMouseLeave={function(e) {
                              e.currentTarget.style.borderColor = 'var(--gray-2)';
                              e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                          >
                            +{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════
                PREVIEW MODE
            ══════════════════════════ */}
            {mode === 'preview' && (
              <div style={{
                background: 'var(--white)',
                border: '1px solid var(--gray-2)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                marginBottom: 16,
              }}>
                <div style={{
                  padding: '14px 24px',
                  borderBottom: '1px solid var(--gray-2)',
                  background: 'var(--gray)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>
                    Preview — {activeType.label}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {readingTime(body)} min read · {words} words
                  </span>
                </div>

                <div style={{ padding: 24 }}>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Cover"
                      style={{
                        width: '100%',
                        maxHeight: 280,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 20,
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span style={{
                      background: activeType.bg,
                      color: activeType.color,
                      padding: '3px 10px',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>
                      {activeType.label}
                    </span>
                    {tags.map(function(t) {
                      return (
                        <span key={t} style={{
                          background: 'var(--gray)',
                          color: 'var(--dark)',
                          padding: '3px 10px',
                          borderRadius: 100,
                          fontSize: '0.75rem',
                        }}>
                          #{t}
                        </span>
                      );
                    })}
                  </div>

                  <h1 style={{
                    fontSize: 'clamp(1.2rem, 3vw, 1.7rem)',
                    fontWeight: 800,
                    color: 'var(--dark)',
                    lineHeight: 1.3,
                    marginBottom: 20,
                  }}>
                    {title || (
                      <span style={{ color: 'var(--gray-3)' }}>Untitled post…</span>
                    )}
                  </h1>

                  {body && (
                    <div className="article-content" style={{ whiteSpace: 'pre-wrap' }}>
                      {body}
                    </div>
                  )}

                  {code && (
                    <div style={{
                      position: 'relative',
                      borderRadius: 8,
                      overflow: 'hidden',
                      marginTop: 20,
                    }}>
                      <div style={{
                        background: '#161b22',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <span style={{ color: '#8b949e', fontSize: '0.78rem' }}>{lang}</span>
                        <span style={{ color: '#484f58', fontSize: '0.72rem' }}>
                          {code.split('\n').length} lines
                        </span>
                      </div>
                      <pre style={{
                        background: '#0d1117',
                        color: '#c9d1d9',
                        padding: 16,
                        margin: 0,
                        overflowX: 'auto',
                        fontSize: '0.875rem',
                        lineHeight: 1.7,
                        fontFamily: 'monospace',
                      }}>
                        <code dangerouslySetInnerHTML={{ __html: getPreviewCode() }} />
                      </pre>
                    </div>
                  )}

                  {!title && !body && !code && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                        style={{ margin: '0 auto 12px' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <p>Start writing to see a preview here</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── BOTTOM SUBMIT BUTTON ── */}
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleSubmit}
              disabled={submitting || uploadingImg}
              style={{ padding: 14, fontSize: '1rem', borderRadius: 'var(--radius)' }}
            >
              {submitting
                ? (
                  <>
                    <span className="loading-spinner" />
                    Publishing your post…
                  </>
                )
                : uploadingImg
                ? (
                  <>
                    <span className="loading-spinner" />
                    Uploading image…
                  </>
                )
                : '🚀 Publish to BSDC'
              }
            </button>

            {/* Clear draft link */}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                type="button"
                onClick={clearDraft}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', fontSize: '0.8rem',
                  cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Clear and start over
              </button>
            </div>
          </div>

          {/* ══════════════════════════
              RIGHT — SIDEBAR
          ══════════════════════════ */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* SEO Score */}
            <SEOScoreMeter
              score={seoScore}
              title={title}
              body={body}
              tags={tags}
            />

            {/* Post summary */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-2)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 16px',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'var(--dark)',
                borderBottom: '1px solid var(--gray-2)',
                background: 'var(--gray)',
              }}>
                Post Summary
              </div>
              <div style={{ padding: '14px 16px' }}>
                {[
                  { label: 'Type',      value: activeType.label },
                  { label: 'Title',     value: title.length + ' chars' },
                  { label: 'Content',   value: body.length + ' chars' },
                  { label: 'Words',     value: words },
                  { label: 'Read time', value: '~' + readingTime(body) + ' min' },
                  { label: 'Tags',      value: tags.length + '/8' },
                  { label: 'Code',      value: code ? lang : 'None' },
                  { label: 'Image',     value: imagePreview ? 'Yes' : 'No' },
                  { label: 'SEO',       value: seoScore + '/100' },
                ].map(function(item) {
                  return (
                    <div key={item.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      marginBottom: 8,
                      alignItems: 'center',
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Writing tips */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-2)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}>
              <button
                type="button"
                onClick={function() { setTipExpanded(function(p) { return !p; }); }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: activeType.bg,
                  color: activeType.color,
                  border: 'none',
                  borderBottom: tipExpanded ? '1px solid ' + activeType.color + '30' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {activeType.icon} {activeType.label} Tips
                </span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transform: tipExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {tipExpanded && (
                <div style={{ padding: '14px 16px' }}>
                  {(TIPS[type] || TIPS.post).map(function(tip, i) {
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        gap: 8,
                        marginBottom: 10,
                        fontSize: '0.82rem',
                        alignItems: 'flex-start',
                      }}>
                        <div style={{
                          width: 20, height: 20,
                          borderRadius: '50%',
                          background: activeType.bg,
                          color: activeType.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: 1,
                        }}>
                          {i + 1}
                        </div>
                        <span style={{ color: 'var(--text)', lineHeight: 1.5 }}>
                          {tip}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Writing guide toggle */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-2)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}>
              <button
                type="button"
                onClick={function() { setShowGuide(function(p) { return !p; }); }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: 'var(--white)',
                  color: 'var(--dark)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--green)" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  BSDC Writing Guide
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transform: showGuide ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {showGuide && (
                <div style={{
                  padding: '14px 16px',
                  borderTop: '1px solid var(--gray-2)',
                  fontSize: '0.82rem',
                  color: 'var(--text)',
                  lineHeight: 1.7,
                }}>
                  <p style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 8 }}>
                    How to rank on Google with BSDC:
                  </p>
                  {[
                    'Use the exact keyword in your title that people search for',
                    'Write in both English and বাংলা for bilingual ranking',
                    'Aim for 800+ words for comprehensive blog posts',
                    'Add 5-8 relevant tags covering all related terms',
                    'Ask a clear question — Google loves Q&A format',
                    'Add code examples — rare content ranks higher',
                    'Include context: country, framework version, error message',
                    'Link to related BSDC posts in your content',
                  ].map(function(g, i) {
                    return (
                      <div key={i} style={{
                        display: 'flex', gap: 7,
                        marginBottom: 7, alignItems: 'flex-start',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="var(--green)" strokeWidth="3" strokeLinecap="round"
                          style={{ flexShrink: 0, marginTop: 4 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>{g}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Community guidelines */}
            <div style={{
              background: 'var(--green-bg)',
              border: '1px solid rgba(0,106,78,0.2)',
              borderRadius: 'var(--radius)',
              padding: '14px 16px',
            }}>
              <p style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--green)',
                marginBottom: 8,
              }}>
                BSDC Community Guidelines
              </p>
              {[
                'Be respectful and constructive',
                'No spam or self-promotion only',
                'Credit sources and authors',
                'Use English or বাংলা',
                'Keep content developer-related',
                'No plagiarism — original content only',
              ].map(function(g, i) {
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 6,
                    fontSize: '0.78rem',
                    color: '#004d38',
                    marginBottom: 5,
                    alignItems: 'flex-start',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="var(--green)" strokeWidth="3" strokeLinecap="round"
                      style={{ flexShrink: 0, marginTop: 3 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {g}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
          main > div:last-child > aside {
            order: -1;
          }
        }
      `}</style>
    </>
  );
}
