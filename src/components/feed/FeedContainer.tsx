import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import { useFeed } from '@/hooks/useFeed';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { FeedFilter } from './FeedFilter';
import { FeedItem } from './FeedItem';
import { InfiniteScroll } from './InfiniteScroll';
import { StoryBar } from './StoryBar';
import { StoryCreator } from './StoryCreator';
import type { FeedType } from '@/services/feed.service';

/** Props for the main feed orchestrator. */
export interface FeedContainerProps {
  readonly initialFeedType?: FeedType;
  readonly showStories?: boolean;
}

/**
 * Main feed orchestrator connected to Firestore posts and stories.
 * It shows loading, error, empty, and pagination states without demo content.
 */
export const FeedContainer = ({ initialFeedType = 'for-you', showStories = true }: FeedContainerProps) => {
  const [feedType, setFeedType] = useState<FeedType>(initialFeedType);
  const { firebaseUser } = useAuth();
  const { posts, isLoading, isLoadingMore, error, hasMore, loadMore, refresh } = useFeed({ feedType, userId: firebaseUser?.uid, pageSize: 20 });
  const rankedPosts = usePersonalizedFeed(posts, feedType);

  return (
    <section className="feed-container" aria-labelledby="feed-title">
      <header className="feed-header">
        <div>
          <h1 id="feed-title">BSDC Feed</h1>
          <p className="text-muted">Real-time public posts from Firebase Firestore.</p>
        </div>
        <Button type="button" variant="secondary" onClick={refresh}>Refresh</Button>
      </header>
      <FeedFilter value={feedType} onChange={setFeedType} />
      {showStories ? <><StoryBar /><StoryCreator /></> : null}
      {isLoading ? <div className="feed-status"><Spinner /></div> : null}
      {error ? <div className="feed-status feed-status--error"><p>{error}</p><Button type="button" onClick={refresh}>Retry</Button></div> : null}
      {!isLoading && !error && rankedPosts.length === 0 ? (
        <div className="feed-empty">
          <h2>No posts found</h2>
          <p className="text-muted">BSDC will show real Firestore posts here after community members publish public content.</p>
        </div>
      ) : null}
      <div className="feed-list">
        {rankedPosts.map((post) => <FeedItem post={post} key={post.id} />)}
      </div>
      {!isLoading && !error && rankedPosts.length > 0 ? <InfiniteScroll hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={loadMore} /> : null}
    </section>
  );
};
