/**
 * src/components/chat/GroupChat.jsx
 * ---------------------------------------------------------------------------
 * Modal to create a group chat. Also reused (with `isChannel: true`)
 * by <ChannelSystem /> to create channels.
 *
 * The picker lets the creator add up to 50 members. We search users by
 * username/displayName from the users collection.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import {
  collection, query, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { createGroupChat } from '../../firebase/realtimeDb.js';
import { uploadImage } from '../../utils/imageUpload.js';
import { rankUsersForQuery } from '../../utils/searchAlgorithm.js';
import { toast } from '../common/Toast.jsx';
import Avatar from '../common/Avatar.jsx';
import Spinner from '../common/Spinner.jsx';
import {
  IconClose, IconImage, IconUsers, IconSearch, IconCheck, IconHash
} from '../common/Icons.jsx';

const MAX_MEMBERS = 50;

export default function GroupChat({
  open, onClose, currentUser, isChannel = false, onCreated
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [picked, setPicked] = useState([]);   // array of user docs
  const [busy, setBusy] = useState(false);

  // Pre-load a slice of users to search.
  useEffect(() => {
    if (!open) return;
    getDocs(query(collection(db, 'users'), orderBy('updatedAt', 'desc'), limit(80)))
      .then((snap) => setAllUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => setAllUsers([]));
  }, [open]);

  if (!open) return null;

  const matches = search.length >= 2
    ? rankUsersForQuery(allUsers, search).filter((u) => u.uid !== currentUser?.uid).slice(0, 12)
    : allUsers.filter((u) => u.uid !== currentUser?.uid).slice(0, 12);

  const toggle = (user) => {
    setPicked((p) => {
      const exists = p.find((x) => x.uid === user.uid);
      if (exists) return p.filter((x) => x.uid !== user.uid);
      if (p.length >= MAX_MEMBERS) {
        toast.error(`Maximum ${MAX_MEMBERS} members.`);
        return p;
      }
      return [...p, user];
    });
  };

  const onPickIcon = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setUploadingIcon(true);
    try {
      const r = await uploadImage(f);
      setIcon(r.url);
    } catch (err) {
      toast.error(err?.message || 'Could not upload icon.');
    } finally {
      setUploadingIcon(false);
    }
  };

  const submit = async () => {
    if (busy) return;
    if (!name.trim()) return toast.error(`Please name the ${isChannel ? 'channel' : 'group'}.`);
    // Channels can be created with 0 initial members; groups need ≥1 besides the admin.
    if (!isChannel && picked.length === 0) return toast.error('Add at least one member.');

    setBusy(true);
    try {
      const id = await createGroupChat({
        name: name.trim(),
        iconURL: icon,
        adminId: currentUser.uid,
        participants: picked.map((p) => p.uid),
        isChannel
      });
      toast.success(`${isChannel ? 'Channel' : 'Group'} created.`);
      onCreated?.(id);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Could not create.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bsdc-modal-backdrop" role="dialog" aria-label={isChannel ? 'New channel' : 'New group'} onClick={onClose}>
      <div className="bsdc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bsdc-modal__header">
          <h2 className="bsdc-modal__title">
            {isChannel ? <><IconHash /> New channel</> : <><IconUsers /> New group chat</>}
          </h2>
          <button type="button" className="bsdc-icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <div className="bsdc-modal__body">
          <div className="bsdc-flex bsdc-items-center bsdc-gap-md bsdc-mb-md">
            <label style={{ position: 'relative', cursor: 'pointer' }}>
              <Avatar src={icon} name={name || (isChannel ? 'C' : 'G')} size="lg" />
              <span
                style={{
                  position: 'absolute', bottom: -4, right: -4,
                  background: 'var(--color-primary)', color: '#fff',
                  borderRadius: '50%', padding: 4, display: 'inline-flex'
                }}
              >
                {uploadingIcon ? <Spinner size="sm" /> : <IconImage size={14} />}
              </span>
              <input type="file" accept="image/*" onChange={onPickIcon} style={{ display: 'none' }} />
            </label>
            <div className="bsdc-flex-1">
              <label className="bsdc-input-label">{isChannel ? 'Channel name' : 'Group name'}</label>
              <input
                type="text"
                className="bsdc-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isChannel ? 'BSDC Announcements' : 'Team Project Alpha'}
                maxLength={60}
              />
            </div>
          </div>

          {/* Member picker (only for groups; channels start empty and subscribers join later) */}
          {!isChannel && (
            <>
              <div className="bsdc-input-group">
                <label className="bsdc-input-label">Add members ({picked.length}/{MAX_MEMBERS})</label>
                <div className="bsdc-search">
                  <span className="bsdc-search__icon"><IconSearch size={16} /></span>
                  <input
                    type="search"
                    className="bsdc-input bsdc-search__input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search developers…"
                  />
                </div>
              </div>

              {/* Picked chips */}
              {picked.length > 0 && (
                <div className="bsdc-flex bsdc-flex-wrap bsdc-gap-xs bsdc-mb-sm">
                  {picked.map((u) => (
                    <button
                      key={u.uid}
                      type="button"
                      className="bsdc-chip bsdc-chip--active"
                      onClick={() => toggle(u)}
                      aria-label={`Remove ${u.username}`}
                    >
                      {u.displayName || u.username} <IconClose size={12} />
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestion list */}
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {matches.length === 0 ? (
                  <p className="bsdc-text-muted bsdc-text-sm">No matches.</p>
                ) : matches.map((u) => {
                  const isPicked = !!picked.find((x) => x.uid === u.uid);
                  return (
                    <button
                      key={u.uid}
                      type="button"
                      className="bsdc-suggestion-item"
                      onClick={() => toggle(u)}
                      style={{
                        width: '100%', background: isPicked ? 'var(--color-accent)' : 'transparent',
                        cursor: 'pointer', border: 'none', textAlign: 'left'
                      }}
                    >
                      <Avatar src={u.photoURL} name={u.displayName} size="sm" />
                      <div className="bsdc-suggestion-item__body">
                        <div className="bsdc-suggestion-item__name">{u.displayName || u.username}</div>
                        <div className="bsdc-suggestion-item__sub">@{u.username}</div>
                      </div>
                      {isPicked && <IconCheck size={16} color="var(--color-primary)" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {isChannel && (
            <p className="bsdc-text-sm bsdc-text-muted">
              Only you can post to the channel. Share the channel link to grow subscribers.
            </p>
          )}
        </div>

        <div className="bsdc-modal__footer">
          <button type="button" className="bsdc-btn bsdc-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="bsdc-btn bsdc-btn--primary" onClick={submit} disabled={busy}>
            {busy ? <Spinner size="sm" /> : null} Create
          </button>
        </div>
      </div>
    </div>
  );
}
