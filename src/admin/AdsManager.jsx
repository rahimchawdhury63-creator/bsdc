/**
 * src/admin/AdsManager.jsx
 * Review pending ad campaigns + approve/pause/end.
 */
import React, { useEffect, useState } from 'react';
import {
  collection, query, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { relativeTime } from '../utils/dateFormatter.js';
import { IconBriefcase, IconCheck, IconClose, IconLightning } from '../components/common/Icons.jsx';

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'ads'), orderBy('createdAt', 'desc'), limit(100)));
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (ad, status) => {
    try {
      await updateDoc(doc(db, 'ads', ad.id), { status, updatedAt: serverTimestamp() });
      toast.success(`Ad ${status}.`);
      load();
    } catch (err) { toast.error(err?.message || 'Failed.'); }
  };

  if (loading) return <LoadingCenter />;

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}><IconBriefcase size={18} /> Ads</h1>
      {ads.length === 0 ? (
        <div className="bsdc-empty">
          <div className="bsdc-empty__icon"><IconLightning /></div>
          <div className="bsdc-empty__title">No campaigns yet</div>
          <div className="bsdc-empty__body">Ad campaigns submitted by members appear here for review.</div>
        </div>
      ) : (
        <table className="bsdc-admin-table">
          <thead><tr><th>Title</th><th>Advertiser</th><th>Budget</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
          <tbody>
            {ads.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>@{a.advertiserId?.slice(0, 8)}</td>
                <td>{a.budget || 0} BSDC</td>
                <td><span className="bsdc-chip">{a.status}</span></td>
                <td className="bsdc-text-xs bsdc-text-muted">{relativeTime(a.createdAt)}</td>
                <td>
                  <div className="bsdc-flex bsdc-gap-xs">
                    <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm" onClick={() => setStatus(a, 'active')}>
                      <IconCheck size={14} color="#1a6b3a" />
                    </button>
                    <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm" onClick={() => setStatus(a, 'paused')}>
                      Pause
                    </button>
                    <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm" onClick={() => setStatus(a, 'ended')}>
                      <IconClose size={14} color="#d32f2f" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
