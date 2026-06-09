/**
 * src/admin/ReportsManager.jsx
 * List user-submitted reports + close each.
 */
import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp, limit
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { relativeTime } from '../utils/dateFormatter.js';
import { Link } from 'react-router-dom';
import { IconFlag, IconCheck } from '../components/common/Icons.jsx';

export default function ReportsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(200)));
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const close = async (r) => {
    try {
      await updateDoc(doc(db, 'reports', r.id), { status: 'closed', updatedAt: serverTimestamp() });
      toast.success('Closed.'); load();
    } catch (err) { toast.error(err?.message || 'Failed.'); }
  };

  if (loading) return <LoadingCenter />;

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}><IconFlag size={18} /> Reports</h1>
      {items.length === 0 ? (
        <div className="bsdc-empty">
          <div className="bsdc-empty__title">No reports filed</div>
          <div className="bsdc-empty__body">Reports from members appear here for review.</div>
        </div>
      ) : (
        <table className="bsdc-admin-table">
          <thead><tr><th>Reporter</th><th>Target</th><th>Reason</th><th>Status</th><th>Filed</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td><Link to={`/p/${r.reporterUsername || r.reporterId}`}>@{r.reporterUsername || r.reporterId?.slice(0, 8)}</Link></td>
                <td>
                  {r.targetType === 'post'
                    ? <Link to={`/post/${r.targetSlug || r.targetId}`}>post</Link>
                    : <Link to={`/p/${r.targetUsername || r.targetId}`}>@{r.targetUsername || r.targetId?.slice(0, 8)}</Link>}
                </td>
                <td>{r.reason || '—'}</td>
                <td><span className="bsdc-chip">{r.status || 'open'}</span></td>
                <td className="bsdc-text-xs bsdc-text-muted">{relativeTime(r.createdAt)}</td>
                <td>
                  {r.status !== 'closed' && (
                    <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm" onClick={() => close(r)}>
                      <IconCheck size={14} /> Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
