/**
 * src/hooks/useInfiniteScroll.js
 * ---------------------------------------------------------------------------
 * Re-usable hook that triggers `onLoadMore()` when a sentinel element
 * enters the viewport.
 *
 * Usage:
 *   const sentinelRef = useInfiniteScroll(loadMore, { hasMore, loading });
 *   ...
 *   <div ref={sentinelRef} />
 * ---------------------------------------------------------------------------
 */

import { useEffect, useRef } from 'react';

export default function useInfiniteScroll(onLoadMore, { hasMore, loading, rootMargin = '400px' } = {}) {
  const sentinelRef = useRef(null);
  // Keep the latest callback in a ref so we don't reset the observer on every render.
  const cbRef = useRef(onLoadMore);
  useEffect(() => { cbRef.current = onLoadMore; }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !loading) {
          cbRef.current?.();
        }
      }
    }, { rootMargin, threshold: 0.01 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, rootMargin]);

  return sentinelRef;
}
