/**
 * src/components/search/SearchResults.jsx
 * ---------------------------------------------------------------------------
 * Full-page search results — opened via /search?q=...
 *
 * Tabs: All | Posts | People | Code | Jobs
 * Each tab applies a type filter on top of the base query results.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import useSearch from '../../hooks/useSearch.js';
import SearchBar from './SearchBar.jsx';
import FeedItem from '../feed/FeedItem.jsx';
import Avatar from '../common/Avatar.jsx';
import VerificationBadge from '../verification/VerificationBadge.jsx';
import FollowButton from '../profile/FollowButton.jsx';
import Spinner from '../common/Spinner.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { IconUser, IconHash, IconCode, IconBriefcase, IconSearch } from '../common/Icons.jsx';

const TABS = [
  { id: 'all',   label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'users', label: 'People' },
  { id: 'code',  label: 'Code' },
  { id: 'jobs',  label: 'Jobs' }
];

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [tab, setTab] = useState('all');
  const { profile } = useAuth();

  const { results, loading } = useSearch(q);
  const { posts = [], users = [], didYouMean } = results || {};

  const filteredPosts = useMemo(() => {
    if (tab === 'code') return posts.filter((p) => p.type === 'code');
    if (tab === 'jobs') return posts.filter((p) => p.type === 'job');
    if (tab === 'users') return [];
    return posts;
  }, [posts, tab]);

  const showUsers = tab === 'all' || tab === 'users';
  const showPosts = tab !== 'users';

  const title = q
    ? `${q} — Search | Bangladesh Software Development Community`
    : 'Search | BSDC';

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={`Search results for "${q}" on BSDC.`} />
        <meta name="robots" content={q ? 'noindex, follow' : 'index, follow'} />
        <link rel="canonical" href={`https://www.bsdc.info.bd/search${q ? `?q=${encodeURIComponent(q)}` : ''}`} />
      </Helmet>

      <div className="bsdc-mb-md">
        <SearchBar defaultValue={q} autoFocus />
      </div>

      {/* No query state */}
      {!q && (
        <div className="bsdc-empty">
          <div className="bsdc-empty__icon"><IconSearch /></div>
          <div className="bsdc-empty__title">What are you looking for?</div>
          <div className="bsdc-empty__body">Try a topic, person, tag, or code snippet.</div>
        </div>
      )}

      {q && (
        <>
          {/* Did-you-mean */}
          {didYouMean && (
            <div className="bsdc-card bsdc-mb-md" style={{ borderLeft: '4px solid var(--color-warning)' }}>
              No exact matches. Did you mean{' '}
              <Link to={`/search?q=${encodeURIComponent(didYouMean)}`} className="bsdc-text-bold">
                "{didYouMean}"
              </Link>?
            </div>
          )}

          {/* Tabs */}
          <div className="bsdc-tabs">
            {TABS.map((t) => {
              const count =
                t.id === 'all'   ? posts.length + users.length :
                t.id === 'users' ? users.length :
                t.id === 'code'  ? posts.filter((p) => p.type === 'code').length :
                t.id === 'jobs'  ? posts.filter((p) => p.type === 'job').length :
                posts.length;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`bsdc-tab ${tab === t.id ? 'bsdc-tab--active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.id === 'users'  ? <IconUser  size={14} /> :
                   t.id === 'code'   ? <IconCode  size={14} /> :
                   t.id === 'jobs'   ? <IconBriefcase size={14} /> :
                                       <IconHash  size={14} />}
                  {t.label}{loading ? '' : ` (${count})`}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="bsdc-mt-md">
            {loading && posts.length === 0 && users.length === 0 ? (
              <div className="bsdc-loading-center"><Spinner /> Searching…</div>
            ) : (
              <>
                {showUsers && users.length > 0 && (
                  <div className="bsdc-card bsdc-mb-md">
                    <h2 className="bsdc-text-uppercase bsdc-text-xs bsdc-text-muted" style={{ margin: '0 0 8px' }}>People</h2>
                    {users.map((u) => (
                      <UserResult key={u.id} user={u} currentUser={profile} />
                    ))}
                  </div>
                )}

                {showPosts && filteredPosts.map((p) => (
                  <FeedItem key={p.id} post={p} currentUser={profile} />
                ))}

                {!loading && filteredPosts.length === 0 && (tab !== 'users' || users.length === 0) && (
                  <div className="bsdc-empty">
                    <div className="bsdc-empty__title">No results for "{q}"</div>
                    <div className="bsdc-empty__body">Try a different keyword or check spelling.</div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

function UserResult({ user, currentUser }) {
  return (
    <div className="bsdc-suggestion-item" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <Link to={`/p/${user.username}`}>
        <Avatar src={user.photoURL} name={user.displayName} />
      </Link>
      <div className="bsdc-suggestion-item__body">
        <div className="bsdc-flex bsdc-items-center bsdc-gap-xs">
          <Link to={`/p/${user.username}`} className="bsdc-text-bold">
            {user.displayName || user.username}
          </Link>
          {user.isVerified && <VerificationBadge size={12} />}
        </div>
        <div className="bsdc-text-xs bsdc-text-muted">@{user.username}{user.title ? ` · ${user.title}` : ''}</div>
        {user.bio && <p className="bsdc-text-sm" style={{ margin: '4px 0 0', color: 'var(--color-text-light)' }}>{user.bio}</p>}
      </div>
      {currentUser && currentUser.uid !== user.uid && (
        <FollowButton meUid={currentUser.uid} themUid={user.uid} size="sm" />
      )}
    </div>
  );
}
