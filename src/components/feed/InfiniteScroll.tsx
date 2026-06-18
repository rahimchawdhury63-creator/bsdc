import { useEffect, useRef } from 'react';
import { Button } from '@components/ui/Button';

/** Props for the intersection-observer based infinite scroll trigger. */
export interface InfiniteScrollProps {
  readonly hasMore: boolean;
  readonly isLoading: boolean;
  readonly onLoadMore: () => Promise<void>;
}

/** Infinite scroll trigger with a keyboard-accessible fallback button. */
export const InfiniteScroll = ({ hasMore, isLoading, onLoadMore }: InfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];
      if (firstEntry?.isIntersecting && !isLoading) {
        void onLoadMore();
      }
    }, { rootMargin: '320px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore) {
    return <p className="feed-end text-muted">No more posts are available.</p>;
  }

  return (
    <div className="infinite-scroll" ref={sentinelRef}>
      <Button type="button" variant="secondary" isLoading={isLoading} onClick={() => void onLoadMore()}>Load more posts</Button>
    </div>
  );
};
