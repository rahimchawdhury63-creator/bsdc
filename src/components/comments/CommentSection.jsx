/**
 * src/components/comments/CommentSection.jsx
 * ---------------------------------------------------------------------------
 * Full comment system for a post. Composer + paginated list.
 *
 * Sub-components:
 *   - <CommentItem /> handles per-comment UI + nested replies.
 *
 * Loads 20 top-level comments at a time with "Load more" pagination.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { addComment, listComments } from '../../firebase/firestore.js';
import { awardPoints } from '../../firebase/points.js';
import { useAuth } from '../../hooks/useAuth.js';
import { notifyComment } from '../../utils/notificationSender.js';
import { POINTS_RULES } from '../../utils/pointsCalculator.js';
import { toast } from '../common/Toast.jsx';
import Spinner, { LoadingCenter } from '../common/Spinner.jsx';
import Avatar from '../common/Avatar.jsx';
import CommentItem from './CommentItem.jsx';
import { IconSend, IconMessage } from '../common/Icons.jsx';
import { Link } from 'react-router-dom';

export default function CommentSection({ post }) {
  const { profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listComments(post.id, { pageSize: 20 }).then((res) => {
      if (cancelled) return;
      setComments(res.comments);
      setLastDoc(res.lastDoc);
      setHasMore(res.hasMore);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [post.id]);

  const loadMore = async () => {
    if (!hasMore) return;
    const res = await listComments(post.id, { pageSize: 20, lastDoc });
    setComments((c) => [...c, ...res.comments]);
    setLastDoc(res.lastDoc);
    setHasMore(res.hasMore);
  };

  const submit = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !profile) return;
    setBusy(true);
    try {
      const id = await addComment(post.id, {
        uid: profile.uid,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        photoURL: profile.photoURL
      }, content);
      // Prepend so the user sees it instantly.
      setComments((c) => [{
        id, postId: post.id, parentId: null, content,
        authorId: profile.uid, authorUsername: profile.username,
        authorDisplayName: profile.displayName || profile.username,
        authorPhotoURL: profile.photoURL, likes: 0,
        createdAt: { toDate: () => new Date() }
      }, ...c]);
      setText('');
      // Side-effects.
      if (post.authorId && post.authorId !== profile.uid) {
        notifyComment({ toUid: post.authorId, fromUser: profile, post, snippet: content });
        awardPoints(post.authorId, POINTS_RULES.comment, `comment on your ${post.type || 'post'}`).catch(() => {});
      }
    } catch (err) {
      toast.error(err?.message || 'Could not post comment.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bsdc-card bsdc-mt-md" aria-label="Comments">
      <h3 className="bsdc-flex bsdc-items-center bsdc-gap-sm" style={{ fontSize: '1rem', margin: '0 0 12px' }}>
        <IconMessage size={18} /> Comments ({post.comments || 0})
      </h3>

      {profile ? (
        <form onSubmit={submit} className="bsdc-flex bsdc-gap-sm">
          <Avatar src={profile.photoURL} name={profile.displayName} size="sm" />
          <input
            type="text"
            className="bsdc-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            maxLength={1000}
          />
          <button type="submit" className="bsdc-btn bsdc-btn--primary" disabled={busy || !text.trim()}>
            {busy ? <Spinner size="sm" /> : <IconSend size={16} />}
          </button>
        </form>
      ) : (
        <div className="bsdc-text-muted bsdc-text-sm" style={{ padding: '8px 0' }}>
          <Link to="/login">Sign in</Link> to join the conversation.
        </div>
      )}

      <div className="bsdc-divider" />

      {loading ? (
        <LoadingCenter label="Loading comments…" />
      ) : comments.length === 0 ? (
        <p className="bsdc-text-muted bsdc-text-sm bsdc-text-center" style={{ padding: '16px 0' }}>
          Be the first to comment.
        </p>
      ) : (
        <>
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} postId={post.id} />
          ))}
          {hasMore && (
            <div className="bsdc-text-center bsdc-mt-md">
              <button type="button" className="bsdc-btn bsdc-btn--ghost" onClick={loadMore}>
                Load more comments
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
