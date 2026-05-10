import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getUserProfile, getPosts, db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { SkeletonProfile, SkeletonList } from '../components/Skeleton';
import IDCard from '../components/IDCard';
import PostCard from '../components/PostCard';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const PROFILE_TABS = ['Posts', 'ID Card', 'Edit Profile'];

export default function ProfilePage() {
  const { uid } = useParams();
  const { user, profile: myProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const isOwn = user?.uid === uid;
  const tabs = isOwn ? PROFILE_TABS : ['Posts', 'ID Card'];

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const prof = await getUserProfile(uid);
      setProfile(prof);
      if (prof && isOwn) {
        setEditForm({
          displayName: prof.displayName || '',
          bio: prof.bio || '',
          location: prof.location || 'Bangladesh',
          github: prof.github || '',
          linkedin: prof.linkedin || '',
          website: prof.website || '',
          skills: prof.skills || [],
        });
      }
      setLoading(false);
    };
    if (uid) loadProfile();
  }, [uid, isOwn]);

  useEffect(() => {
    const loadPosts = async () => {
      if (!uid) return;
      setPostsLoading(true);
      try {
        const q = query(
          collection(db, 'posts'),
          where('authorId', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(q);
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setPostsLoading(false);
    };
    loadPosts();
  }, [uid]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      await updateUserProfile({
        displayName: editForm.displayName,
        bio: editForm.bio,
        location: editForm.location,
        github: editForm.github,
        linkedin: editForm.linkedin,
        website: editForm.website,
        skills: editForm.skills,
      });
      setEditSuccess('Profile updated successfully!');
      setProfile(p => ({ ...p, ...editForm }));
      setTimeout(() => setEditSuccess(''), 3000);
    } catch (e) {
      setEditError('Failed to update profile. Try again.');
    }
    setEditLoading(false);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || editForm.skills?.includes(s) || editForm.skills?.length >= 10) return;
    setEditForm(p => ({ ...p, skills: [...(p.skills || []), s] }));
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setEditForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '32px 16px' }}>
        <div className="card"><SkeletonProfile /></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--dark)', marginBottom: 12 }}>Developer Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          This profile does not exist on BSDC.
        </p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  const profileUrl = `https://www.bsdc.info.bd/profile/${uid}`;

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.displayName,
      description: profile.bio || `${profile.displayName} is a software developer on BSDC — Bangladesh Software Development Community.`,
      url: profileUrl,
      image: profile.photoURL || '',
      sameAs: [
        profile.github ? `https://github.com/${profile.github}` : null,
        profile.linkedin ? `https://linkedin.com/in/${profile.linkedin}` : null,
        profile.website || null,
      ].filter(Boolean),
      knowsAbout: profile.skills || [],
      memberOf: {
        '@type': 'Organization',
        name: 'Bangladesh Software Development Community',
        url: 'https://www.bsdc.info.bd',
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>BSDC — {profile.displayName} | Bangladesh Software Development Community Developer Profile</title>
        <meta name="description" content={`${profile.displayName}'s developer profile on BSDC — Bangladesh Software Development Community. ${profile.bio || `${profile.displayName} is a software developer from ${profile.location || 'Bangladesh'}.`} Skills: ${profile.skills?.join(', ') || 'Software Development'}.`} />
        <meta name="keywords" content={`${profile.displayName}, BSDC developer, Bangladesh developer, ${profile.skills?.join(', ') || 'software developer'}, BSDC profile, developer Bangladesh`} />
        <meta property="og:title" content={`BSDC — ${profile.displayName}`} />
        <meta property="og:description" content={profile.bio || `${profile.displayName} — Developer on BSDC`} />
        <meta property="og:image" content={profile.photoURL || 'https://www.bsdc.info.bd/og-image.png'} />
        <meta property="og:url" content={profileUrl} />
        <meta property="og:type" content="profile" />
        <meta property="profile:username" content={profile.displayName} />
        <link rel="canonical" href={profileUrl} />
        <script type="application/ld+json">{JSON.stringify(personJsonLd)}</script>
      </Helmet>

      <main role="main">
        {/* Profile Header */}
        <section
          style={{ background: 'linear-gradient(135deg, var(--dark), #0f172a)', padding: '40px 16px 0' }}
          aria-label="Profile header"
        >
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="avatar"
                    style={{ width: 100, height: 100, border: '4px solid var(--green)', borderRadius: 16, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: 100, height: 100,
                    borderRadius: 16, border: '4px solid var(--green)',
                    background: 'linear-gradient(135deg, #004d38, #006A4E)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', fontWeight: 800, color: '#6EE7B7',
                  }}>
                    {profile.displayName?.[0]?.toUpperCase()}
                  </div>
                )}
                {profile.role === 'admin' && (
                  <span style={{
                    position: 'absolute', bottom: -8, right: -8,
                    background: 'var(--green)', color: 'white',
                    fontSize: '0.65rem', fontWeight: 700,
                    padding: '2px 6px', borderRadius: 4,
                  }}>ADMIN</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200, paddingBottom: 20 }}>
                <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: 'var(--white)', marginBottom: 4 }}>
                  {profile.displayName}
                </h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{ color: '#6EE7B7', fontSize: '0.88rem', fontWeight: 600 }}>
                    {profile.role === 'admin' ? '⚡ Admin' : '💻 Developer'}
                  </span>
                  <span style={{ color: '#64748B', fontSize: '0.82rem' }}>
                    📍 {profile.location || 'Bangladesh'}
                  </span>
                </div>
                {profile.bio && (
                  <p style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 500 }}>
                    {profile.bio}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                  {profile.github && (
                    <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8', fontSize: '0.85rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                    >
                      <GithubIcon /> @{profile.github}
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8', fontSize: '0.85rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#6EE7B7'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                    >
                      <LinkIcon /> Website
                    </a>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 24, paddingBottom: 24 }}>
                {[
                  { num: profile.postCount || 0, label: 'Posts' },
                  { num: profile.reputation || 0, label: 'Rep' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6EE7B7' }}>{s.num}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 16 }}>
                {profile.skills.map(skill => (
                  <span key={skill} className="id-card-skill" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #1e3a5f', marginTop: 8 }}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 20px',
                    border: 'none',
                    background: 'none',
                    color: activeTab === tab ? '#6EE7B7' : '#94A3B8',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: activeTab === tab ? '2px solid #6EE7B7' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: -1,
                  }}
                >
                  {tab}
                </button>
              ))}
              {isOwn && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingBottom: 8 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('Edit Profile')}
                    style={{ borderColor: '#475569', color: '#94A3B8' }}
                  >
                    <EditIcon /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <div className="container" style={{ padding: '32px 16px', maxWidth: 900 }}>

          {/* POSTS TAB */}
          {activeTab === 'Posts' && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 16 }}>
                {isOwn ? 'Your Posts' : `Posts by ${profile.displayName}`}
              </h2>
              {postsLoading ? <SkeletonList count={4} /> : (
                posts.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                      {isOwn ? 'You have not posted anything yet.' : 'No posts yet.'}
                    </p>
                    {isOwn && <Link to="/create" className="btn btn-primary">Create First Post</Link>}
                  </div>
                ) : (
                  posts.map(post => <PostCard key={post.id} post={post} />)
                )
              )}
            </div>
          )}

          {/* ID CARD TAB */}
          {activeTab === 'ID Card' && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 8, textAlign: 'center' }}>
                BSDC Developer ID Card
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', marginBottom: 24 }}>
                Your official BSDC developer identity card with QR code
              </p>
              <IDCard profile={profile} uid={uid} />
            </div>
          )}

          {/* EDIT PROFILE TAB */}
          {activeTab === 'Edit Profile' && isOwn && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 20 }}>
                Edit Your Profile
              </h2>
              {editError && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: '0.88rem', color: 'var(--danger)', marginBottom: 16 }} role="alert">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 14px', fontSize: '0.88rem', color: 'var(--success)', marginBottom: 16 }} role="alert">
                  {editSuccess}
                </div>
              )}
              <form onSubmit={handleEditSubmit} className="card">
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-name">Display Name *</label>
                    <input id="edit-name" type="text" className="form-input" value={editForm.displayName || ''} onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-bio">Bio</label>
                    <textarea id="edit-bio" className="form-textarea" value={editForm.bio || ''} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell the BSDC community about yourself…" rows={3} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-location">Location</label>
                    <input id="edit-location" type="text" className="form-input" value={editForm.location || ''} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} placeholder="Dhaka, Bangladesh" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="edit-github">GitHub Username</label>
                      <input id="edit-github" type="text" className="form-input" value={editForm.github || ''} onChange={e => setEditForm(p => ({ ...p, github: e.target.value }))} placeholder="your-github-username" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="edit-linkedin">LinkedIn Username</label>
                      <input id="edit-linkedin" type="text" className="form-input" value={editForm.linkedin || ''} onChange={e => setEditForm(p => ({ ...p, linkedin: e.target.value }))} placeholder="your-linkedin-username" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-website">Website URL</label>
                    <input id="edit-website" type="url" className="form-input" value={editForm.website || ''} onChange={e => setEditForm(p => ({ ...p, website: e.target.value }))} placeholder="https://yourwebsite.com" />
                  </div>

                  {/* Skills */}
                  <div className="form-group">
                    <label className="form-label">Skills (max 10)</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        className="form-input"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="e.g. React, Python, DevOps…"
                      />
                      <button type="button" className="btn btn-outline btn-sm" onClick={addSkill} style={{ whiteSpace: 'nowrap' }}>
                        Add Skill
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {editForm.skills?.map(skill => (
                        <span key={skill} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: 'var(--green-bg)', color: 'var(--green)',
                          padding: '4px 10px', borderRadius: 100, fontSize: '0.82rem', fontWeight: 600,
                        }}>
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} style={{ background: 'none', color: 'var(--green)', padding: 0, fontSize: '1rem', lineHeight: 1 }} aria-label={`Remove ${skill}`}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={editLoading} style={{ minWidth: 140 }}>
                    {editLoading ? <><span className="loading-spinner" /> Saving…</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
