/**
 * src/components/feed/NearbyFeed.jsx
 * Location-based feed. Asks for browser geolocation on first open.
 */
import React, { useState, useMemo } from 'react';
import useFeed from '../../hooks/useFeed.js';
import useLocation from '../../hooks/useLocation.js';
import FeedContainer from './FeedContainer.jsx';
import { IconMapPin, IconAlert } from '../common/Icons.jsx';
import { toast } from '../common/Toast.jsx';

export default function NearbyFeed({ currentUser }) {
  const { coords, loading: geoLoading, error, request } = useLocation();
  const [enabled, setEnabled] = useState(!!coords);

  // Augment viewer with geo so feedAlgorithm can use distance.
  const viewer = useMemo(() => {
    if (!currentUser) return null;
    return { ...currentUser, geo: coords || null };
  }, [currentUser, coords]);

  const feed = useFeed({
    mode: enabled ? 'nearby' : 'trending',
    viewer
  });

  const enable = async () => {
    try {
      await request();
      setEnabled(true);
      toast.success('Showing posts near you.');
    } catch {
      toast.error('Could not get your location.');
    }
  };

  if (!enabled) {
    return (
      <div className="bsdc-card bsdc-text-center" style={{ padding: 'var(--space-2xl)' }}>
        <div className="bsdc-empty__icon"><IconMapPin /></div>
        <h2 style={{ fontSize: '1.2rem' }}>Discover posts near you</h2>
        <p className="bsdc-text-muted bsdc-text-sm">
          Allow location access (free, in-browser only) to see posts, jobs, and events from your area.
        </p>
        <button type="button" className="bsdc-btn bsdc-btn--primary bsdc-mt-md" onClick={enable} disabled={geoLoading}>
          {geoLoading ? 'Requesting…' : <><IconMapPin size={16} /> Enable nearby</>}
        </button>
        {error && (
          <p className="bsdc-text-sm bsdc-text-muted bsdc-mt-md">
            <IconAlert size={12} /> {error.message || 'Permission denied.'}
          </p>
        )}
      </div>
    );
  }

  return (
    <FeedContainer
      {...feed}
      currentUser={currentUser}
      emptyTitle="No posts near you yet"
      emptyBody="Try Trending or invite Bangladeshi developers in your city to join BSDC."
    />
  );
}
