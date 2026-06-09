/**
 * src/components/feed/FeedContainer.jsx
 * ---------------------------------------------------------------------------
 * Generic feed list — takes the result of useFeed() and renders the cards
 * plus the infinite-scroll sentinel + empty/loading states.
 *
 * Used by ForYouFeed / FollowingFeed / TrendingFeed / NearbyFeed and
 * by tag/community pages.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import FeedItem from './FeedItem.jsx';
import useInfiniteScroll from '../../hooks/useInfiniteScroll.js';
import Spinner, { LoadingCenter } from '../common/Spinner.jsx';
import { IconRefresh, IconBookOpen } from '../common/Icons.jsx';

export default function FeedContainer({
  posts,
  loading,
  hasMore,
  loadMore,
  refresh,
  currentUser,
  onDeleted,
  emptyTitle = 'Nothing here yet',
  emptyBody = 'Be the first to post.'
}) {
  const sentinelRef = useInfiniteScroll(loadMore, { hasMore, loading });

  // First load.
  if (loading && posts.length === 0) {
    return <LoadingCenter label="Loading feed…" />;
  }

  // True empty state.
  if (!loading && posts.length === 0) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__icon"><IconBookOpen /></div>
        <div className="bsdc-empty__title">{emptyTitle}</div>
        <div className="bsdc-empty__body">{emptyBody}</div>
        <button type="button" className="bsdc-btn bsdc-btn--outline bsdc-mt-md" onClick={refresh}>
          <IconRefresh size={16} /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      {posts.map((p) => (
        <FeedItem
          key={p.id}
          post={p}
          currentUser={currentUser}
          onDeleted={onDeleted}
        />
      ))}

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />

      {loading && (
        <div className="bsdc-loading-center"><Spinner /> Loading more…</div>
      )}
      {!hasMore && posts.length > 0 && (
        <p className="bsdc-text-center bsdc-text-muted bsdc-text-sm" style={{ padding: 'var(--space-lg) 0' }}>
          You've reached the end. Pull down to refresh for new posts.
        </p>
      )}
    </div>
  );
}
