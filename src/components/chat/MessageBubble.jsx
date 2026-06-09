/**
 * src/components/chat/MessageBubble.jsx
 * ---------------------------------------------------------------------------
 * Single message bubble. Handles:
 *   - Direction (in / out) styling
 *   - Image / file / text body
 *   - Time + seen indicator
 *   - Reaction strip
 *   - Hover menu: delete (own), copy, react
 *
 * Reactions are stored as { [uid]: 'name' } so each user has one reaction
 * per message — like Facebook Messenger.
 * ---------------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { confirmDialog } from '../common/ConfirmDialog.jsx';
import { toast } from '../common/Toast.jsx';
import {
  deleteMessage, setMessageReaction
} from '../../firebase/realtimeDb.js';
import { bsdcCopyToClipboard } from '../../scripts/interactions.js';
import { relativeTime } from '../../utils/dateFormatter.js';
import {
  IconCheck, IconClose, IconTrash, IconCopy, IconHeart, IconStar, IconAward, IconFire,
  IconMoreVertical
} from '../common/Icons.jsx';

/** The 5 quick reactions (names map to icons inside). ZERO emoji. */
const REACTIONS = [
  { key: 'love',  Icon: IconHeart,  label: 'Love'   },
  { key: 'star',  Icon: IconStar,   label: 'Star'   },
  { key: 'fire',  Icon: IconFire,   label: 'Fire'   },
  { key: 'award', Icon: IconAward,  label: 'Award'  }
];

const REACTION_BY_KEY = Object.fromEntries(REACTIONS.map((r) => [r.key, r]));

export default function MessageBubble({
  message,
  isOwn,
  chatId,
  showAuthor = false,
  authorMap = {},
  myUid
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [picker, setPicker] = useState(false);

  const onDelete = async () => {
    const ok = await confirmDialog({
      title: 'Delete message?',
      body: 'This removes it for everyone in the chat.',
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;
    try { await deleteMessage(chatId, message.id); }
    catch (err) { toast.error(err?.message || 'Could not delete.'); }
  };

  const onCopy = async () => {
    const ok = await bsdcCopyToClipboard(message.text || '');
    toast[ok ? 'success' : 'error'](ok ? 'Copied.' : 'Copy failed.');
  };

  const react = async (key) => {
    try {
      const current = message.reactions?.[myUid];
      await setMessageReaction(chatId, message.id, myUid, current === key ? null : key);
    } catch (err) {
      toast.error(err?.message || 'Could not react.');
    }
    setPicker(false);
  };

  // Group reactions by key for display.
  const reactionCounts = {};
  if (message.reactions) {
    for (const [, key] of Object.entries(message.reactions)) {
      if (!key) continue;
      reactionCounts[key] = (reactionCounts[key] || 0) + 1;
    }
  }
  const myReaction = message.reactions?.[myUid];

  const author = !isOwn && showAuthor ? authorMap[message.senderId] : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: 4
      }}
    >
      {author && (
        <Link to={`/p/${author.username || ''}`} className="bsdc-text-xs bsdc-text-muted" style={{ marginBottom: 2, marginLeft: 6 }}>
          {author.displayName || author.username}
        </Link>
      )}

      <div
        className={`bsdc-message ${isOwn ? 'bsdc-message--out' : 'bsdc-message--in'}`}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => { setMenuOpen(false); setPicker(false); }}
        style={{ position: 'relative' }}
      >
        {/* Image */}
        {message.imageURL && (
          <a href={message.imageURL} target="_blank" rel="noopener noreferrer">
            <img
              src={message.imageURL}
              alt={message.text || 'image'}
              loading="lazy"
              style={{ maxWidth: 280, borderRadius: 'var(--radius-md)', display: 'block' }}
            />
          </a>
        )}

        {/* Text */}
        {message.text && (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.text}</div>
        )}

        {/* Time + seen */}
        <div className="bsdc-flex bsdc-items-center bsdc-justify-end bsdc-gap-xs">
          <span className="bsdc-message__time">{relativeTime(message.timestamp)}</span>
          {isOwn && (
            <span className="bsdc-message__seen" aria-label={message.seen ? 'Seen' : 'Sent'}>
              <IconCheck size={10} />
              {message.seen && <IconCheck size={10} style={{ marginLeft: -4 }} />}
            </span>
          )}
        </div>

        {/* Hover/tap menu */}
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: -10, [isOwn ? 'left' : 'right']: -10,
              transform: 'translateY(-100%)',
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-md)',
              padding: 2,
              display: 'flex',
              gap: 2
            }}
          >
            <button type="button" className="bsdc-icon-btn bsdc-icon-btn--sm" onClick={() => setPicker((v) => !v)} aria-label="React">
              <IconHeart size={14} />
            </button>
            {message.text && (
              <button type="button" className="bsdc-icon-btn bsdc-icon-btn--sm" onClick={onCopy} aria-label="Copy">
                <IconCopy size={14} />
              </button>
            )}
            {isOwn && (
              <button type="button" className="bsdc-icon-btn bsdc-icon-btn--sm" onClick={onDelete} aria-label="Delete">
                <IconTrash size={14} />
              </button>
            )}
          </div>
        )}

        {/* Reaction picker popover */}
        {picker && (
          <div
            style={{
              position: 'absolute',
              top: -52,
              [isOwn ? 'left' : 'right']: -10,
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-md)',
              padding: 4,
              display: 'flex',
              gap: 4
            }}
            role="menu"
          >
            {REACTIONS.map(({ key, Icon, label }) => (
              <button
                key={key}
                type="button"
                className="bsdc-icon-btn bsdc-icon-btn--sm"
                onClick={() => react(key)}
                aria-label={label}
              >
                <Icon size={14} color={myReaction === key ? '#1a6b3a' : 'currentColor'} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reactions strip */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className="bsdc-flex bsdc-gap-xs" style={{ marginTop: 2, marginRight: isOwn ? 6 : 0, marginLeft: isOwn ? 0 : 6 }}>
          {Object.entries(reactionCounts).map(([key, count]) => {
            const meta = REACTION_BY_KEY[key];
            if (!meta) return null;
            const Icon = meta.Icon;
            const mine = myReaction === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => react(key)}
                className="bsdc-chip"
                style={{
                  padding: '2px 8px',
                  fontSize: 11,
                  background: mine ? 'var(--color-primary)' : 'var(--color-accent)',
                  color: mine ? '#fff' : 'var(--color-primary-dark)'
                }}
                aria-label={`${meta.label} (${count})`}
              >
                <Icon size={11} /> {count}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Unused locally but exported for future use (e.g. notification icons).
export { REACTIONS, IconClose };
