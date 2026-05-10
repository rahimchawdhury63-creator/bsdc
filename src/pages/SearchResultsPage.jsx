import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Fuse from 'fuse.js';
import { getPosts } from '../firebase';
import PostCard from '../components/PostCard';
import { SkeletonList } from '../components/Skeleton';
import SearchBar from '../components/SearchBar';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doSearch = async () => {
      if (!q.trim()) { setResults([]); setLoading(false); return; }
      setLoading(true);
      const { posts } = await getPosts(null, 200);
      const fuse = new Fuse(posts, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'body', weight: 0.25 },
          { name: 'tags', weight: 0.15 },
          { name: 'authorName', weight: 0.1 },
        ],
        threshold: 0.35,
        minMatchCharLength: 2,
        includeScore: true,
      });
      const res = fuse.search(q.trim(), { limit: 50 });
      setResults(res.map(r => r.item));
      setLoading(false);
    };
    doSearch();
  }, [q]);

  return (
    <>
      <Helmet>
        <title>Search: "{q}" — BSDC | Bangladesh Software Development Community</title>
        <meta name="description" content={`Search results for "${q}" on BSDC — Bangladesh Software Development Community.`} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <main role="main">
        <section style={{ background: 'var(--dark)', padding: '32px 16px', color: 'var(--white)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>
              Search Results for "<span style={{ color: '#6EE7B7' }}>{q}</span>"
            </h1>
            <SearchBar fullWidth />
          </div>
        </section>

        <div className="container-sm" style={{ padding: '24px 16px' }}>
          {loading ? <SkeletonList count={5} /> : (
            results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray-3)" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <h2 style={{ color: 'var(--dark)', marginBottom: 8 }}>No results found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                  No posts matched "<strong>{q}</strong>". Try different keywords.
                </p>
                <Link to="/create" className="btn btn-primary">Create a Post About This</Link>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {results.map(post => <PostCard key={post.id} post={post} />)}
              </>
            )
          )}
        </div>
      </main>
    </>
  );
}
