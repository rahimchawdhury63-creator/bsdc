/**
 * src/components/chat/ChannelSystem.jsx
 * ---------------------------------------------------------------------------
 * Channel discovery + create button. Reuses <GroupChat /> with isChannel.
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../firebase/config.js';
import { setGroupMember } from '../../firebase/realtimeDb.js';
import GroupChat from './GroupChat.jsx';
import Avatar from '../common/Avatar.jsx';
import Spinner, { LoadingCenter } from '../common/Spinner.jsx';
import { toast } from '../common/Toast.jsx';
import {
  IconHash, IconPlus, IconUsers, IconCheck
} from '../common/Icons.jsx';

export default function ChannelSystem({ currentUser, onOpenChat }) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatorOpen, setCreatorOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await get(ref(rtdb, 'chats'));
      const all = snap.val() || {};
      const list = Object.entries(all)
        .filter(([, c]) => c.isChannel)
        .map(([id, c]) => ({ id, ...c }))
        .sort((a, b) => Object.keys(b.participants || {}).length - Object.keys(a.participants || {}).length);
      setChannels(list);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[BSDC] channels load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const subscribe = async (channel) => {
    if (!currentUser) return toast.info('Sign in to subscribe.');
    try {
      const subscribed = !!channel.participants?.[currentUser.uid];
      await setGroupMember(channel.id, currentUser.uid, !subscribed);
      toast.success(subscribed ? 'Unsubscribed.' : 'Subscribed.');
      load();
    } catch (err) {
      toast.error(err?.message || 'Could not update subscription.');
    }
  };

  return (
    <div>
      <div className="bsdc-flex bsdc-items-center bsdc-justify-between bsdc-mb-md">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem' }}>
            <IconHash size={20} /> Channels
          </h1>
          <p className="bsdc-text-muted bsdc-text-sm" style={{ margin: 0 }}>
            Telegram-style broadcast feeds. Only the admin posts; everyone else subscribes.
          </p>
        </div>
        {currentUser && (
          <button type="button" className="bsdc-btn bsdc-btn--primary" onClick={() => setCreatorOpen(true)}>
            <IconPlus size={16} /> New channel
          </button>
        )}
      </div>

      {loading ? (
        <LoadingCenter label="Loading channels…" />
      ) : channels.length === 0 ? (
        <div className="bsdc-empty">
          <div className="bsdc-empty__icon"><IconHash /></div>
          <div className="bsdc-empty__title">No channels yet</div>
          <div className="bsdc-empty__body">Create the first BSDC channel.</div>
        </div>
      ) : (
        <div className="bsdc-grid-2">
          {channels.map((c) => {
            const subs = Object.keys(c.participants || {}).length;
            const subscribed = currentUser && !!c.participants?.[currentUser.uid];
            return (
              <div key={c.id} className="bsdc-card">
                <div className="bsdc-flex bsdc-items-center bsdc-gap-md">
                  <Avatar src={c.iconURL} name={c.name} size="lg" />
                  <div className="bsdc-flex-1">
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>{c.name}</h3>
                    <p className="bsdc-text-xs bsdc-text-muted" style={{ margin: 0 }}>
                      <IconUsers size={11} /> {subs} subscribers
                    </p>
                  </div>
                </div>
                <div className="bsdc-flex bsdc-gap-sm bsdc-mt-md">
                  <button
                    type="button"
                    className={`bsdc-btn ${subscribed ? 'bsdc-btn--secondary' : 'bsdc-btn--primary'} bsdc-btn--sm`}
                    onClick={() => subscribe(c)}
                  >
                    {subscribed ? <><IconCheck size={12} /> Subscribed</> : 'Subscribe'}
                  </button>
                  <button
                    type="button"
                    className="bsdc-btn bsdc-btn--outline bsdc-btn--sm"
                    onClick={() => onOpenChat?.(c.id)}
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GroupChat
        open={creatorOpen}
        onClose={() => setCreatorOpen(false)}
        currentUser={currentUser}
        isChannel
        onCreated={(id) => onOpenChat?.(id)}
      />
    </div>
  );
}
