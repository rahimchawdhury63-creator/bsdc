/**
 * src/admin/NotificationSender.jsx
 * Send a broadcast (in-app + OneSignal Web Push) to all members,
 * or a targeted notice to one user by username.
 */
import React, { useState } from 'react';
import {
  collection, query, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { getUserByUsername } from '../firebase/firestore.js';
import { notifyBroadcast } from '../utils/notificationSender.js';
import Spinner from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { IconBell, IconSend, IconUsers } from '../components/common/Icons.jsx';

export default function NotificationSender() {
  const [mode, setMode] = useState('all');
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('https://www.bsdc.info.bd');
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { toast.error('Title and body are required.'); return; }
    setBusy(true);
    try {
      let uids = [];
      if (mode === 'all') {
        const snap = await getDocs(query(collection(db, 'users'), orderBy('lastSeen', 'desc'), limit(5000)));
        uids = snap.docs.map((d) => d.id);
      } else {
        const u = await getUserByUsername(username.toLowerCase());
        if (!u) throw new Error('User not found.');
        uids = [u.uid];
      }
      notifyBroadcast({ uids, title: title.trim(), body: body.trim(), url });
      toast.success(`Broadcast queued to ${uids.length} member${uids.length === 1 ? '' : 's'}.`);
      setTitle(''); setBody('');
    } catch (err) { toast.error(err?.message || 'Failed.'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}><IconBell size={18} /> Send notification</h1>

      <form onSubmit={send} className="bsdc-card" style={{ maxWidth: 640 }}>
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Target</label>
          <div className="bsdc-flex bsdc-gap-sm">
            <button type="button" className={`bsdc-chip ${mode === 'all' ? 'bsdc-chip--active' : ''}`} onClick={() => setMode('all')}>
              <IconUsers size={12} /> Everyone
            </button>
            <button type="button" className={`bsdc-chip ${mode === 'one' ? 'bsdc-chip--active' : ''}`} onClick={() => setMode('one')}>
              Single user
            </button>
          </div>
        </div>

        {mode === 'one' && (
          <div className="bsdc-input-group">
            <label className="bsdc-input-label">Username</label>
            <input type="text" className="bsdc-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
        )}

        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Title</label>
          <input type="text" className="bsdc-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={70} required />
        </div>
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Body</label>
          <textarea className="bsdc-textarea" value={body} onChange={(e) => setBody(e.target.value)} maxLength={240} required rows={3} />
        </div>
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Open URL</label>
          <input type="url" className="bsdc-input" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>

        <button type="submit" className="bsdc-btn bsdc-btn--primary bsdc-btn--block" disabled={busy}>
          {busy ? <Spinner size="sm" /> : <IconSend size={14} />} Send
        </button>
      </form>
    </>
  );
}
