import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { getPosts } from '../firebase';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const TYPE_LABELS = { qa: 'Q&A', wiki: 'Wiki', blog: 'Blog', snippet: 'Snippet', project: 'Project', post: 'Post' };

let cachedPosts = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export default function SearchBar({ fullWidth = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fuse, setFuse] = useState(null);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    const loadPosts = async () => {
      const now = Date.now();
      if (cachedPosts && now - cacheTime < CACHE_TTL) {
        initFuse(cachedPosts);
        return;
      }
      try {
        const { posts } = await getPosts(null, 200);
        cachedPosts = posts;
        cacheTime = Date.now();
        initFuse(posts);
      } catch (e) {
        console.error('Search load error:', e);
      }
    };
    loadPosts();
  }, []);

  const initFuse = (posts) => {
    const fuseInstance = new Fuse(posts, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'body', weight: 0.2 },
        { name: 'tags', weight: 0.2 },
        { name: 'authorName', weight: 0.1 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
    });
    setFuse(fuseInstance);
  };

  const doSearch = useCallback((q) => {
    if (!fuse || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const res = fuse.search(q.trim(), { limit: 8 });
    setResults(res.map(r => r.item));
    setOpen(true);
    setLoading(false);
  }, [fuse]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 250);
  };

  const handleSelect = (post) => {
    setQuery('');
    setOpen(false);
    navigate(`/post/${post.slug || post.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="search-wrap" ref={wrapRef} style={{ width: fullWidth ? '100%' : undefined }}>
      <SearchIcon />
      <input
        ref={inputRef}
        type="search"
        className="search-input"
        placeholder="Search BSDC… (Q&A, Wiki, Blog)"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        aria-label="Search BSDC"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (
        <div className="search-results" role="listbox" aria-label="Search results">
          {loading ? (
            <div className="search-empty">Searching…</div>
          ) : results.length === 0 ? (
            <div className="search-empty">
              No results for "<strong>{query}</strong>"
              <div style={{ marginTop: 6, fontSize: '0.78rem' }}>
                Press Enter to search all posts
              </div>
            </div>
          ) : (
            <>
              {results.map(post => (
                <div
                  key={post.id}
                  className="search-result-item"
                  onClick={() => handleSelect(post)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleSelect(post)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span className={`type-badge type-${post.type || 'post'}`}>
                      {TYPE_LABELS[post.type] || 'Post'}
                    </span>
                    <span className="search-result-title">{post.title}</span>
                  </div>
                  <div className="search-result-meta">
                    By {post.authorName} · {post.tags?.slice(0, 3).join(', ')}
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: '10px 16px', fontSize: '0.8rem',
                  color: 'var(--text-muted)', textAlign: 'center',
                  borderTop: '1px solid var(--gray-2)', cursor: 'pointer',
                }}
                onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
              >
                See all results for "<strong>{query}</strong>"
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
