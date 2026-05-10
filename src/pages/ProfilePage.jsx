import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  db, getUserProfile, uploadToImgBB
} from '../firebase';
import {
  collection, query, where, orderBy,
  limit, getDocs, startAfter,
  doc, updateDoc, getDoc, increment
} from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { SkeletonList } from '../components/Skeleton';
import IDCard from '../components/IDCard';
import PostCard from '../components/PostCard';

/* ─────────────────────────────────────────────
   SVG ICON LIBRARY
───────────────────────────────────────────── */
const Icon = {
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Github: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  Globe: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Location: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Share: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  Star: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Camera: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Trophy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="18" width="12" height="4"/>
    </svg>
  ),
  Code: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  Post: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Question: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Up: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Add: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function timeAgo(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDate(ts) {
  if (!ts) return 'Unknown';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-BD', { year: 'numeric', month: 'long' });
}

function getRepBadge(rep) {
  if (rep >= 10000) return { label: 'Legend', color: '#F59E0B', bg: '#FEF3C7' };
  if (rep >= 5000)  return { label: 'Expert', color: '#8B5CF6', bg: '#EDE9FE' };
  if (rep >= 1000)  return { label: 'Pro', color: '#006A4E', bg: '#f0faf6' };
  if (rep >= 500)   return { label: 'Advanced', color: '#0284C7', bg: '#E0F2FE' };
  if (rep >= 100)   return { label: 'Regular', color: '#64748B', bg: '#F1F5F9' };
  return { label: 'Newcomer', color: '#94A3B8', bg: '#F8FAFC' };
}

const TYPE_COLORS = {
  qa:      { bg: '#EDE9FE', color: '#7C3AED', label: 'Q&A' },
  blog:    { bg: '#DBEAFE', color: '#1E40AF', label: 'Blog' },
  wiki:    { bg: '#FEF3C7', color: '#92400E', label: 'Wiki' },
  snippet: { bg: '#D1FAE5', color: '#065F46', label: 'Code' },
  project: { bg: '#FFE4E6', color: '#9F1239', label: 'Project' },
  post:    { bg: '#F1F5F9', color: '#475569', label: 'Post' },
};

/* ─────────────────────────────────────────────
   PROFILE SKELETON
───────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div style={{ background: 'var(--white)' }}>
      {/* Cover skeleton */}
      <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
      <div style={{ padding: '0 24px 24px', position: 'relative' }}>
        <div className="skeleton" style={{
          width: 100, height: 100, borderRadius: '50%',
          position: 'absolute', top: -50, left: 24,
          border: '4px solid var(--white)',
        }} />
        <div style={{ paddingTop: 60 }}>
          <div className="skeleton skeleton-title" style={{ width: '35%' }} />
          <div className="skeleton skeleton-text" style={{ width: '25%' }} />
          <div className="skeleton skeleton-text" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD COMPONENT
───────────────────────────────────────────── */
function StatCard({ icon, value, label, color = 'var(--green)', sublabel }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-2)',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'var(--transition)',
      flex: 1,
      minWidth: 130,
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: '0.7rem', color, fontWeight: 600, marginTop: 2 }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ACTIVITY HEATMAP (GitHub-style)
───────────────────────────────────────────── */
function ActivityHeatmap({ posts }) {
  const weeks = 20;
  const days  = 7;
  const now   = new Date();

  const countMap = {};
  posts.forEach(p => {
    const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
    const key = d.toISOString().split('T')[0];
    countMap[key] = (countMap[key] || 0) + 1;
  });

  const cells = [];
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < days; d++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (w * 7 + (days - 1 - d)));
      const key   = date.toISOString().split('T')[0];
      const count = countMap[key] || 0;
      const opacity = count === 0 ? 0.06
        : count === 1 ? 0.3
        : count === 2 ? 0.55
        : count >= 3  ? 0.85 : 0.06;
      cells.push({ key, count, opacity, date });
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateRows: `repeat(${days}, 12px)`,
        gridAutoFlow: 'column',
        gap: 3,
        width: 'fit-content',
        minWidth: '100%',
      }}>
        {cells.map((cell, i) => (
          <div
            key={i}
            title={`${cell.key}: ${cell.count} post${cell.count !== 1 ? 's' : ''}`}
            style={{
              width: 12, height: 12,
              borderRadius: 2,
              background: `rgba(0,106,78,${cell.opacity})`,
              cursor: 'default',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 8, alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Less</span>
        {[0.06, 0.3, 0.55, 0.85].map((o, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: `rgba(0,106,78,${o})` }} />
        ))}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MINI POST CARD (for profile feed)
───────────────────────────────────────────── */
function MiniPostCard({ post }) {
  const type  = TYPE_COLORS[post.type] || TYPE_COLORS.post;
  const slug  = post.slug || post.id;
  const date  = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

  return (
    <article
      style={{
        background: 'var(--white)',
        border: '1px solid var(--gray-2)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: 10,
        transition: 'var(--transition)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => window.location.href = `/post/${slug}`}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor  = 'var(--green)';
        e.currentTarget.style.boxShadow    = 'var(--shadow-md)';
        e.currentTarget.style.transform    = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor  = 'var(--gray-2)';
        e.currentTarget.style.boxShadow    = '';
        e.currentTarget.style.transform    = '';
      }}
      itemScope itemType="https://schema.org/Article"
    >
      {/* Left accent */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, background: type.color,
        borderRadius: '3px 0 0 3px',
      }} />

      <div style={{ paddingLeft: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: type.bg, color: type.color,
            padding: '2px 8px', borderRadius: 4,
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {type.label}
          </span>
          {post.solved && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: '#D1FAE5', color: '#065F46',
              padding: '2px 8px', borderRadius: 4,
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              <Icon.Check /> Solved
            </span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {timeAgo(post.createdAt)}
          </span>
        </div>

        <h3 style={{
          fontSize: '0.97rem', fontWeight: 700,
          color: 'var(--dark)', marginBottom: 6, lineHeight: 1.4,
        }} itemProp="headline">
          <Link
            to={`/post/${slug}`}
            style={{ color: 'inherit' }}
            onClick={e => e.stopPropagation()}
          >
            {post.title}
          </Link>
        </h3>

        {post.body && (
          <p style={{
            fontSize: '0.83rem', color: 'var(--text-muted)',
            lineHeight: 1.5, marginBottom: 10,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {post.body.replace(/<[^>]+>/g, '').slice(0, 140)}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {post.tags?.slice(0, 3).map(tag => (
            <Link
              key={tag}
              to={`/post?tag=${encodeURIComponent(tag)}`}
              style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 500 }}
              onClick={e => e.stopPropagation()}
            >
              #{tag}
            </Link>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Icon.Up /> {post.upvotes || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Icon.Eye /> {post.views || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   EDIT PROFILE PANEL
───────────────────────────────────────────── */
function EditProfilePanel({ profile, onSave, onCancel }) {
  const { updateUserProfile } = useAuth();
  const [form, setForm]           = useState({
    displayName: profile?.displayName || '',
    bio:         profile?.bio         || '',
    location:    profile?.location    || 'Bangladesh',
    github:      profile?.github      || '',
    linkedin:    profile?.linkedin    || '',
    website:     profile?.website     || '',
    skills:      profile?.skills      || [],
    coverImage:  profile?.coverImage  || '',
  });
  const [skillInput,  setSkillInput]  = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [avatarFile,  setAvatarFile]  = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.photoURL || '');
  const [coverFile,   setCoverFile]   = useState(null);
  const [coverPreview, setCoverPreview] = useState(profile?.coverImage || '');
  const [uploading,   setUploading]   = useState(false);
  const avatarRef = useRef(null);
  const coverRef  = useRef(null);

  const set = k => v => setForm(p => ({ ...p, [k]: typeof v === 'object' && v.target ? v.target.value : v }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s) || form.skills.length >= 12) return;
    setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };

  const handleAvatarChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setAvatarFile(f);
    const r = new FileReader();
    r.onload = () => setAvatarPreview(r.result);
    r.readAsDataURL(f);
  };

  const handleCoverChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { setError('Cover image must be under 8MB'); return; }
    setCoverFile(f);
    const r = new FileReader();
    r.onload = () => setCoverPreview(r.result);
    r.readAsDataURL(f);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.displayName.trim()) { setError('Display name is required'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      let photoURL    = profile?.photoURL   || '';
      let coverImage  = form.coverImage     || '';

      if (avatarFile) {
        setUploading(true);
        photoURL = await uploadToImgBB(avatarFile);
      }
      if (coverFile) {
        setUploading(true);
        coverImage = await uploadToImgBB(coverFile);
      }
      setUploading(false);

      await updateUserProfile({
        displayName: form.displayName.trim(),
        bio:         form.bio.trim(),
        location:    form.location.trim(),
        github:      form.github.trim(),
        linkedin:    form.linkedin.trim(),
        website:     form.website.trim(),
        skills:      form.skills,
        coverImage,
        ...(photoURL ? { photoURL } : {}),
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => { onSave(); }, 1200);
    } catch (e) {
      setError('Failed to save. Please try again.');
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15,23,42,0.7)',
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center',
      overflowY: 'auto',
      padding: '24px 16px',
      backdropFilter: 'blur(4px)',
    }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: 560,
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        animation: 'slideIn 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--gray-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, var(--dark), #0f172a)',
          color: 'var(--white)',
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Edit Profile</h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 2 }}>
              Update your BSDC developer profile
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: 8, cursor: 'pointer' }}
            aria-label="Close"
          >
            <Icon.Close />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {/* Alerts */}
          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: '0.87rem', color: 'var(--danger)', marginBottom: 16 }} role="alert">
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 14px', fontSize: '0.87rem', color: 'var(--success)', marginBottom: 16 }} role="alert">
              ✓ {success}
            </div>
          )}

          {/* Avatar Upload */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, padding: '16px', background: 'var(--gray)', borderRadius: 'var(--radius)' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green)' }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'white', border: '3px solid var(--green)' }}>
                  {profile?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--green)', border: '2px solid white', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                aria-label="Change profile photo"
              >
                <Icon.Camera />
              </button>
            </div>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--dark)', marginBottom: 4 }}>Profile Photo</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => avatarRef.current?.click()}>
                {uploading ? 'Uploading…' : 'Upload Photo'}
              </button>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>PNG, JPG up to 5MB</p>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          {/* Cover Image */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Cover / Banner Image</label>
            <div
              style={{
                height: 90, borderRadius: 'var(--radius-sm)',
                border: '2px dashed var(--gray-2)',
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                background: coverPreview ? 'transparent' : 'var(--gray)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onClick={() => coverRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Click to upload cover image (1200×400 recommended)
                </span>
              )}
            </div>
            <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="ep-name">Display Name *</label>
            <input id="ep-name" type="text" className="form-input" value={form.displayName} onChange={set('displayName')} required maxLength={50} />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label" htmlFor="ep-bio">Bio</label>
            <textarea id="ep-bio" className="form-textarea" value={form.bio} onChange={set('bio')} placeholder="Tell the BSDC community about yourself…" rows={3} maxLength={300} />
            <div className="form-hint">{form.bio.length}/300</div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="ep-loc">Location</label>
            <input id="ep-loc" type="text" className="form-input" value={form.location} onChange={set('location')} placeholder="Dhaka, Bangladesh" />
          </div>

          {/* Social Links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="ep-gh">GitHub Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Icon.Github />
                </span>
                <input id="ep-gh" type="text" className="form-input" style={{ paddingLeft: 34 }} value={form.github} onChange={set('github')} placeholder="username" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="ep-li">LinkedIn Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Icon.LinkedIn />
                </span>
                <input id="ep-li" type="text" className="form-input" style={{ paddingLeft: 34 }} value={form.linkedin} onChange={set('linkedin')} placeholder="username" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ep-web">Website URL</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Icon.Globe />
              </span>
              <input id="ep-web" type="url" className="form-input" style={{ paddingLeft: 34 }} value={form.website} onChange={set('website')} placeholder="https://yoursite.com" />
            </div>
          </div>

          {/* Skills */}
          <div className="form-group">
            <label className="form-label">Skills (max 12)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" className="form-input"
                value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="React, Python, DevOps…"
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={addSkill} style={{ whiteSpace: 'nowrap' }}>
                <Icon.Add />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {form.skills.map(sk => (
                <span key={sk} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--green-bg)', color: 'var(--green)', padding: '4px 10px', borderRadius: 100, fontSize: '0.82rem', fontWeight: 600 }}>
                  {sk}
                  <button type="button" onClick={() => setForm(p => ({ ...p, skills: p.skills.filter(s => s !== sk) }))} style={{ background: 'none', color: 'var(--green)', padding: 0, fontSize: '1rem', lineHeight: 1, cursor: 'pointer' }} aria-label={`Remove ${sk}`}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--gray-2)', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving || uploading}>
              {saving || uploading
                ? <><span className="loading-spinner" /> {uploading ? 'Uploading…' : 'Saving…'}</>
                : 'Save Profile'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PROFILE PAGE
───────────────────────────────────────────── */
const PAGE_SIZE = 10;

export default function ProfilePage() {
  const { uid }                                     = useParams();
  const { user, profile: myProfile }                = useAuth();
  const navigate                                    = useNavigate();

  /* State */
  const [profile,     setProfile]     = useState(null);
  const [posts,       setPosts]       = useState([]);
  const [allPosts,    setAllPosts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [postsLoading,setPostsLoading]= useState(true);
  const [activeTab,   setActiveTab]   = useState('posts');
  const [postFilter,  setPostFilter]  = useState('all');
  const [editOpen,    setEditOpen]    = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [lastDoc,     setLastDoc]     = useState(null);
  const [hasMore,     setHasMore]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [postStats,   setPostStats]   = useState({});

  const isOwn = user?.uid === uid;

  /* ── Load profile ─────────────────────────── */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const prof = await getUserProfile(uid);
      if (mounted) {
        setProfile(prof);
        setLoading(false);
      }
    };
    if (uid) load();
    return () => { mounted = false; };
  }, [uid]);

  /* ── Load posts — FIXED QUERY ─────────────── */
  useEffect(() => {
    let mounted = true;
    const loadPosts = async () => {
      if (!uid) return;
      setPostsLoading(true);
      setPosts([]);
      setAllPosts([]);

      try {
        /*
         * FIX: Query by authorId with orderBy createdAt.
         * This requires the composite index:
         *   authorId ASC + createdAt DESC
         * which is included in firestore.indexes.json
         */
        const q = query(
          collection(db, 'posts'),
          where('authorId', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(100)          // load up to 100 for stats
        );

        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (mounted) {
          setAllPosts(data);

          /* Compute per-type stats */
          const stats = { total: data.length, totalUpvotes: 0, totalViews: 0 };
          data.forEach(p => {
            stats[p.type] = (stats[p.type] || 0) + 1;
            stats.totalUpvotes += (p.upvotes || 0);
            stats.totalViews   += (p.views   || 0);
          });
          setPostStats(stats);

          /* Show first PAGE_SIZE posts */
          setPosts(data.slice(0, PAGE_SIZE));
          setHasMore(data.length > PAGE_SIZE);
          setLastDoc(data.length);   // use index as cursor
        }
      } catch (err) {
        console.error('Posts load error:', err);
        /*
         * If index doesn't exist yet, try simpler query
         * (no orderBy) and sort client-side
         */
        try {
          const fallback = query(
            collection(db, 'posts'),
            where('authorId', '==', uid),
            limit(100)
          );
          const snap2 = await getDocs(fallback);
          const data2 = snap2.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
              const ta = a.createdAt?.toDate?.()?.getTime() || 0;
              const tb = b.createdAt?.toDate?.()?.getTime() || 0;
              return tb - ta;
            });

          if (mounted) {
            setAllPosts(data2);
            const stats = { total: data2.length, totalUpvotes: 0, totalViews: 0 };
            data2.forEach(p => {
              stats[p.type] = (stats[p.type] || 0) + 1;
              stats.totalUpvotes += (p.upvotes || 0);
              stats.totalViews   += (p.views   || 0);
            });
            setPostStats(stats);
            setPosts(data2.slice(0, PAGE_SIZE));
            setHasMore(data2.length > PAGE_SIZE);
          }
        } catch (err2) {
          console.error('Fallback query failed:', err2);
        }
      }

      if (mounted) setPostsLoading(false);
    };

    loadPosts();
    return () => { mounted = false; };
  }, [uid]);

  /* ── Filter posts by type ─────────────────── */
  const filteredPosts = postFilter === 'all'
    ? allPosts
    : allPosts.filter(p => p.type === postFilter);

  const displayedPosts = filteredPosts.slice(0, posts.length);

  const loadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const next = posts.length + PAGE_SIZE;
    const newSlice = filteredPosts.slice(0, next);
    setPosts(prev => {
      const shown = allPosts.slice(0, next);
      setHasMore(filteredPosts.length > next);
      return shown;
    });
    setLoadingMore(false);
  };

  /* ── Share profile ────────────────────────── */
  const handleShare = async () => {
    const url = `https://www.bsdc.info.bd/profile/${uid}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName} — BSDC Developer`,
          text:  `Check out ${profile?.displayName}'s profile on BSDC!`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  /* ── After edit save ──────────────────────── */
  const handleEditSave = async () => {
    setEditOpen(false);
    const prof = await getUserProfile(uid);
    setProfile(prof);
  };

  /* ── Loading state ────────────────────────── */
  if (loading) return (
    <div style={{ background: 'var(--gray)', minHeight: '100vh' }}>
      <ProfileSkeleton />
      <div className="container" style={{ padding: '24px 16px' }}>
        <SkeletonList count={4} />
      </div>
    </div>
  );

  /* ── Not found ────────────────────────────── */
  if (!profile) return (
    <main style={{ textAlign: 'center', padding: '80px 16px' }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ margin: '0 auto 20px' }}>
        <circle cx="40" cy="40" r="38" fill="var(--green-bg)" stroke="var(--green)" strokeWidth="2"/>
        <text x="40" y="46" textAnchor="middle" fontFamily="Inter" fontSize="20" fontWeight="700" fill="var(--green)">404</text>
      </svg>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>Developer Not Found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This profile does not exist on BSDC.</p>
      <Link to="/" className="btn btn-primary">← Back to BSDC</Link>
    </main>
  );

  /* ── Derived values ───────────────────────── */
  const profileUrl  = `https://www.bsdc.info.bd/profile/${uid}`;
  const repBadge    = getRepBadge(profile.reputation || 0);
  const joinDate    = formatDate(profile.joinedAt);
  const memberNum   = `BSDC-${uid.replace(/[^0-9]/g, '').slice(0, 6).padStart(6, '0')}`;
  const publishDate = profile.joinedAt?.toDate?.()?.toISOString() || new Date().toISOString();

  /* ── JSON-LD ──────────────────────────────── */
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type':    'ProfilePage',
    dateCreated:  publishDate,
    dateModified: new Date().toISOString(),
    url:          profileUrl,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'BSDC', item: 'https://www.bsdc.info.bd' },
        { '@type': 'ListItem', position: 2, name: 'Developers', item: 'https://www.bsdc.info.bd/profile' },
        { '@type': 'ListItem', position: 3, name: profile.displayName, item: profileUrl },
      ],
    },
    mainEntity: {
      '@type':       'Person',
      '@id':         profileUrl,
      name:          profile.displayName,
      description:   profile.bio || `${profile.displayName} is a software developer on BSDC — Bangladesh Software Development Community.`,
      url:           profileUrl,
      image:         profile.photoURL || 'https://www.bsdc.info.bd/og-image.png',
      jobTitle:      profile.role === 'admin' ? 'Admin, BSDC' : 'Software Developer',
      worksFor: {
        '@type': 'Organization',
        name:    'Bangladesh Software Development Community',
        url:     'https://www.bsdc.info.bd',
      },
      memberOf: {
        '@type': 'Organization',
        name:    'Bangladesh Software Development Community',
        url:     'https://www.bsdc.info.bd',
      },
      address: {
        '@type':           'PostalAddress',
        addressLocality:   profile.location || 'Bangladesh',
        addressCountry:    'BD',
      },
      knowsAbout:   profile.skills || [],
      nationality:  'Bangladeshi',
      sameAs: [
        profile.github   ? `https://github.com/${profile.github}`     : null,
        profile.linkedin ? `https://linkedin.com/in/${profile.linkedin}` : null,
        profile.website  || null,
      ].filter(Boolean),
      interactionStatistic: [
        {
          '@type':                    'InteractionCounter',
          interactionType:            'https://schema.org/WriteAction',
          userInteractionCount:       postStats.total || 0,
        },
      ],
    },
  };

  /* ── Tabs config ──────────────────────────── */
  const TABS = [
    { key: 'posts',   label: 'Posts',   count: postStats.total || 0 },
    { key: 'id-card', label: 'ID Card', count: null },
    ...(isOwn ? [{ key: 'edit', label: 'Edit Profile', count: null }] : []),
  ];

  /* ── POST FILTER TABS ─────────────────────── */
  const POST_FILTERS = [
    { key: 'all',     label: 'All',     count: postStats.total     || 0 },
    { key: 'qa',      label: 'Q&A',     count: postStats.qa        || 0 },
    { key: 'blog',    label: 'Blog',    count: postStats.blog      || 0 },
    { key: 'wiki',    label: 'Wiki',    count: postStats.wiki      || 0 },
    { key: 'snippet', label: 'Code',    count: postStats.snippet   || 0 },
    { key: 'project', label: 'Projects',count: postStats.project   || 0 },
  ].filter(f => f.key === 'all' || f.count > 0);

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <>
      <Helmet>
        <title>BSDC — {profile.displayName} | Bangladesh Software Development Community</title>
        <meta name="description" content={
          `${profile.displayName}'s developer profile on BSDC. ${profile.bio || `${profile.displayName} is a software developer from ${profile.location || 'Bangladesh'}.`} Skills: ${profile.skills?.slice(0, 5).join(', ') || 'Software Development'}. ${postStats.total || 0} posts, ${profile.reputation || 0} reputation on Bangladesh Software Development Community.`
        } />
        <meta name="keywords" content={
          `${profile.displayName}, BSDC developer profile, Bangladesh software developer, ${profile.skills?.join(', ') || ''}, BSDC ${profile.displayName}, developer Bangladesh, programmer Bangladesh, ${profile.location || 'Bangladesh'} developer`
        } />
        <meta name="author"              content={profile.displayName} />
        <meta property="og:type"         content="profile" />
        <meta property="og:title"        content={`BSDC — ${profile.displayName} | Bangladesh Software Development Community`} />
        <meta property="og:description"  content={profile.bio || `${profile.displayName} — Developer on BSDC, Bangladesh's #1 software development community.`} />
        <meta property="og:image"        content={profile.photoURL || 'https://www.bsdc.info.bd/og-image.png'} />
        <meta property="og:url"          content={profileUrl} />
        <meta property="profile:username" content={profile.displayName} />
        <meta name="twitter:card"        content="summary" />
        <meta name="twitter:title"       content={`BSDC — ${profile.displayName}`} />
        <meta name="twitter:description" content={profile.bio || `${profile.displayName} — Developer on BSDC`} />
        <meta name="twitter:image"       content={profile.photoURL || 'https://www.bsdc.info.bd/og-image.png'} />
        <link rel="canonical"            href={profileUrl} />
        <script type="application/ld+json">{JSON.stringify(personJsonLd)}</script>
      </Helmet>

      {/* Edit Modal */}
      {editOpen && (
        <EditProfilePanel
          profile={profile}
          onSave={handleEditSave}
          onCancel={() => setEditOpen(false)}
        />
      )}

      <main role="main" style={{ background: 'var(--gray)', minHeight: '100vh' }}>

        {/* ── COVER IMAGE ── */}
        <div style={{
          height: 220,
          background: profile.coverImage
            ? `url(${profile.coverImage}) center/cover no-repeat`
            : 'linear-gradient(135deg, #0f172a 0%, #006A4E 50%, #004d38 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Pattern overlay */}
          {!profile.coverImage && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236EE7B7' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          )}
          {/* Gradient overlay at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 80,
            background: 'linear-gradient(to top, rgba(15,23,42,0.6), transparent)',
          }} />
        </div>

        {/* ── PROFILE HEADER CARD ── */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            padding: '0 24px 24px',
            marginBottom: 20,
            position: 'relative',
          }}>
            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ position: 'relative', marginTop: -50 }}>
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={`${profile.displayName} — BSDC Developer`}
                    style={{
                      width: 100, height: 100,
                      borderRadius: 16,
                      border: '4px solid var(--white)',
                      objectFit: 'cover',
                      boxShadow: 'var(--shadow-lg)',
                      background: 'var(--gray-2)',
                    }}
                    loading="eager"
                    itemProp="image"
                  />
                ) : (
                  <div style={{
                    width: 100, height: 100,
                    borderRadius: 16,
                    border: '4px solid var(--white)',
                    background: 'linear-gradient(135deg, #004d38, #006A4E)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.8rem', fontWeight: 900, color: '#6EE7B7',
                    boxShadow: 'var(--shadow-lg)',
                  }}>
                    {profile.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {/* Online indicator */}
                <div style={{
                  position: 'absolute', bottom: 4, right: 4,
                  width: 14, height: 14,
                  background: '#22C55E',
                  border: '2px solid var(--white)',
                  borderRadius: '50%',
                }} title="Online" />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 12, flexWrap: 'wrap' }}>
                {isOwn && (
                  <button className="btn btn-outline btn-sm" onClick={() => setEditOpen(true)}>
                    <Icon.Edit /> Edit Profile
                  </button>
                )}
                <button className="btn btn-outline btn-sm" onClick={handleShare}>
                  {copied ? <><Icon.Check /> Copied!</> : <><Icon.Share /> Share</>}
                </button>
                {isOwn && (
                  <Link to="/create" className="btn btn-primary btn-sm">
                    + New Post
                  </Link>
                )}
              </div>
            </div>

            {/* Name + Role */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 900, color: 'var(--dark)', lineHeight: 1.1 }} itemProp="name">
                  {profile.displayName}
                </h1>
                {/* Verified badge */}
                <span title="Verified BSDC Member" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'var(--green)', color: 'white', padding: '2px 8px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 }}>
                  <Icon.Check /> BSDC
                </span>
                {profile.role === 'admin' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: '#7C3AED', color: 'white', padding: '2px 8px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 }}>
                    ⚡ Admin
                  </span>
                )}
                {profile.role === 'moderator' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: '#0284C7', color: 'white', padding: '2px 8px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 }}>
                    🛡️ Mod
                  </span>
                )}
                {/* Rep badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  background: repBadge.bg, color: repBadge.color,
                  padding: '2px 10px', borderRadius: 100,
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  <Icon.Star /> {repBadge.label}
                </span>
              </div>

              {/* Member ID */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                {memberNum}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p style={{
                  color: 'var(--text)', fontSize: '0.95rem',
                  lineHeight: 1.7, marginTop: 10, maxWidth: 600,
                }} itemProp="description">
                  {profile.bio}
                </p>
              )}

              {/* Meta row */}
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                {profile.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Icon.Location /> {profile.location}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Icon.Calendar /> Joined {joinDate}
                </span>
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--dark)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Icon.Github /> {profile.github}
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0077B5'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Icon.LinkedIn /> LinkedIn
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Icon.Globe /> Website
                  </a>
                )}
              </div>

              {/* Skills */}
              {profile.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                  {profile.skills.map(skill => (
                    <Link
                      key={skill}
                      to={`/post?tag=${encodeURIComponent(skill)}`}
                      style={{
                        display: 'inline-block',
                        background: 'var(--green-bg)', color: 'var(--green)',
                        padding: '4px 12px', borderRadius: 100,
                        fontSize: '0.8rem', fontWeight: 600,
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--green-bg)'; e.currentTarget.style.color = 'var(--green)'; }}
                    >
                      {skill}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatCard
              icon={<Icon.Post />}
              value={postStats.total || 0}
              label="Total Posts"
              color="var(--green)"
            />
            <StatCard
              icon={<Icon.Up />}
              value={postStats.totalUpvotes || 0}
              label="Upvotes Received"
              color="#7C3AED"
            />
            <StatCard
              icon={<Icon.Eye />}
              value={postStats.totalViews || 0}
              label="Total Views"
              color="#0284C7"
            />
            <StatCard
              icon={<Icon.Trophy />}
              value={profile.reputation || 0}
              label="Reputation"
              sublabel={repBadge.label}
              color={repBadge.color}
            />
          </div>

          {/* ── MAIN TABS ── */}
          <div style={{
            display: 'flex', gap: 0,
            background: 'var(--white)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--gray-2)',
            overflow: 'hidden',
            marginBottom: 20,
          }} role="tablist">
            {TABS.map(tab => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: '14px 8px',
                  border: 'none',
                  borderBottom: `3px solid ${activeTab === tab.key ? 'var(--green)' : 'transparent'}`,
                  background: activeTab === tab.key ? 'var(--green-bg)' : 'var(--white)',
                  color: activeTab === tab.key ? 'var(--green)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.88rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    background: activeTab === tab.key ? 'var(--green)' : 'var(--gray-2)',
                    color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                    borderRadius: 100, padding: '1px 7px', fontSize: '0.72rem',
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ════════════════════════
              TAB: POSTS
          ════════════════════════ */}
          {activeTab === 'posts' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
              <div>
                {/* Activity Heatmap */}
                {allPosts.length > 0 && (
                  <div style={{
                    background: 'var(--white)', border: '1px solid var(--gray-2)',
                    borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 16,
                  }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon.Post /> Activity — Last 20 Weeks
                    </h2>
                    <ActivityHeatmap posts={allPosts} />
                  </div>
                )}

                {/* Post type filter */}
                {allPosts.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {POST_FILTERS.map(f => (
                      <button
                        key={f.key}
                        onClick={() => { setPostFilter(f.key); setPosts(allPosts.slice(0, PAGE_SIZE)); }}
                        style={{
                          padding: '5px 12px', borderRadius: 100,
                          border: `2px solid ${postFilter === f.key ? 'var(--green)' : 'var(--gray-2)'}`,
                          background: postFilter === f.key ? 'var(--green-bg)' : 'var(--white)',
                          color: postFilter === f.key ? 'var(--green)' : 'var(--text-muted)',
                          fontWeight: postFilter === f.key ? 700 : 500,
                          fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        {f.label}
                        <span style={{
                          background: postFilter === f.key ? 'var(--green)' : 'var(--gray-2)',
                          color: postFilter === f.key ? 'white' : 'var(--text-muted)',
                          borderRadius: 100, padding: '0 5px', fontSize: '0.7rem',
                        }}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Posts list */}
                {postsLoading ? (
                  <SkeletonList count={4} />
                ) : filteredPosts.length === 0 ? (
                  <div style={{
                    background: 'var(--white)', border: '1px solid var(--gray-2)',
                    borderRadius: 'var(--radius)', padding: '48px 24px', textAlign: 'center',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-3)" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <h3 style={{ color: 'var(--dark)', marginBottom: 8, fontSize: '1rem' }}>
                      {postFilter === 'all' ? 'No posts yet' : `No ${postFilter} posts`}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                      {isOwn ? 'Share your knowledge with the BSDC community!' : 'This developer has not posted yet.'}
                    </p>
                    {isOwn && (
                      <Link to="/create" className="btn btn-primary btn-sm">
                        Create First Post
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    {filteredPosts.slice(0, posts.length).map(post => (
                      <MiniPostCard key={post.id} post={post} />
                    ))}

                    {filteredPosts.length > posts.length && (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => {
                            const next = posts.length + PAGE_SIZE;
                            setPosts(allPosts.slice(0, next));
                            setHasMore(filteredPosts.length > next);
                          }}
                          disabled={loadingMore}
                        >
                          {loadingMore
                            ? <><span className="loading-spinner" style={{ borderColor: 'rgba(0,106,78,0.2)', borderTopColor: 'var(--green)' }} /> Loading…</>
                            : `Load More (${filteredPosts.length - posts.length} remaining)`
                          }
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Post breakdown */}
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-2)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>
                    Post Breakdown
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(TYPE_COLORS).map(([type, cfg]) => {
                      const count = postStats[type] || 0;
                      const total = postStats.total || 1;
                      const pct   = Math.round((count / total) * 100);
                      if (count === 0) return null;
                      return (
                        <div key={type}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                            <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{count}</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--gray-2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                    {postStats.total === 0 && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>No posts yet</p>
                    )}
                  </div>
                </div>

                {/* About card */}
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-2)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>
                    About
                  </div>
                  <div style={{ padding: 16 }}>
                    {[
                      { label: 'Member ID',  value: memberNum,                   mono: true },
                      { label: 'Joined',     value: joinDate,                    mono: false },
                      { label: 'Location',   value: profile.location || 'Bangladesh', mono: false },
                      { label: 'Reputation', value: `${profile.reputation || 0} pts`, mono: false },
                      { label: 'Badge',      value: repBadge.label,              mono: false, color: repBadge.color },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 10, alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{
                          fontWeight: 600,
                          color: item.color || 'var(--dark)',
                          fontFamily: item.mono ? 'var(--font-mono)' : 'inherit',
                          fontSize: item.mono ? '0.75rem' : '0.82rem',
                        }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                {profile.skills?.length > 0 && (
                  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-2)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>
                      Skills
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {profile.skills.map(sk => (
                        <Link key={sk} to={`/post?tag=${encodeURIComponent(sk)}`}
                          style={{ background: 'var(--green-bg)', color: 'var(--green)', padding: '4px 10px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, transition: 'var(--transition)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--green-bg)'; e.currentTarget.style.color = 'var(--green)'; }}
                        >
                          {sk}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* BSDC promo */}
                {!isOwn && (
                  <div style={{ background: 'linear-gradient(135deg, var(--dark), #0f172a)', borderRadius: 'var(--radius)', padding: 20, color: 'white' }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 6 }}>🇧🇩 Join BSDC</p>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: 14 }}>
                      Bangladesh's #1 software development community
                    </p>
                    <Link to="/register" className="btn btn-primary btn-sm btn-block">
                      Join Free
                    </Link>
                  </div>
                )}
              </aside>
            </div>
          )}

          {/* ════════════════════════
              TAB: ID CARD
          ════════════════════════ */}
          {activeTab === 'id-card' && (
            <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 40 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 6 }}>
                  Official BSDC Developer ID Card
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Your verified developer identity with QR code — share it, download it!
                </p>
              </div>
              <IDCard profile={profile} uid={uid} />

              {/* Share options */}
              <div style={{ marginTop: 24, background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 12 }}>Share Your Profile</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Copy Link', onClick: handleShare, icon: <Icon.Share /> },
                    {
                      label: 'LinkedIn', icon: <Icon.LinkedIn />,
                      onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank'),
                    },
                    {
                      label: 'Twitter/X', icon: null,
                      onClick: () => window.open(`https://twitter.com/intent/tweet?text=Check out my developer profile on BSDC!&url=${encodeURIComponent(profileUrl)}`, '_blank'),
                    },
                  ].map(btn => (
                    <button key={btn.label} className="btn btn-outline btn-sm" onClick={btn.onClick}>
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════
              TAB: EDIT (opens modal)
          ════════════════════════ */}
          {activeTab === 'edit' && isOwn && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                Click below to open the profile editor
              </p>
              <button className="btn btn-primary" onClick={() => setEditOpen(true)}>
                <Icon.Edit /> Open Profile Editor
              </button>
            </div>
          )}

          {/* Bottom padding */}
          <div style={{ height: 40 }} />
        </div>
      </main>

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stat-row { flex-direction: column !important; }
        }
      `}</style>
    </>
  );
}
