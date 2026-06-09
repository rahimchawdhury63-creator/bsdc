/**
 * src/admin/CommunityManager.jsx
 * List communities + delete (admin-only).
 */
import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, query, orderBy, doc, deleteDoc, limit
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { confirmDialog } from '../components/common/ConfirmDialog.jsx';
import { Link } from 'react-router-dom';
import { IconHash, IconTrash } from '../components/common/Icons.jsx';

export default function CommunityManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'communities'), orderBy('members', 'desc'), limit(200)));
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const remove = async (c) => {
    const ok = await confirmDialog({ title: `Delete community ${c.name}?`, body: 'Posts in this community remain but the community page disappears.', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try { await deleteDoc(doc(db, 'communities', c.id)); toast.success('Deleted.'); load(); }
    catch (err) { toast.error(err?.message || 'Failed.'); }
  };

  if (loading) return <LoadingCenter />;

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}><IconHash size={18} /> Communities</h1>
      <table className="bsdc-admin-table">
        <thead><tr><th>Name</th><th>Slug</th><th>Members</th><th>Posts</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td><Link to={`/bsdc/${c.slug}`}>{c.name}</Link></td>
              <td><code>/bsdc/{c.slug}</code></td>
              <td>{c.members || 0}</td>
              <td>{c.posts || 0}</td>
              <td>
                <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm" onClick={() => remove(c)}>
                  <IconTrash size={14} color="#d32f2f" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
