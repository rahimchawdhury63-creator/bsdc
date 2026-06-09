/**
 * src/admin/VerificationApproval.jsx
 * Approve / reject pending verification requests. Approving:
 *   - sets users/{uid}.isVerified = true
 *   - awards POINTS_RULES.verified bonus
 *   - sends an in-app + push notification
 */
import React, { useEffect, useState } from 'react';
import {
  collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { awardPoints } from '../firebase/points.js';
import { notifyVerification } from '../utils/notificationSender.js';
import { POINTS_RULES } from '../utils/pointsCalculator.js';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { Link } from 'react-router-dom';
import { IconCheck, IconClose, IconShield } from '../components/common/Icons.jsx';

export default function VerificationApproval() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(null);
  const [note, setNote] = useState({});

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(query(
      collection(db, 'verificationRequests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    ));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const decide = async (req, approved) => {
    setWorking(req.id);
    try {
      await updateDoc(doc(db, 'verificationRequests', req.id), {
        status: approved ? 'approved' : 'rejected',
        adminNote: note[req.id] || '',
        updatedAt: serverTimestamp()
      });
      if (approved) {
        await updateDoc(doc(db, 'users', req.userId), {
          isVerified: true,
          verificationBadge: 'approved',
          updatedAt: serverTimestamp()
        });
        awardPoints(req.userId, POINTS_RULES.verified, 'verification approved', { type: 'bonus' }).catch(() => {});
      }
      notifyVerification({ toUid: req.userId, status: approved ? 'approved' : 'rejected', note: note[req.id] });
      toast.success(approved ? 'Approved.' : 'Rejected.');
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed.');
    } finally {
      setWorking(null);
    }
  };

  if (loading) return <LoadingCenter />;

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}>
        <IconShield size={18} /> Verification queue
      </h1>

      {items.length === 0 ? (
        <div className="bsdc-empty">
          <div className="bsdc-empty__title">No pending requests</div>
          <div className="bsdc-empty__body">Everything's been reviewed. Good job.</div>
        </div>
      ) : (
        <div className="bsdc-grid-2">
          {items.map((r) => (
            <div key={r.id} className="bsdc-card">
              <div className="bsdc-flex bsdc-justify-between bsdc-items-center bsdc-mb-sm">
                <Link to={`/p/${r.username}`} className="bsdc-text-bold">@{r.username}</Link>
                <span className="bsdc-chip">{r.documentType}</span>
              </div>
              <a href={r.documentImageURL} target="_blank" rel="noopener noreferrer">
                <img
                  src={r.documentImageURL}
                  alt={`${r.documentType} for @${r.username}`}
                  style={{ width: '100%', maxHeight: 360, objectFit: 'contain', background: '#000', borderRadius: 'var(--radius-md)' }}
                  loading="lazy"
                />
              </a>
              <div className="bsdc-text-xs bsdc-text-muted bsdc-mt-sm">Mobile: {r.mobileNumber}</div>

              <textarea
                className="bsdc-textarea bsdc-mt-sm"
                rows={2}
                placeholder="Optional note (sent to the user on reject)…"
                value={note[r.id] || ''}
                onChange={(e) => setNote({ ...note, [r.id]: e.target.value })}
              />
              <div className="bsdc-flex bsdc-gap-sm bsdc-mt-sm">
                <button type="button" className="bsdc-btn bsdc-btn--primary bsdc-btn--sm"
                  onClick={() => decide(r, true)} disabled={working === r.id}>
                  <IconCheck size={14} /> Approve
                </button>
                <button type="button" className="bsdc-btn bsdc-btn--danger bsdc-btn--sm"
                  onClick={() => decide(r, false)} disabled={working === r.id}>
                  <IconClose size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
