/**
 * src/admin/PointsControl.jsx
 * - Adjust point rules (writes to /systemSettings/points).
 * - Award arbitrary points to any user as an admin bonus.
 */
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { awardPoints } from '../firebase/points.js';
import { getUserByUsername } from '../firebase/firestore.js';
import { POINTS_RULES } from '../utils/pointsCalculator.js';
import Spinner from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { IconCoin, IconSettings, IconCheck } from '../components/common/Icons.jsx';

export default function PointsControl() {
  const [rules, setRules] = useState(POINTS_RULES);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState(50);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'systemSettings', 'points'))
      .then((snap) => { if (snap.exists()) setRules({ ...POINTS_RULES, ...snap.data() }); })
      .catch(() => {});
  }, []);

  const saveRules = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'systemSettings', 'points'), { ...rules, updatedAt: serverTimestamp() }, { merge: true });
      toast.success('Point rules saved.');
    } catch (err) { toast.error(err?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const award = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await getUserByUsername(username.toLowerCase());
      if (!u) throw new Error('User not found.');
      await awardPoints(u.uid, Math.max(1, Math.floor(Number(amount))), reason || 'admin bonus', { type: 'bonus' });
      toast.success(`Awarded ${amount} points to @${u.username}.`);
      setUsername(''); setReason('');
    } catch (err) { toast.error(err?.message || 'Failed.'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}><IconCoin size={18} /> Points control</h1>

      <div className="bsdc-grid-2">
        <div className="bsdc-card">
          <h3 style={{ margin: 0, fontSize: '1rem' }}><IconSettings size={14} /> Earning rules</h3>
          <p className="bsdc-text-muted bsdc-text-sm">Edit how many points each action awards. Defaults apply if blank.</p>
          {[
            ['post', 'Publish a post'],
            ['like', 'Receive a like'],
            ['comment', 'Comment posted'],
            ['follower', 'Gained a follower'],
            ['dailyLogin', 'Daily login bonus'],
            ['courseComplete', 'Course completion'],
            ['verified', 'Get verified']
          ].map(([k, label]) => (
            <div key={k} className="bsdc-input-group">
              <label className="bsdc-input-label">{label}</label>
              <input
                type="number"
                min={0}
                className="bsdc-input"
                value={rules[k] ?? ''}
                onChange={(e) => setRules({ ...rules, [k]: Number(e.target.value) || 0 })}
              />
            </div>
          ))}
          <button type="button" className="bsdc-btn bsdc-btn--primary bsdc-btn--block" onClick={saveRules} disabled={saving}>
            {saving ? <Spinner size="sm" /> : <IconCheck size={14} />} Save rules
          </button>
        </div>

        <form onSubmit={award} className="bsdc-card">
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Award bonus points</h3>
          <div className="bsdc-input-group">
            <label className="bsdc-input-label">Username</label>
            <input type="text" className="bsdc-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="bsdc-input-group">
            <label className="bsdc-input-label">Amount</label>
            <input type="number" min={1} className="bsdc-input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="bsdc-input-group">
            <label className="bsdc-input-label">Reason</label>
            <input type="text" className="bsdc-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. event prize" />
          </div>
          <button type="submit" className="bsdc-btn bsdc-btn--primary bsdc-btn--block" disabled={busy}>
            {busy ? <Spinner size="sm" /> : <IconCoin size={14} />} Award points
          </button>
        </form>
      </div>
    </>
  );
}
