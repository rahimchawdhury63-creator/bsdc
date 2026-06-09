/**
 * src/pages/Messages.jsx
 * ---------------------------------------------------------------------------
 * Route: /messages
 * Optional query: ?with=<uid> to deep-link a 1:1 chat with that user.
 *
 * Layout: chat list on the left, active chat on the right.
 * Mobile (<768px): we hide the list once a chat is opened.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth.js';
import { useChatList } from '../hooks/useRealtime.js';
import {
  chatIdFor, ensureChatExists
} from '../firebase/realtimeDb.js';
import ChatList from '../components/chat/ChatList.jsx';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import GroupChat from '../components/chat/GroupChat.jsx';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';

export default function Messages() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [activeChatId, setActiveChatId] = useState(null);
  const [groupOpen, setGroupOpen] = useState(false);

  const { chats, loading } = useChatList(profile?.uid);

  // If ?with=<uid>, ensure a 1:1 chat node exists and open it.
  useEffect(() => {
    const withUid = params.get('with');
    if (!withUid || !profile) return;
    if (withUid === profile.uid) {
      toast.info("You can't chat with yourself.");
      return;
    }
    const id = chatIdFor(profile.uid, withUid);
    ensureChatExists(id, [profile.uid, withUid])
      .then(() => {
        setActiveChatId(id);
        // Strip the param so refresh doesn't loop.
        const next = new URLSearchParams(params);
        next.delete('with');
        setParams(next, { replace: true });
      })
      .catch((err) => toast.error(err?.message || 'Could not start chat.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, params.get('with')]);

  if (authLoading) return <LoadingCenter />;

  if (!profile) {
    navigate('/login?next=/messages', { replace: true });
    return null;
  }

  // Mobile UX: while a chat is open, hide the list.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const showList = !isMobile || !activeChatId;
  const showWindow = !isMobile || !!activeChatId;

  return (
    <>
      <Helmet>
        <title>Messages | BSDC</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div
        className="bsdc-chat-layout"
        style={{
          gridTemplateColumns:
            (!isMobile ? '320px 1fr' : (activeChatId ? '1fr' : '1fr'))
        }}
      >
        {showList && (
          <div className="bsdc-chat-list">
            <ChatList
              chats={chats}
              loading={loading}
              myUid={profile.uid}
              activeChatId={activeChatId}
              onPick={setActiveChatId}
              onCreateGroup={() => setGroupOpen(true)}
            />
          </div>
        )}

        {showWindow && (
          <ChatWindow
            chatId={activeChatId}
            myUid={profile.uid}
            currentUser={profile}
            onBack={() => setActiveChatId(null)}
            onOpenInfo={() => toast.info('Chat info panel arrives in a later module.')}
          />
        )}
      </div>

      <GroupChat
        open={groupOpen}
        onClose={() => setGroupOpen(false)}
        currentUser={profile}
        onCreated={(id) => setActiveChatId(id)}
      />
    </>
  );
}
