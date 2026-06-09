/**
 * src/components/chat/ChatWindow.jsx
 * ---------------------------------------------------------------------------
 * Active conversation pane. Handles:
 *   - Header (name, online dot, group info button)
 *   - Live message stream (auto-scroll on new messages from me or others)
 *   - Typing indicator
 *   - Input bar with image attach + send
 *   - Mark-as-seen for incoming messages on open
 *
 * Works for 1:1, group, and channel chats (channels disable input for
 * non-admins).
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../firebase/config.js';
import { getUser } from '../../firebase/firestore.js';
import {
  sendMessage, markSeen
} from '../../firebase/realtimeDb.js';
import { useChatMessages, useTyping, usePresence } from '../../hooks/useRealtime.js';
import { notifyMessage } from '../../utils/notificationSender.js';
import Avatar from '../common/Avatar.jsx';
import MessageBubble from './MessageBubble.jsx';
import ChatMedia from './ChatMedia.jsx';
import VerificationBadge from '../verification/VerificationBadge.jsx';
import { LoadingCenter } from '../common/Spinner.jsx';
import { toast } from '../common/Toast.jsx';
import { bsdcAutoGrow } from '../../scripts/interactions.js';
import {
  IconSend, IconBack, IconUsers, IconHash, IconLock, IconInfo
} from '../common/Icons.jsx';

export default function ChatWindow({ chatId, myUid, currentUser, onBack, onOpenInfo }) {
  const [chatMeta, setChatMeta] = useState(null);   // loaded once from RTDB
  const [authorMap, setAuthorMap] = useState({});   // uid → user doc (for group)
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // 1) Load static chat metadata once (we don't need realtime here).
  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;
    get(ref(rtdb, `chats/${chatId}`)).then((snap) => {
      if (cancelled) return;
      const val = snap.val() || {};
      setChatMeta({
        id: chatId,
        isGroup: !!val.isGroup,
        isChannel: !!val.isChannel,
        name: val.name || '',
        iconURL: val.iconURL || '',
        adminId: val.adminId || null,
        admins: val.admins || {},
        participants: val.participants || {}
      });
    });
    return () => { cancelled = true; };
  }, [chatId]);

  // 2) Live message stream + typing indicator.
  const { messages, loading } = useChatMessages(chatId, 200);
  const { othersTyping, setMyTyping } = useTyping(chatId, myUid);

  // 3) For 1:1, identify the "other" user and watch their presence.
  const otherUid = useMemo(() => {
    if (!chatMeta || chatMeta.isGroup) return null;
    const ids = Object.keys(chatMeta.participants || {});
    return ids.find((u) => u !== myUid) || null;
  }, [chatMeta, myUid]);

  const [otherUser, setOtherUser] = useState(null);
  useEffect(() => {
    if (!otherUid) return;
    getUser(otherUid).then(setOtherUser);
  }, [otherUid]);
  const otherPresence = usePresence(otherUid);

  // 4) For group chats, pre-load author docs for nicer name labels.
  useEffect(() => {
    if (!chatMeta?.isGroup) return;
    const uids = Object.keys(chatMeta.participants || {});
    Promise.all(uids.map((u) => getUser(u))).then((users) => {
      const map = {};
      users.forEach((u) => { if (u) map[u.uid] = u; });
      setAuthorMap(map);
    });
  }, [chatMeta]);

  // 5) Scroll to bottom on new messages.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  // 6) Mark incoming messages as seen when this chat is open.
  useEffect(() => {
    if (!messages || !myUid) return;
    messages.forEach((m) => {
      if (m.senderId !== myUid && !m.seen) {
        markSeen(chatId, m.id).catch(() => {});
      }
    });
  }, [messages, chatId, myUid]);

  // Channel posting permission: only admins.
  const canPost = !chatMeta?.isChannel || !!chatMeta?.admins?.[myUid];

  const send = async ({ text: bodyText, imageURL, type = 'text' } = {}) => {
    if (sending) return;
    const body = (bodyText !== undefined ? bodyText : text).trim();
    if (!body && !imageURL) return;
    setSending(true);
    try {
      await sendMessage(chatId, {
        senderId: myUid,
        senderUsername: currentUser?.username || '',
        text: body,
        imageURL: imageURL || '',
        type: imageURL ? 'image' : type
      });
      setText('');
      setMyTyping(false);
      // Reset textarea size after send.
      requestAnimationFrame(() => { if (inputRef.current) inputRef.current.style.height = 'auto'; });
      // DM push to other participants (we only push the OTHER UID for 1:1 chats).
      if (otherUid) {
        notifyMessage({
          toUid: otherUid,
          fromUser: currentUser,
          snippet: body || (imageURL ? '[image]' : ''),
          chatId
        });
      }
    } catch (err) {
      toast.error(err?.message || 'Could not send.');
    } finally {
      setSending(false);
    }
  };

  if (!chatId) {
    return (
      <div className="bsdc-empty" style={{ padding: 'var(--space-2xl)' }}>
        <div className="bsdc-empty__title">Select a conversation</div>
        <div className="bsdc-empty__body">Pick a chat on the left or start a new one.</div>
      </div>
    );
  }

  if (!chatMeta || loading) return <LoadingCenter />;

  const displayName = chatMeta.isGroup
    ? (chatMeta.name || 'Group chat')
    : (otherUser?.displayName || otherUser?.username || '…');

  return (
    <div className="bsdc-chat-window">
      <div className="bsdc-chat-window__header">
        <button
          type="button"
          className="bsdc-icon-btn bsdc-hide-desktop"
          aria-label="Back to chats"
          onClick={onBack}
        >
          <IconBack />
        </button>

        {chatMeta.isGroup ? (
          <Avatar src={chatMeta.iconURL} name={displayName} />
        ) : (
          <Link to={otherUser ? `/p/${otherUser.username}` : '#'}>
            <Avatar src={otherUser?.photoURL} name={displayName} showStatus isOnline={otherPresence.online} />
          </Link>
        )}

        <div className="bsdc-flex-1" style={{ minWidth: 0 }}>
          <div className="bsdc-flex bsdc-items-center bsdc-gap-xs">
            <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </strong>
            {!chatMeta.isGroup && otherUser?.isVerified && <VerificationBadge size={14} />}
            {chatMeta.isChannel && (
              <span className="bsdc-chip" style={{ padding: '2px 6px', fontSize: 11 }}>
                <IconHash size={11} /> Channel
              </span>
            )}
            {chatMeta.isGroup && !chatMeta.isChannel && (
              <span className="bsdc-chip" style={{ padding: '2px 6px', fontSize: 11 }}>
                <IconUsers size={11} /> Group
              </span>
            )}
          </div>
          <div className="bsdc-text-xs bsdc-text-muted">
            {chatMeta.isGroup
              ? `${Object.keys(chatMeta.participants || {}).length} members`
              : (otherPresence.online ? 'Online' : 'Offline')}
          </div>
        </div>

        <button
          type="button"
          className="bsdc-icon-btn"
          aria-label="Chat info"
          onClick={onOpenInfo}
        >
          <IconInfo />
        </button>
      </div>

      {/* Messages */}
      <div className="bsdc-chat-window__messages">
        {messages.length === 0 && (
          <div className="bsdc-text-center bsdc-text-muted bsdc-text-sm" style={{ padding: 'var(--space-lg)' }}>
            No messages yet. Say hello!
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isOwn={m.senderId === myUid}
            chatId={chatId}
            myUid={myUid}
            showAuthor={chatMeta.isGroup || chatMeta.isChannel}
            authorMap={authorMap}
          />
        ))}

        {othersTyping.length > 0 && (
          <div className="bsdc-typing" aria-live="polite" aria-label="Typing">
            <span className="bsdc-typing__dot" />
            <span className="bsdc-typing__dot" />
            <span className="bsdc-typing__dot" />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div className="bsdc-chat-window__input-bar">
        {canPost ? (
          <>
            <ChatMedia onSend={send} disabled={sending} />
            <textarea
              ref={inputRef}
              className="bsdc-textarea"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                bsdcAutoGrow(e.target);
                setMyTyping(e.target.value.length > 0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={chatMeta.isChannel ? 'Post to channel…' : 'Type a message… (Shift+Enter for new line)'}
              rows={1}
              style={{ minHeight: 40, maxHeight: 160, resize: 'none' }}
              maxLength={4000}
            />
            <button
              type="button"
              className="bsdc-btn bsdc-btn--primary"
              onClick={() => send()}
              disabled={sending || !text.trim()}
              aria-label="Send"
            >
              <IconSend size={16} />
            </button>
          </>
        ) : (
          <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-text-muted bsdc-text-sm" style={{ padding: 8, width: '100%', justifyContent: 'center' }}>
            <IconLock size={14} /> Only channel admins can post here.
          </div>
        )}
      </div>
    </div>
  );
}
