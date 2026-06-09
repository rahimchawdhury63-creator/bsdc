/**
 * src/components/search/SearchSuggestions.jsx
 * Dropdown panel shown under the search bar — recent searches + live hits.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar.jsx';
import VerificationBadge from '../verification/VerificationBadge.jsx';
import Spinner from '../common/Spinner.jsx';
import { IconClock, IconUser, IconHash, IconTrash, IconSearch } from '../common/Icons.jsx';

export default function SearchSuggestions({
  query,
  results,
  loading,
  recent,
  onPick,
  onClearHistory,
  onSubmit
}) {
  const showRecent = !query || query.length < 2;
  const { posts = [], users = [] } = results || {};

  return (
    <div
      className="bsdc-card bsdc-card--raised"
      role="listbox"
      style={{
        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
        zIndex: 60, padding: 'var(--space-sm) 0',
        maxHeight: 'min(70vh, 480px)', overflowY: 'auto',
        animation: 'bsdcFadeIn 140ms ease both'
      }}
    >
      {showRecent ? (
        <RecentBlock recent={recent} onPick={onPick} onClearHistory={onClearHistory} />
      ) : loading ? (
        <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-p-md">
          <Spinner size="sm" /> Searching for "{query}"…
        </div>
      ) : (
        <LiveBlock query={query} posts={posts} users={users} onPick={onPick} onSubmit={onSubmit} />
      )}
    </div>
  );
}

function RecentBlock({ recent, onPick, onClearHistory }) {
  if (!recent || recent.length === 0) {
    return (
      <div className="bsdc-p-md bsdc-text-sm bsdc-text-muted">
        Search for posts, people, code, jobs, communities, and more.
      </div>
    );
  }
  return (
    <>
      <div className="bsdc-flex bsdc-items-center bsdc-justify-between bsdc-p-md" style={{ paddingBottom: 4 }}>
        <span className="bsdc-text-xs bsdc-text-uppercase bsdc-text-muted">Recent</span>
        <button
          type="button"
          className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm"
          style={{ minHeight: 0, padding: '2px 8px' }}
          onClick={onClearHistory}
        >
          <IconTrash size={12} /> Clear
        </button>
      </div>
      {recent.map((q) => (
        <button
          key={q}
          type="button"
          className="bsdc-dropdown__item"
          onClick={() => onPick({ kind: 'history', query: q })}
        >
          <IconClock size={16} /> {q}
        </button>
      ))}
    </>
  );
}

function LiveBlock({ query, posts, users, onPick, onSubmit }) {
  if (posts.length === 0 && users.length === 0) {
    return (
      <div className="bsdc-p-md bsdc-text-sm bsdc-text-muted">
        No matches for "{query}".
      </div>
    );
  }
  return (
    <>
      <button
        type="button"
        className="bsdc-dropdown__item"
        onClick={() => onSubmit(query)}
        style={{ fontWeight: 600 }}
      >
        <IconSearch size={16} /> Search BSDC for "{query}"
      </button>

      {users.length > 0 && (
        <>
          <div className="bsdc-p-md" style={{ padding: '8px 16px 4px' }}>
            <span className="bsdc-text-xs bsdc-text-uppercase bsdc-text-muted">People</span>
          </div>
          {users.slice(0, 4).map((u) => (
            <Link
              key={u.id}
              to={`/p/${u.username}`}
              className="bsdc-dropdown__item"
              onClick={() => onPick({ kind: 'user', value: u })}
            >
              <Avatar src={u.photoURL} name={u.displayName} size="sm" />
              <div className="bsdc-flex-1" style={{ minWidth: 0 }}>
                <div className="bsdc-flex bsdc-items-center bsdc-gap-xs">
                  <span className="bsdc-text-bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.displayName || u.username}
                  </span>
                  {u.isVerified && <VerificationBadge size={12} />}
                </div>
                <div className="bsdc-text-xs bsdc-text-muted">@{u.username}</div>
              </div>
              <IconUser size={14} color="#888" />
            </Link>
          ))}
        </>
      )}

      {posts.length > 0 && (
        <>
          <div className="bsdc-p-md" style={{ padding: '8px 16px 4px' }}>
            <span className="bsdc-text-xs bsdc-text-uppercase bsdc-text-muted">Posts</span>
          </div>
          {posts.slice(0, 6).map((p) => (
            <button
              key={p.id}
              type="button"
              className="bsdc-dropdown__item"
              onClick={() => onPick({ kind: 'post', value: p })}
            >
              <IconHash size={14} color="#888" />
              <div className="bsdc-flex-1" style={{ minWidth: 0 }}>
                <div className="bsdc-text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title || (p.content || '').slice(0, 80)}
                </div>
                <div className="bsdc-text-xs bsdc-text-muted">
                  {p.type} · @{p.authorUsername}
                </div>
              </div>
            </button>
          ))}
        </>
      )}
    </>
  );
}
