import { useCallback, useEffect, useState } from 'react';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { fetchFeedPage, subscribeToFeed, type FeedType } from '@/services/feed.service';
import type { BSDCPost, PostType } from '@/types';

/** Hook options for configuring a real Firestore feed subscription. */
export interface UseFeedOptions {
  readonly feedType: FeedType;
  readonly userId?: string | undefined;
  readonly communityId?: string | undefined;
  readonly postType?: PostType | undefined;
  readonly pageSize?: number;
}

/** Hook return object consumed by feed container components. */
export interface UseFeedResult {
  readonly posts: readonly BSDCPost[];
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly error: string | null;
  readonly hasMore: boolean;
  readonly loadMore: () => Promise<void>;
  readonly refresh: () => void;
}

/**
 * Subscribes to a real Firestore posts feed and supports cursor pagination.
 * No placeholder posts are created; empty collections render an empty state.
 */
export const useFeed = ({ feedType, userId, communityId, postType, pageSize = 20 }: UseFeedOptions): UseFeedResult => {
  const [posts, setPosts] = useState<readonly BSDCPost[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const unsubscribe = subscribeToFeed(
      { feedType, userId, communityId, postType, pageSize, cursor: null },
      (nextPosts) => {
        setPosts(nextPosts);
        setHasMore(nextPosts.length >= pageSize);
        setIsLoading(false);
        setCursor(null);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [communityId, feedType, pageSize, postType, refreshToken, userId]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await fetchFeedPage({ feedType, userId, communityId, postType, pageSize, cursor });
      setPosts((currentPosts) => {
        const existingIds = new Set(currentPosts.map((post) => post.id));
        const uniquePosts = result.posts.filter((post) => !existingIds.has(post.id));
        return [...currentPosts, ...uniquePosts];
      });
      setCursor(result.cursor);
      setHasMore(result.posts.length >= pageSize);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load more posts.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [communityId, cursor, feedType, hasMore, isLoadingMore, pageSize, postType, userId]);

  const refresh = useCallback(() => setRefreshToken((value) => value + 1), []);

  return { posts, isLoading, isLoadingMore, error, hasMore, loadMore, refresh };
};
