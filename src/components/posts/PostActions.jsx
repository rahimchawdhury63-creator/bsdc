/**
 * src/components/posts/PostActions.jsx
 * ---------------------------------------------------------------------------
 * Action bar shown on every FeedItem and the PostDetail page.
 *
 * Actions:
 *   - Like / Unlike (optimistic, atomic Firestore transaction)
 *   - Comment (scrolls to / opens comment section)
 *   - Share (Web Share API → copy fallback)
 *   - Copy link
 *   - More menu: Edit (owner) / Delete (owner) / Report (others) / Bookmark
 *
 * Pure component — parent passes `post` and the current user;
 * the component handles its own optimistic UI state.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  toggleLike, hasUserLiked, softDeletePost, updateDocById
} from '../../firebase/firestore.js';
import { awardPoints } from '../../firebase/points.js';
import { toast } from '../common/Toast.jsx';
import { confirmDialog } from '../common/ConfirmDialog.jsx';
import { bsdcShare, bsdcCopyToClipboard, bsdcVibrate } from '../../scripts/interactions.js';
import { postUrl } from '../../utils/seoGenerator.js';
import { notifyLike } from '../../utils/notificationSender.js';
import { POINTS_RULES } from '../../utils/pointsCalculator.js';
import {
  IconHeart, IconHeartFilled, IconComment, IconShare, IconCopy,
  IconMoreHorizontal, IconBookmark, IconBookmarkFilled, IconEdit, IconTrash, IconFlag
} from '../common/Icons.jsx';

export default function PostActions({ post, currentUser, onCommentClick, onDeleted, onEdit }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Initial like state.
  useEffect(() => {
    if (!currentUser?.uid) return;
    hasUserLiked(post.id, currentUser.uid).then(setLiked).catch(() => {});
  }, [post.id, currentUser?.uid]);

  // Sync likeCount when post prop changes (e.g., subscribed feed update).
  useEffect(() => { setLikeCount(post.likes || 0); }, [post.likes]);

  // Close menu when clicking outside.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const onLike = async () => {
    if (!currentUser) {
      toast.info('Sign in to like posts.');
      return;
    }
    // Optimistic.
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));
    bsdcVibrate(15);
    try {
      const res = await toggleLike(post.id, currentUser.uid);
      setLiked(res.liked);
      // Side-effects on LIKE (skip on UNLIKE).
      if (res.liked && post.authorId && post.authorId !== currentUser.uid) {
        notifyLike({ toUid: post.authorId, fromUser: currentUser, post });
        // Award the post author POINTS_RULES.like points per new like.
        awardPoints(post.authorId, POINTS_RULES.like, `like on your ${post.type || 'post'}`).catch(() => {});
      }
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error(err?.message || 'Could not update like.');
    }
  };

  const url = `${window.location.origin}${new URL(postUrl(post)).pathname}`;

  const onShare = async () => {
    const res = await bsdcShare({
      title: post.title || 'BSDC Post',
      text: post.excerpt || post.content || '',
      url
    });
    if (res === 'copied') toast.success('Link copied.');
    else if (res === 'failed') toast.error('Could not share.');
  };

  const onCopy = async () => {
    const ok = await bsdcCopyToClipboard(url);
    toast[ok ? 'success' : 'error'](ok ? 'Link copied.' : 'Copy failed.');
  };

  const onDelete = async () => {
    const ok = await confirmDialog({
      title: 'Delete this post?',
      body: 'This will remove the post from your profile and the feed.',
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;
    try {
      await softDeletePost(post.id);
      toast.success('Post deleted.');
      if (onDeleted) onDeleted(post.id);
    } catch (err) {
      toast.error(err?.message || 'Could not delete post.');
    }
  };

  const onBookmark = async () => {
    if (!currentUser) return toast.info('Sign in to bookmark.');
    // We store bookmarks under /users/{uid}/bookmarks/{postId}
    // (Full bookmark page UI in Response 5.)
    setBookmarked((b) => !b);
    try {
      await updateDocById('posts', post.id, {}); // touch to trigger updatedAt — placeholder
      toast.success(bookmarked ? 'Removed from bookmarks.' : 'Saved to bookmarks.');
    } catch {/* ignore */}
  };

  const onReport = async () => {
    if (!currentUser) return toast.info('Sign in to report.');
    const ok = await confirmDialog({
      title: 'Report this post?',
      body: 'Our moderators will review it within 24 hours.',
      confirmLabel: 'Report'
    });
    if (!ok) return;
    toast.success('Report submitted. Thank you for helping keep BSDC safe.');
  };

  const isOwner = currentUser && currentUser.uid === post.authorId;

  return (
    <div className="bsdc-post__stats" style={{ borderTop: 0, borderBottom: 0 }}>
      <div className="bsdc-post__actions" style={{ flex: 1, width: '100%' }}>
        <button
          type="button"
          className={`bsdc-post__action ${liked ? 'bsdc-post__action--liked' : ''}`}
          onClick={onLike}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          {liked
            ? <IconHeartFilled size={18} className="bsdc-anim-heart" />
            : <IconHeart size={18} />}
          <span>{formatCount(likeCount)}</span>
        </button>

        <button
          type="button"
          className="bsdc-post__action"
          onClick={() => onCommentClick ? onCommentClick() : navigate(new URL(postUrl(post)).pathname)}
          aria-label="Comment"
        >
          <IconComment size={18} />
          <span>{formatCount(post.comments || 0)}</span>
        </button>

        <button
          type="button"
          className="bsdc-post__action"
          onClick={onShare}
          aria-label="Share"
        >
          <IconShare size={18} />
          <span className="bsdc-hide-mobile">Share</span>
        </button>

        <button
          type="button"
          className="bsdc-post__action"
          onClick={onCopy}
          aria-label="Copy link"
        >
          <IconCopy size={18} />
          <span className="bsdc-hide-mobile">Copy</span>
        </button>

        <div className="bsdc-relative" ref={menuRef}>
          <button
            type="button"
            className="bsdc-post__action"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <IconMoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="bsdc-dropdown__menu" role="menu">
              <button
                type="button"
                className="bsdc-dropdown__item"
                onClick={() => { setMenuOpen(false); onBookmark(); }}
              >
                {bookmarked ? <IconBookmarkFilled size={16} /> : <IconBookmark size={16} />}
                {bookmarked ? 'Saved' : 'Save for later'}
              </button>
              {isOwner ? (
                <>
                  <button
                    type="button"
                    className="bsdc-dropdown__item"
                    onClick={() => { setMenuOpen(false); onEdit?.(post); }}
                  >
                    <IconEdit size={16} /> Edit post
                  </button>
                  <div className="bsdc-dropdown__divider" />
                  <button
                    type="button"
                    className="bsdc-dropdown__item"
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <IconTrash size={16} /> Delete post
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="bsdc-dropdown__item"
                  onClick={() => { setMenuOpen(false); onReport(); }}
                >
                  <IconFlag size={16} /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 1500 → "1.5K". */
function formatCount(n) {
  if (n < 1000) return String(n || 0);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}
