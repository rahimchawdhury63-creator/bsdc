/**
 * src/pages/PostDetail.jsx
 * ---------------------------------------------------------------------------
 * Single-post view. Mounted at MANY routes (one per post type) so URLs
 * stay clean (/blog/:slug, /qa/:slug, /code/:slug, etc.).
 *
 * Responsibilities:
 *   - Fetch by slug (with id fallback)
 *   - Render full type-aware body
 *   - Emit complete SEO (AutoSEO) + breadcrumbs
 *   - Mount the CommentSection
 *   - Increment views once per session
 *   - 404 state if not found / soft-deleted
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  collection, query, where, limit, getDocs, doc, getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { incrementViews } from '../firebase/firestore.js';
import { useAuth } from '../hooks/useAuth.js';
import AutoSEO from '../components/seo/AutoSEO.jsx';
import BreadcrumbSEO from '../components/seo/BreadcrumbSEO.jsx';
import FeedItem from '../components/feed/FeedItem.jsx';
import CommentSection from '../components/comments/CommentSection.jsx';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { TYPE_URL_SEGMENT } from '../utils/seoGenerator.js';
import { IconBookOpen, IconChevronLeft } from '../components/common/Icons.jsx';

const VIEW_KEY = 'bsdc.viewed.v1';

/** Mark a post as "viewed this session" so we count once per browser session. */
function alreadyViewedThisSession(id) {
  try {
    const v = JSON.parse(sessionStorage.getItem(VIEW_KEY) || '{}');
    if (v[id]) return true;
    v[id] = 1;
    sessionStorage.setItem(VIEW_KEY, JSON.stringify(v));
    return false;
  } catch { return false; }
}

export default function PostDetail({ expectedType }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        // 1. Try slug lookup.
        let found = null;
        const slugSnap = await getDocs(query(
          collection(db, 'posts'),
          where('slug', '==', slug),
          limit(1)
        ));
        if (!slugSnap.empty) {
          found = { id: slugSnap.docs[0].id, ...slugSnap.docs[0].data() };
        } else {
          // 2. Fallback: treat slug as the post ID.
          const idSnap = await getDoc(doc(db, 'posts', slug));
          if (idSnap.exists()) found = { id: idSnap.id, ...idSnap.data() };
        }

        if (cancelled) return;
        // 3. Filter deleted / mismatched type.
        if (!found || found.status === 'deleted') {
          setPost(null);
        } else if (expectedType && found.type !== expectedType) {
          // Redirect to the correct URL segment to avoid duplicate-content.
          const seg = TYPE_URL_SEGMENT[found.type] || 'post';
          navigate(`/${seg}/${found.slug || found.id}`, { replace: true });
          return;
        } else {
          setPost(found);
          if (!alreadyViewedThisSession(found.id)) incrementViews(found.id);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[BSDC] PostDetail load:', err);
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, expectedType, navigate]);

  if (loading) return <LoadingCenter label="Loading post…" />;

  if (!post) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__icon"><IconBookOpen /></div>
        <div className="bsdc-empty__title">Post not found</div>
        <div className="bsdc-empty__body">It may have been deleted or never existed.</div>
        <Link to="/" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">Back to home</Link>
      </div>
    );
  }

  const typeLabelMap = {
    blog: 'Blog', doc: 'Documentation', wiki: 'Wiki', qa: 'Q&A',
    code: 'Code', project: 'Project', job: 'Jobs', notice: 'Notice',
    poll: 'Poll', event: 'Event', video: 'Video', image: 'Image',
    text: 'Posts', story: 'Story'
  };
  const seg = TYPE_URL_SEGMENT[post.type] || 'post';
  const hubLabel = typeLabelMap[post.type] || 'Posts';
  const hubUrl = post.type === 'job' ? '/jobs'
              : post.type === 'wiki' ? '/wiki'
              : post.type === 'blog' || post.type === 'doc' ? '/explore?tab=blog'
              : `/explore`;

  return (
    <article>
      <AutoSEO post={post} />

      <BreadcrumbSEO
        items={[
          { name: 'Home', url: '/' },
          { name: hubLabel, url: hubUrl },
          { name: post.title || `${hubLabel} post`, url: `/${seg}/${post.slug || post.id}` }
        ]}
      />

      <button
        type="button"
        className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm bsdc-mb-md"
        onClick={() => (window.history.length > 1 ? window.history.back() : navigate('/'))}
        aria-label="Back"
      >
        <IconChevronLeft size={16} /> Back
      </button>

      {/* Re-use FeedItem for consistent presentation; it already handles every type. */}
      <FeedItem post={post} currentUser={profile} />

      {/* Long-form prose for blog/doc/wiki — full markdown is shown via FeedItem's truncation,
          but on the detail page we also expose the FULL plain content so crawlers see it. */}
      {(post.type === 'blog' || post.type === 'doc' || post.type === 'wiki' || post.type === 'notice')
        && post.content && post.content.length > 300 && (
        <div className="bsdc-card bsdc-mt-md bsdc-prose" itemProp="articleBody">
          {/* Plain rendering — we deliberately avoid HTML injection.
              Markdown rendering can be added by a future module without
              changing this contract. */}
          <pre style={{
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            background: 'transparent', color: 'inherit',
            padding: 0, fontFamily: 'inherit', fontSize: '1.02rem'
          }}>{post.content}</pre>
        </div>
      )}

      <CommentSection post={post} />
    </article>
  );
}
