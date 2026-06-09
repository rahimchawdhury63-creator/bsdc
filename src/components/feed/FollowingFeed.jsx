/**
 * src/components/feed/FollowingFeed.jsx
 * Strict feed — only posts from accounts the viewer follows.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import useFeed from '../../hooks/useFeed.js';
import FeedContainer from './FeedContainer.jsx';

export default function FollowingFeed({ currentUser }) {
  const feed = useFeed({ mode: 'following', viewer: currentUser });

  if (!currentUser) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__title">Sign in to see your following feed</div>
        <Link to="/login" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">Sign in</Link>
      </div>
    );
  }

  return (
    <FeedContainer
      {...feed}
      currentUser={currentUser}
      emptyTitle="You're not following anyone yet"
      emptyBody="Use the right sidebar suggestions, or visit /explore to discover great developers."
    />
  );
}
