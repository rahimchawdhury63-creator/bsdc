/**
 * src/pages/Home.jsx
 * ---------------------------------------------------------------------------
 * The home feed page. Combines:
 *   - StoryBar (24h stories)
 *   - Composer trigger (opens <PostCreator />)
 *   - Tabbed feed: For You / Following / Trending / Nearby
 *
 * Tab state is persisted in URL hash (?tab=) so refresh keeps it.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import SEOHead from '../components/seo/SEOHead.jsx';
import StoryBar from '../components/stories/StoryBar.jsx';
import PostCreator from '../components/posts/PostCreator.jsx';
import ForYouFeed from '../components/feed/ForYouFeed.jsx';
import FollowingFeed from '../components/feed/FollowingFeed.jsx';
import TrendingFeed from '../components/feed/TrendingFeed.jsx';
import NearbyFeed from '../components/feed/NearbyFeed.jsx';
import Avatar from '../components/common/Avatar.jsx';
import {
  IconLightning, IconUsers, IconFire, IconMapPin, IconImage, IconCode, IconText
} from '../components/common/Icons.jsx';

const TABS = [
  { id: 'for-you',   label: 'For You',   Icon: IconLightning, requireAuth: false },
  { id: 'following', label: 'Following', Icon: IconUsers,     requireAuth: true  },
  { id: 'trending',  label: 'Trending',  Icon: IconFire,      requireAuth: false },
  { id: 'nearby',    label: 'Nearby',    Icon: IconMapPin,    requireAuth: false }
];

export default function Home() {
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'for-you');
  const [composer, setComposer] = useState({ open: false, initialType: null });

  // Keep URL synced with tab.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (tab === 'for-you') next.delete('tab'); else next.set('tab', tab);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Honour ?compose=1 from the PWA shortcut.
  useEffect(() => {
    if (params.get('compose') === '1') {
      setComposer({ open: true, initialType: null });
      const next = new URLSearchParams(params);
      next.delete('compose');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ActiveFeed = ({
    'for-you':   ForYouFeed,
    'following': FollowingFeed,
    'trending':  TrendingFeed,
    'nearby':    NearbyFeed
  })[tab] || ForYouFeed;

  return (
    <>
      <SEOHead
        title="Home"
        description="Your personalised BSDC feed: posts, code snippets, jobs, events and more from Bangladesh's developer community."
        canonical="/"
        ogType="website"
      />

      <StoryBar />

      {profile && (
        <ComposerTrigger
          profile={profile}
          onOpen={(initialType) => setComposer({ open: true, initialType })}
        />
      )}

      <div className="bsdc-feed-tabs">
        <div className="bsdc-tabs" role="tablist">
          {TABS.map(({ id, label, Icon, requireAuth }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`bsdc-tab ${tab === id ? 'bsdc-tab--active' : ''}`}
              onClick={() => setTab(id)}
              disabled={requireAuth && !profile}
              title={requireAuth && !profile ? 'Sign in to use this feed' : undefined}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <ActiveFeed currentUser={profile} />

      <PostCreator
        open={composer.open}
        onClose={() => setComposer({ open: false, initialType: null })}
        currentUser={profile}
        initialType={composer.initialType}
      />
    </>
  );
}

function ComposerTrigger({ profile, onOpen }) {
  return (
    <div className="bsdc-composer-trigger">
      <Avatar src={profile.photoURL} name={profile.displayName} />
      <button
        type="button"
        className="bsdc-composer-trigger__input bsdc-text-left"
        onClick={() => onOpen(null)}
        style={{ textAlign: 'left', border: 'none', cursor: 'pointer' }}
      >
        Share something with the community, {profile.displayName?.split(' ')[0] || profile.username}…
      </button>
      <div className="bsdc-composer-trigger__actions">
        <button
          type="button"
          className="bsdc-icon-btn"
          aria-label="Add image post"
          onClick={() => onOpen('image')}
        >
          <IconImage />
        </button>
        <button
          type="button"
          className="bsdc-icon-btn bsdc-hide-mobile"
          aria-label="Add code snippet"
          onClick={() => onOpen('code')}
        >
          <IconCode />
        </button>
        <button
          type="button"
          className="bsdc-icon-btn bsdc-hide-mobile"
          aria-label="Add text post"
          onClick={() => onOpen('text')}
        >
          <IconText />
        </button>
      </div>
    </div>
  );
}
