/**
 * src/components/comments/CommentItem.jsx
 * ---------------------------------------------------------------------------
 * Renders a single comment + its nested replies (one level deep).
 *
 * Why one level: avoids unbounded recursion that Reddit-style threads get
 * stuck in; matches what most modern community apps (Twitter, dev.to) do.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  collection, query, where, orderBy, getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { addComment } from '../../firebase/firestore.js';
import { useAuth } from '../../hooks/useAuth.js';
import Avatar from '../common/Avatar.jsx';
import VerificationBadge from '../verification/VerificationBadge.jsx';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import { relativeTime } from '../../utils/dateFormatter.js';
import { IconHeart, IconMessage, IconSend } from '../common/Icons.jsx';

export default function CommentItem({ comment, postId, depth = 0 }) {
  const { profile } = useAuth();
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      const snap = await getDocs(query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        where('parentId', '==', comment.id),
        orderBy('createdAt', 'asc')
      ));
      setReplies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[BSDC] load replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    if (showReplies) loadReplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReplies]);

  const submitReply = async (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !profile) return;
    setBusy(true);
    try {
      const id = await addComment(postId, {
        uid: profile.uid,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        photoURL: profile.photoURL
      }, text, comment.id);
      // Append locally so the user sees it instantly.
      setReplies((rs) => [...rs, {
        id, postId, parentId: comment.id, content: text,
        authorId: profile.uid, authorUsername: profile.username,
        authorDisplayName: profile.displayName || profile.username,
        authorPhotoURL: profile.photoURL, likes: 0,
        createdAt: { toDate: () => new Date() }
      }]);
      setReplyText('');
      setReplyOpen(false);
      setShowReplies(true);
    } catch (err) {
      toast.error(err?.message || 'Could not post reply.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginLeft: depth ? 36 : 0 }}>
      <div className="bsdc-flex bsdc-gap-sm" style={{ marginBottom: 8 }}>
        <Link to={`/p/${comment.authorUsername}`}>
          <Avatar src={comment.authorPhotoURL} name={comment.authorDisplayName} size="sm" />
        </Link>
        <div className="bsdc-flex-1">
          <div
            style={{
              background: 'var(--color-bg)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div className="bsdc-flex bsdc-items-center bsdc-gap-xs bsdc-text-sm">
              <Link to={`/p/${comment.authorUsername}`} className="bsdc-text-bold">
                {comment.authorDisplayName}
              </Link>
              {comment.authorIsVerified && <VerificationBadge size={12} />}
              <span className="bsdc-text-muted bsdc-text-xs">@{comment.authorUsername}</span>
            </div>
            <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {comment.content}
            </p>
          </div>
          <div className="bsdc-flex bsdc-gap-md bsdc-items-center bsdc-text-xs bsdc-text-muted" style={{ marginTop: 4 }}>
            <span>{relativeTime(comment.createdAt)}</span>
            <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm" style={{ minHeight: 0, padding: '2px 6px' }}>
              <IconHeart size={12} /> {comment.likes || 0}
            </button>
            {depth === 0 && (
              <button
                type="button"
                className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm"
                style={{ minHeight: 0, padding: '2px 6px' }}
                onClick={() => setReplyOpen((v) => !v)}
              >
                <IconMessage size={12} /> Reply
              </button>
            )}
          </div>

          {/* Reply composer */}
          {replyOpen && depth === 0 && (
            <form onSubmit={submitReply} className="bsdc-flex bsdc-gap-sm" style={{ marginTop: 6 }}>
              <input
                type="text"
                className="bsdc-input"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.authorDisplayName}…`}
                maxLength={1000}
                autoFocus
              />
              <button type="submit" className="bsdc-btn bsdc-btn--primary bsdc-btn--sm" disabled={busy || !replyText.trim()}>
                {busy ? <Spinner size="sm" /> : <IconSend size={14} />}
              </button>
            </form>
          )}

          {/* Show / load replies */}
          {depth === 0 && (
            <>
              {!showReplies && (
                <button
                  type="button"
                  className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm"
                  style={{ minHeight: 0, padding: '4px 8px', marginTop: 4, color: 'var(--color-primary)' }}
                  onClick={() => setShowReplies(true)}
                >
                  View replies
                </button>
              )}
              {showReplies && (
                <div style={{ marginTop: 8 }}>
                  {loadingReplies && <Spinner size="sm" />}
                  {replies.map((r) => (
                    <CommentItem key={r.id} comment={r} postId={postId} depth={1} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
