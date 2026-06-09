/**
 * src/pages/Explore.jsx
 * Trending feed with type filters — separate from Home so URLs differ.
 */
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import useFeed from '../hooks/useFeed.js';
import FeedContainer from '../components/feed/FeedContainer.jsx';
import { useAuth } from '../hooks/useAuth.js';
import {
  IconText, IconImage, IconVideo, IconCode, IconBlog, IconQuestion,
  IconBriefcase, IconEvent, IconPoll, IconFire
} from '../components/common/Icons.jsx';

const FILTERS = [
  { id: null, label: 'All', Icon: IconFire },
  { id: 'blog', label: 'Blog', Icon: IconBlog },
  { id: 'code', label: 'Code', Icon: IconCode },
  { id: 'qa', label: 'Q&A', Icon: IconQuestion },
  { id: 'image', label: 'Images', Icon: IconImage },
  { id: 'video', label: 'Video', Icon: IconVideo },
  { id: 'job', label: 'Jobs', Icon: IconBriefcase },
  { id: 'event', label: 'Events', Icon: IconEvent },
  { id: 'poll', label: 'Polls', Icon: IconPoll },
  { id: 'text', label: 'Text', Icon: IconText }
];

export default function Explore() {
  const { profile } = useAuth();
  const [filter, setFilter] = useState(null);
  const feed = useFeed({ mode: 'trending', viewer: profile, filterType: filter });

  return (
    <>
      <Helmet>
        <title>Explore | BSDC — Bangladesh Software Development Community</title>
        <meta name="description" content="Discover trending posts, code snippets, blog articles, jobs, and events from Bangladesh's developer community." />
        <link rel="canonical" href="https://www.bsdc.info.bd/explore" />
      </Helmet>

      <h1 style={{ fontSize: '1.4rem', marginBottom: 'var(--space-md)' }}>Explore BSDC</h1>

      <div className="bsdc-flex bsdc-flex-wrap bsdc-gap-xs bsdc-mb-md">
        {FILTERS.map(({ id, label, Icon }) => (
          <button
            key={String(id)}
            type="button"
            className={`bsdc-chip ${filter === id ? 'bsdc-chip--active' : ''}`}
            onClick={() => setFilter(id)}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      <FeedContainer
        {...feed}
        currentUser={profile}
        emptyTitle="Nothing matches yet"
        emptyBody="Try a different filter, or be the first to post."
      />
    </>
  );
}
