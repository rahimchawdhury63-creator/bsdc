import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../AuthContext';
import { createPost, uploadToImgBB, db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-dart';

const POST_TYPES = [
  { key: 'qa', label: 'Q&A', icon: '❓', desc: 'Ask a technical question' },
  { key: 'blog', label: 'Blog', icon: '📝', desc: 'Write a technical article' },
  { key: 'wiki', label: 'Wiki', icon: '📚', desc: 'Document a topic' },
  { key: 'snippet', label: 'Code Snippet', icon: '💻', desc: 'Share a code example' },
  { key: 'project', label: 'Project', icon: '🚀', desc: 'Showcase your project' },
  { key: 'post', label: 'Text Post', icon: '✏️', desc: 'Share anything' },
];

const LANGUAGES = ['javascript', 'python', 'php', 'java', 'typescript', 'css', 'html', 'bash', 'sql', 'dart', 'c', 'cpp', 'rust', 'go'];

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function generateUniqueSlug(title) {
  const base = slugify(title);
  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`;
}

export default function CreatePostPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'qa';

  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('javascript');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const fileRef = useRef(null);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 16px' }}>
        <h2 style={{ color: 'var(--dark)', marginBottom: 12 }}>Sign In Required</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>You must be signed in to create a post.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login', { state: { from: '/create' } })}>
          Sign In
        </button>
      </div>
    );
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF\-\.#]/g, '');
    if (!t || tags.includes(t) || tags.length >= 8) return;
    setTags(p => [...p, t]);
    setTagInput('');
  };

  const removeTag = (tag) => setTags(p => p.filter(t => t !== tag));

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return '';
    setUploading(true);
    try {
      const url = await uploadToImgBB(imageFile);
      setCoverImage(url);
      setUploading(false);
      return url;
    } catch (e) {
      setError('Image upload failed. Please try again.');
      setUploading(false);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    if (title.trim().length < 10) { setError('Title must be at least 10 characters.'); return; }
    if (!body.trim() && type !== 'snippet') { setError('Content is required.'); return; }
    if (type === 'snippet' && !code.trim()) { setError('Code is required for snippets.'); return; }
    if (tags.length === 0) { setError('Please add at least one tag.'); return; }

    setSubmitting(true);
    try {
      let imgUrl = coverImage;
      if (imageFile && !coverImage) {
        imgUrl = await handleImageUpload();
      }

      const slug = generateUniqueSlug(title);
      const postData = {
        type,
        title: title.trim(),
        body: body.trim(),
        code: type === 'snippet' ? code.trim() : '',
        language: type === 'snippet' ? lang : '',
        tags,
        slug,
        coverImage: imgUrl,
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || 'Anonymous',
        authorPhoto: profile?.photoURL || user.photoURL || '',
        commentCount: 0,
      };

      const ref = await createPost(postData);

      await updateDoc(doc(db, 'users', user.uid), {
        postCount: increment(1),
      });

      navigate(`/post/${slug}`);
    } catch (e) {
      console.error(e);
      setError('Failed to create post. Please try again.');
    }
    setSubmitting(false);
  };

  const highlightedCode = code && type === 'snippet'
    ? Prism.highlight(code, Prism.languages[lang] || Prism.languages.javascript, lang)
    : '';

  return (
    <>
      <Helmet>
        <title>Create Post — BSDC | Bangladesh Software Development Community</title>
        <meta name="description" content="Create a new Q&A, Blog, Wiki, Code Snippet, or Project post on BSDC." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main role="main" style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)' }}>Create New Post</h1>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setPreview(p => !p)}
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: '0.88rem', color: 'var(--danger)', marginBottom: 16 }} role="alert">
            {error}
          </div>
        )}

        {/* Post Type Selector */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <label className="form-label">Post Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {POST_TYPES.map(pt => (
                <button
                  key={pt.key}
                  type="button"
                  onClick={() => setType(pt.key)}
                  style={{
                    padding: '12px', border: `2px solid ${type === pt.key ? 'var(--green)' : 'var(--gray-2)'}`,
                    borderRadius: 'var(--radius-sm)', background: type === pt.key ? 'var(--green-bg)' : 'var(--white)',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={type === pt.key ? 'var(--green)' : 'var(--text-muted)'}>
                      {pt.key === 'qa' && <><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>}
                      {pt.key === 'blog' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/><polyline points="10 9 9 9 8 9" fill="none" stroke="currentColor" strokeWidth="2"/></>}
                      {pt.key === 'wiki' && <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="none" stroke="currentColor" strokeWidth="2"/></>}
                      {pt.key === 'snippet' && <><polyline points="16 18 22 12 16 6" fill="none" stroke="currentColor" strokeWidth="2"/><polyline points="8 6 2 12 8 18" fill="none" stroke="currentColor" strokeWidth="2"/></>}
                      {pt.key === 'project' && <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke="currentColor" strokeWidth="2"/></>}
                      {pt.key === 'post' && <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="currentColor" strokeWidth="2"/></>}
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: type === pt.key ? 'var(--green)' : 'var(--dark)' }}>
                    {pt.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {pt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        {!preview ? (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-body">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label" htmlFor="post-title">
                    Title <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    className="form-input"
                    style={{ fontSize: '1.05rem', fontWeight: 600, padding: '12px 14px' }}
                    placeholder={
                      type === 'qa' ? 'What is your question? Be specific…'
                      : type === 'blog' ? 'Blog post title…'
                      : type === 'wiki' ? 'Wiki article title…'
                      : type === 'snippet' ? 'Code snippet name…'
                      : type === 'project' ? 'Project name…'
                      : 'Post title…'
                    }
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    maxLength={150}
                    required
                  />
                  <div className="form-hint">{title.length}/150 characters</div>
                </div>

                {/* Body */}
                {type !== 'snippet' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="post-body">
                      {type === 'qa' ? 'Describe your problem in detail' : 'Content'} <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <textarea
                      id="post-body"
                      className="form-textarea"
                      style={{ minHeight: type === 'blog' || type === 'wiki' ? 320 : 180, fontFamily: 'inherit', fontSize: '0.97rem' }}
                      placeholder={
                        type === 'qa' ? 'Explain what you tried, what you expected, and what happened. Include any relevant code, error messages, or context.\n\nআপনি কী করার চেষ্টা করেছেন তা বিস্তারিত লিখুন…'
                        : type === 'blog' ? 'Write your blog post content here. You can use Markdown-style formatting.\n\nআপনার ব্লগ পোস্ট লিখুন…'
                        : type === 'wiki' ? 'Write the wiki article content. Be comprehensive and clear.\n\nউইকি আর্টিকেল লিখুন…'
                        : type === 'project' ? 'Describe your project — what it does, tech stack used, how to use it, GitHub link, etc.\n\nআপনার প্রজেক্ট বর্ণনা করুন…'
                        : 'Write your post…'
                      }
                      value={body}
                      onChange={e => setBody(e.target.value)}
                    />
                    <div className="form-hint">Bangla ও English উভয় ভাষায় লিখতে পারবেন</div>
                  </div>
                )}

                {/* Code Editor */}
                {(type === 'snippet' || type === 'qa') && (
                  <div className="form-group">
                    <label className="form-label">
                      {type === 'snippet' ? 'Code *' : 'Code (optional)'}
                    </label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <label className="form-label" style={{ marginBottom: 0, fontSize: '0.82rem' }}>Language:</label>
                      <select
                        className="form-select"
                        style={{ width: 'auto', minWidth: 140 }}
                        value={lang}
                        onChange={e => setLang(e.target.value)}
                      >
                        {LANGUAGES.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      className="form-textarea"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        minHeight: 200,
                        background: '#1e1e2e',
                        color: '#cdd6f4',
                        border: '2px solid #313244',
                        lineHeight: 1.6,
                        tabSize: 2,
                        padding: '16px',
                      }}
                      placeholder={`// Write your ${lang} code here...\n// আপনার কোড এখানে লিখুন`}
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      spellCheck={false}
                      onKeyDown={e => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const start = e.target.selectionStart;
                          const end = e.target.selectionEnd;
                          const val = e.target.value;
                          setCode(val.substring(0, start) + '  ' + val.substring(end));
                          setTimeout(() => {
                            e.target.selectionStart = e.target.selectionEnd = start + 2;
                          }, 0);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Cover Image */}
                {(type === 'blog' || type === 'project') && (
                  <div className="form-group">
                    <label className="form-label">Cover Image (optional)</label>
                    <div
                      style={{
                        border: '2px dashed var(--gray-2)', borderRadius: 'var(--radius-sm)',
                        padding: 24, textAlign: 'center', cursor: 'pointer',
                        transition: 'all 0.2s', background: imagePreview ? 'transparent' : 'var(--gray)',
                      }}
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--green)'; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-2)'; }}
                      onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gray-2)'; const f = e.dataTransfer.files[0]; if (f) { const ev = { target: { files: [f] } }; handleImageChange(ev); } }}
                    >
                      {imagePreview ? (
                        <div style={{ position: 'relative' }}>
                          <img src={imagePreview} alt="Preview" style={{ maxHeight: 200, borderRadius: 8, margin: '0 auto' }} />
                          <button type="button" onClick={e => { e.stopPropagation(); setImagePreview(''); setImageFile(null); setCoverImage(''); }}
                            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '1rem' }}>
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ margin: '0 auto 8px' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            Click or drag to upload cover image<br />
                            <span style={{ fontSize: '0.78rem' }}>PNG, JPG, GIF up to 5MB</span>
                          </p>
                        </>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </div>
                )}

                {/* Tags */}
                <div className="form-group">
                  <label className="form-label">Tags <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="javascript, python, react… (max 8)"
                    />
                    <button type="button" className="btn btn-outline btn-sm" onClick={addTag} style={{ whiteSpace: 'nowrap' }}>
                      Add Tag
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {tags.map(tag => (
                      <span key={tag} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--green-bg)', color: 'var(--green)',
                        padding: '4px 10px', borderRadius: 100, fontSize: '0.82rem', fontWeight: 600,
                      }}>
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', color: 'var(--green)', padding: 0, fontSize: '1rem', lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className="form-hint">{tags.length}/8 tags added</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting || uploading} style={{ minWidth: 140 }}>
                {submitting
                  ? <><span className="loading-spinner" /> Publishing…</>
                  : uploading
                  ? <><span className="loading-spinner" /> Uploading…</>
                  : <>Publish Post</>
                }
              </button>
            </div>
          </form>
        ) : (
          /* PREVIEW */
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontWeight: 700, color: 'var(--dark)' }}>Preview</h2>
              <span className={`type-badge type-${type}`}>{type.toUpperCase()}</span>
            </div>
            <div className="card-body">
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 12 }}>{title || 'Untitled'}</h1>
              {imagePreview && <img src={imagePreview} alt="Cover" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />}
              <div className="article-content" style={{ whiteSpace: 'pre-wrap' }}>{body}</div>
              {code && (
                <div className="code-block-wrap">
                  <span className="code-lang-label">{lang}</span>
                  <pre className={`language-${lang}`}>
                    <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                  </pre>
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                {tags.map(tag => <span key={tag} className="sidebar-tag">#{tag}</span>)}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
