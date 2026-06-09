/**
 * src/pages/Tags.jsx
 * /tags/:tag — posts with a specific tag.
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useFeed from '../hooks/useFeed.js';
import FeedContainer from '../components/feed/FeedContainer.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { IconHash } from '../components/common/Icons.jsx';

export default function Tags() {
  const { tag } = useParams();
  const { profile } = useAuth();
  const t = decodeURIComponent(tag || '').toLowerCase();
  const feed = useFeed({ mode: 'tag', viewer: profile, tag: t });

  return (
    <>
      <Helmet>
        <title>#{t} — Posts | BSDC</title>
        <meta name="description" content={`Posts tagged #${t} on BSDC — Bangladesh Software Development Community.`} />
        <link rel="canonical" href={`https://www.bsdc.info.bd/tags/${encodeURIComponent(t)}`} />
      </Helmet>

      <div className="bsdc-card bsdc-mb-md bsdc-flex bsdc-items-center bsdc-gap-md">
        <span className="bsdc-bootstrap__icon" style={{ width: 48, height: 48, marginBottom: 0 }}>
          <IconHash size={24} color="#1a6b3a" />
        </span>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem' }}>#{t}</h1>
          <p className="bsdc-text-muted bsdc-text-sm" style={{ margin: 0 }}>
            All posts tagged <strong>#{t}</strong> on BSDC.
          </p>
        </div>
      </div>

      <FeedContainer
        {...feed}
        currentUser={profile}
        emptyTitle={`No posts for #${t} yet`}
        emptyBody="Be the first to use this tag."
      />
    </>
  );
}
