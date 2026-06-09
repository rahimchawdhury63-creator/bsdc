/**
 * src/components/profile/ProfileFeed.jsx
 * ---------------------------------------------------------------------------
 * Lists posts authored by the profile user. Tab switcher between:
 *   - Posts (default)
 *   - Reposts
 *   - Liked
 *
 * Uses a minimal "post card preview" until the full FeedItem (Response 5)
 * is wired in. Once Response 5 ships, we delegate rendering to FeedItem.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection, query, where, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { LoadingCenter } from '../common/Spinner.jsx';
import { IconBookOpen, IconHeart, IconRepost, IconMessage, IconCalendar } from '../common/Icons.jsx';

const TABS = [
  { id: 'posts',    label: 'Posts',   Icon: IconBookOpen },
  { id: 'reposts',  label: 'Reposts', Icon: IconRepost },
  { id: 'liked',    label: 'Liked',   Icon: IconHeart }
];

export default function ProfileFeed({ profile }) {
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!profile?.uid) return;
      setLoading(true);
      try {
        let snap;
        if (tab === 'posts') {
          snap = await getDocs(query(
            collection(db, 'posts'),
            where('authorId', '==', profile.uid),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(20)
          ));
        } else if (tab === 'liked') {
          // Liked posts are stored as sub-collection /posts/{postId}/likes/{uid}.
          // Building a "my likes" view requires a separate index of postIds
          // in the user doc — full implementation arrives in Response 4.
          snap = { docs: [] };
        } else {
          // Reposts not yet wired up either (Response 4).
          snap = { docs: [] };
        }
        if (!cancelled) {
          setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[BSDC] ProfileFeed load error:', err);
        if (!cancelled) {
          setPosts([]);
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [profile?.uid, tab]);

  return (
    <div className="bsdc-mt-md">
      <div className="bsdc-tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`bsdc-tab ${tab === id ? 'bsdc-tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingCenter />
      ) : posts.length === 0 ? (
        <div className="bsdc-empty">
          <div className="bsdc-empty__icon"><IconBookOpen /></div>
          <div className="bsdc-empty__title">Nothing here yet</div>
          <div className="bsdc-empty__body">
            {tab === 'posts'
              ? `${profile.displayName || profile.username} hasn't posted yet.`
              : tab === 'liked'
                ? 'Liked posts will appear here.'
                : 'Reposts will appear here.'}
          </div>
        </div>
      ) : (
        <div className="bsdc-mt-md">
          {posts.map((p) => <PostPreview key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}

/**
 * Minimal post preview — replaced by full <FeedItem /> in Response 5.
 * Intentionally kept simple so this page works in isolation.
 */
function PostPreview({ post }) {
  const date = post.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  return (
    <article className="bsdc-post">
      <div className="bsdc-post__header">
        <span className="bsdc-post__type-pill">{post.type || 'post'}</span>
        <div className="bsdc-flex-1" />
        <span className="bsdc-text-xs bsdc-text-muted">
          <IconCalendar size={12} /> {date}
        </span>
      </div>
      <div className="bsdc-post__body">
        {post.title && (
          <Link to={postUrl(post)} className="bsdc-post__title bsdc-text-primary">{post.title}</Link>
        )}
        <p style={{ margin: 0 }}>
          {(post.excerpt || post.content || '').slice(0, 240)}
          {(post.content || '').length > 240 ? '…' : ''}
        </p>
      </div>
      <div className="bsdc-post__stats">
        <span><IconHeart size={12} /> {post.likes || 0}</span>
        <span><IconMessage size={12} /> {post.comments || 0}</span>
      </div>
    </article>
  );
}

function postUrl(p) {
  const slug = p.slug || p.id;
  const map = { qa: 'qa', blog: 'blog', doc: 'doc', wiki: 'wiki', code: 'code', project: 'project', job: 'jobs' };
  const seg = map[p.type] || 'post';
  return `/${seg}/${slug}`;
}
