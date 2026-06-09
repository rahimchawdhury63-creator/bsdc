/**
 * src/components/feed/ForYouFeed.jsx
 * Personalised feed — engagement * recency * personalBoost.
 */
import React from 'react';
import useFeed from '../../hooks/useFeed.js';
import FeedContainer from './FeedContainer.jsx';

export default function ForYouFeed({ currentUser }) {
  const feed = useFeed({ mode: 'for-you', viewer: currentUser });
  return (
    <FeedContainer
      {...feed}
      currentUser={currentUser}
      emptyTitle="Your feed is empty"
      emptyBody="Follow some developers or post something — the For You feed adapts to your interests."
    />
  );
}
