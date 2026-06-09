/**
 * src/components/points/PointsTransfer.jsx
 * ---------------------------------------------------------------------------
 * Send BSDC Points to another user.
 *
 * Two modes:
 *   - Username (typed) → resolve via getUserByUsername
 *   - Direct UID (used when scanned via QR → ?send=<uid>)
 *
 * Live balance preview shows before/after.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUser, getUserByUsername } from '../../firebase/firestore.js';
import { transferPoints } from '../../firebase/points.js';
import { useAuth } from '../../hooks/useAuth.js';
import { toast } from '../common/Toast.jsx';
import Avatar from '../common/Avatar.jsx';
import VerificationBadge from '../verification/VerificationBadge.jsx';
import Spinner from '../common/Spinner.jsx';
import { formatPoints } from '../../utils/pointsCalculator.js';
import { bsdcDebounce } from '../../scripts/interactions.js';
import {
  IconAt, IconCoin, IconSend, IconCheck, IconClose
} from '../common/Icons.jsx';

export default function PointsTransfer() {
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [resolved, setResolved] = useState(null);  // user doc
  const [resolving, setResolving] = useState(false);
  const [amount, setAmount] = useState(params.get('amount') || '');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  // QR deep link: ?send=<uid> → resolve UID directly.
  useEffect(() => {
    const uid = params.get('send');
    if (!uid) return;
    getUser(uid).then((u) => {
      if (u) {
        setResolved(u);
        setUsername(u.username);
      } else {
        toast.error('That user could not be found.');
      }
      const next = new URLSearchParams(params);
      next.delete('send');
      setParams(next, { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live username resolver (debounced 350ms).
  useEffect(() => {
    if (!username || username === resolved?.username) return;
    setResolving(true);
    const debounced = bsdcDebounce(async (q) => {
      const u = await getUserByUsername(q.toLowerCase());
      setResolved(u);
      setResolving(false);
    }, 350);
    debounced(username);
    return () => debounced.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const balance = Number(profile?.bsdcPoints || 0);
  const amt = Math.max(0, Math.floor(Number(amount) || 0));
  const remaining = balance - amt;

  const canSend = !!resolved && resolved.uid !== profile?.uid && amt > 0 && amt <= balance;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSend || busy) return;
    setBusy(true);
    try {
      await transferPoints(profile.uid, resolved.uid, amt, reason || '', { fromUser: profile });
      toast.success(`Sent ${amt} BSDC Points to @${resolved.username}.`);
      setAmount('');
      setReason('');
    } catch (err) {
      toast.error(err?.message || 'Transfer failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="bsdc-card">
      <h2 style={{ margin: 0, fontSize: '1.1rem' }}><IconSend size={18} /> Send BSDC Points</h2>
      <p className="bsdc-text-muted bsdc-text-sm" style={{ margin: '4px 0 12px' }}>
        Instant transfer, atomic, audited. The recipient hears a chime and gets a push notification.
      </p>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Recipient username</label>
        <div className="bsdc-relative">
          <IconAt size={18} color="#888" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="bsdc-input"
            style={{ paddingLeft: 40, paddingRight: 40 }}
            value={username}
            onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/\s+/g, '')); setResolved(null); }}
            placeholder="username"
            autoComplete="off"
            required
          />
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {resolving && <Spinner size="sm" />}
            {!resolving && resolved && <IconCheck size={18} color="#2e7d32" />}
            {!resolving && !resolved && username.length >= 2 && <IconClose size={18} color="#d32f2f" />}
          </span>
        </div>
      </div>

      {/* Recipient preview card */}
      {resolved && (
        <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-mb-md" style={{ padding: 'var(--space-sm)', background: 'var(--color-accent)', borderRadius: 'var(--radius-md)' }}>
          <Avatar src={resolved.photoURL} name={resolved.displayName} size="sm" />
          <div className="bsdc-flex-1" style={{ minWidth: 0 }}>
            <div className="bsdc-flex bsdc-items-center bsdc-gap-xs">
              <strong>{resolved.displayName || resolved.username}</strong>
              {resolved.isVerified && <VerificationBadge size={12} />}
            </div>
            <div className="bsdc-text-xs bsdc-text-muted">@{resolved.username}</div>
          </div>
          <span className="bsdc-text-xs bsdc-text-muted">
            <IconCoin size={12} /> {formatPoints(resolved.bsdcPoints || 0)}
          </span>
        </div>
      )}

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Amount</label>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          className="bsdc-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 50"
          required
        />
        <p className="bsdc-input-help">
          Your balance: <strong>{formatPoints(balance)}</strong>
          {amt > 0 && (
            <> · After: <strong style={{ color: remaining < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {formatPoints(Math.max(0, remaining))}
            </strong></>
          )}
        </p>
      </div>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Note (optional)</label>
        <input
          type="text"
          className="bsdc-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. for that great snippet"
          maxLength={80}
        />
      </div>

      <button type="submit" className="bsdc-btn bsdc-btn--primary bsdc-btn--block" disabled={!canSend || busy}>
        {busy ? <Spinner size="sm" /> : <IconSend size={16} />} Send {amt > 0 ? amt : ''} points
      </button>
    </form>
  );
}
