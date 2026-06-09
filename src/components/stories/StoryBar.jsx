/**
 * src/components/stories/StoryBar.jsx
 * ---------------------------------------------------------------------------
 * Instagram-style stories row. Fetches non-expired story posts grouped
 * by author, plus an "Add story" tile for the current user.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import {
  collection, query, where, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../hooks/useAuth.js';
import { IconPlus } from '../common/Icons.jsx';
import PostCreator from '../posts/PostCreator.jsx';

export default function StoryBar({ onView }) {
  const { profile } = useAuth();
  const [groups, setGroups] = useState([]); // [{ author, stories[] }]
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const snap = await getDocs(query(
          collection(db, 'posts'),
          where('type', '==', 'story'),
          where('status', '==', 'active'),
          where('createdAt', '>=', since),
          orderBy('createdAt', 'desc'),
          limit(50)
        ));
        const byAuthor = new Map();
        snap.docs.forEach((d) => {
          const data = { id: d.id, ...d.data() };
          if (!byAuthor.has(data.authorId)) {
            byAuthor.set(data.authorId, {
              authorId: data.authorId,
              username: data.authorUsername,
              displayName: data.authorDisplayName,
              photoURL: data.authorPhotoURL,
              stories: []
            });
          }
          byAuthor.get(data.authorId).stories.push(data);
        });
        if (!cancelled) setGroups([...byAuthor.values()]);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[BSDC] StoryBar load:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="bsdc-story-bar" aria-label="Stories">
        {/* Add story tile (own) */}
        {profile && (
          <button
            type="button"
            className="bsdc-story-item"
            onClick={() => setComposerOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div
              className="bsdc-story-item__ring"
              style={{
                background: 'var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <div className="bsdc-story-item__inner" style={{
                background: 'var(--color-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <IconPlus size={22} color="#1a6b3a" />
              </div>
            </div>
            <div className="bsdc-story-item__name">Your story</div>
          </button>
        )}

        {groups.length === 0 && (
          <div className="bsdc-text-sm bsdc-text-muted" style={{ alignSelf: 'center' }}>
            No active stories. Share one — it disappears in 24 hours.
          </div>
        )}

        {groups.map((g) => (
          <button
            key={g.authorId}
            type="button"
            className="bsdc-story-item"
            onClick={() => onView?.(g)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div className="bsdc-story-item__ring">
              <div className="bsdc-story-item__inner">
                {g.photoURL
                  ? <img src={g.photoURL} alt="" className="bsdc-story-item__avatar" loading="lazy" />
                  : <div className="bsdc-story-item__avatar bsdc-flex bsdc-items-center bsdc-justify-center bsdc-text-bold">
                      {(g.displayName || g.username || '?').slice(0, 1).toUpperCase()}
                    </div>}
              </div>
            </div>
            <div className="bsdc-story-item__name">{g.username}</div>
          </button>
        ))}
      </div>

      <PostCreator
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        currentUser={profile}
        initialType="story"
      />
    </>
  );
}
