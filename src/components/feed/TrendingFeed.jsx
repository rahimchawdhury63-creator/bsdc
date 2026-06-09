/**
 * src/components/feed/TrendingFeed.jsx
 * Hottest posts by engagement * recency, no personalization.
 */
import React from 'react';
import useFeed from '../../hooks/useFeed.js';
import FeedContainer from './FeedContainer.jsx';

export default function TrendingFeed({ currentUser }) {
  const feed = useFeed({ mode: 'trending', viewer: currentUser });
  return (
    <FeedContainer
      {...feed}
      currentUser={currentUser}
      emptyTitle="No trending posts yet"
      emptyBody="As the community engages, the hottest posts appear here automatically."
    />
  );
}
