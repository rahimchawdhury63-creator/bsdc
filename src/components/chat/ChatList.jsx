/**
 * src/components/chat/ChatList.jsx
 * ---------------------------------------------------------------------------
 * Left rail of the Messages page — all chats with last-message preview.
 *
 * For 1:1 chats we lazy-load the OTHER participant's user doc so we can
 * show their name + avatar (the RTDB chat node only has UIDs).
 * For group/channel chats we display the stored name + iconURL.
 *
 * Props:
 *   - chats           : from useChatList()
 *   - activeChatId
 *   - myUid
 *   - onPick(chatId)
 *   - onCreateGroup()
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState, useMemo } from 'react';
import { getUser } from '../../firebase/firestore.js';
import Avatar from '../common/Avatar.jsx';
import VerificationBadge from '../verification/VerificationBadge.jsx';
import { LoadingCenter } from '../common/Spinner.jsx';
import { usePresence } from '../../hooks/useRealtime.js';
import { relativeTime } from '../../utils/dateFormatter.js';
import { IconUsers, IconHash, IconPlus, IconMessage } from '../common/Icons.jsx';

export default function ChatList({
  chats, loading, activeChatId, myUid, onPick, onCreateGroup
}) {
  if (loading) return <LoadingCenter label="Loading chats…" />;

  if (!chats || chats.length === 0) {
    return (
      <div style={{ padding: 'var(--space-md)' }}>
        <div className="bsdc-empty" style={{ padding: 'var(--space-lg) var(--space-md)' }}>
          <div className="bsdc-empty__icon"><IconMessage /></div>
          <div className="bsdc-empty__title">No conversations yet</div>
          <div className="bsdc-empty__body bsdc-text-sm">
            Visit any profile and tap <strong>Message</strong> to start chatting.
          </div>
          <button
            type="button"
            className="bsdc-btn bsdc-btn--outline bsdc-btn--sm bsdc-mt-md"
            onClick={onCreateGroup}
          >
            <IconUsers size={14} /> Create group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bsdc-flex bsdc-items-center bsdc-justify-between" style={{ padding: 'var(--space-md)' }}>
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Chats</h2>
        <button
          type="button"
          className="bsdc-icon-btn bsdc-icon-btn--sm"
          onClick={onCreateGroup}
          aria-label="New group chat"
          title="New group chat"
        >
          <IconPlus />
        </button>
      </div>
      {chats.map((c) => (
        <ChatListItem
          key={c.id}
          chat={c}
          myUid={myUid}
          active={c.id === activeChatId}
          onPick={() => onPick(c.id)}
        />
      ))}
    </div>
  );
}

function ChatListItem({ chat, myUid, active, onPick }) {
  const isGroup = !!chat.isGroup;
  const otherUid = useMemo(() => {
    if (isGroup) return null;
    const ids = Object.keys(chat.participants || {});
    return ids.find((uid) => uid !== myUid) || null;
  }, [chat.participants, isGroup, myUid]);

  const [other, setOther] = useState(null);
  useEffect(() => {
    if (!otherUid) return;
    let cancelled = false;
    getUser(otherUid).then((u) => { if (!cancelled) setOther(u); });
    return () => { cancelled = true; };
  }, [otherUid]);

  const presence = usePresence(otherUid);

  const name = isGroup
    ? (chat.name || 'Group chat')
    : (other?.displayName || other?.username || 'Conversation');
  const avatarSrc = isGroup ? chat.iconURL : other?.photoURL;
  const lastText = chat.lastMessage?.text || '';
  const lastTime = chat.lastMessage?.timestamp;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPick(); }}
      className={`bsdc-chat-list__item ${active ? 'bsdc-chat-list__item--active' : ''}`}
    >
      <div style={{ position: 'relative' }}>
        {isGroup ? (
          <Avatar src={avatarSrc} name={name} />
        ) : (
          <Avatar
            src={avatarSrc}
            name={name}
            showStatus
            isOnline={presence.online}
          />
        )}
        {chat.isChannel && (
          <span
            style={{
              position: 'absolute', bottom: -2, right: -2,
              background: '#fff', borderRadius: '50%',
              padding: 1, color: 'var(--color-primary)'
            }}
            aria-label="Channel"
          >
            <IconHash size={12} />
          </span>
        )}
      </div>

      <div className="bsdc-chat-list__body">
        <div className="bsdc-flex bsdc-items-center bsdc-justify-between bsdc-gap-xs">
          <span className="bsdc-chat-list__name" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {name}
            {!isGroup && other?.isVerified && <VerificationBadge size={12} />}
          </span>
          {lastTime && (
            <span className="bsdc-text-xs bsdc-text-muted" style={{ flexShrink: 0 }}>
              {relativeTime(lastTime)}
            </span>
          )}
        </div>
        <div className="bsdc-chat-list__preview">{lastText || 'No messages yet'}</div>
      </div>
    </div>
  );
}
