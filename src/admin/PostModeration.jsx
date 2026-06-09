/**
 * src/admin/PostModeration.jsx
 * Search + feature/unfeature + soft-delete + pin/unpin posts.
 */
import React, { useEffect, useState } from 'react';
import {
  collection, query, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { softDeletePost } from '../firebase/firestore.js';
import { rankPostsForQuery } from '../utils/searchAlgorithm.js';
import { Link } from 'react-router-dom';
import { TYPE_URL_SEGMENT } from '../utils/seoGenerator.js';
import { relativeTime } from '../utils/dateFormatter.js';
import Spinner, { LoadingCenter } from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { confirmDialog } from '../components/common/ConfirmDialog.jsx';
import {
  IconSearch, IconStar, IconStarFilled, IconTrash, IconLightning
} from '../components/common/Icons.jsx';

export default function PostModeration() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [working, setWorking] = useState(null);

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(300)));
    setAll(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = q.length >= 2 ? rankPostsForQuery(all, q) : all;

  const setFeatured = async (p, val) => {
    setWorking(p.id);
    try {
      await updateDoc(doc(db, 'posts', p.id), { isFeatured: val, updatedAt: serverTimestamp() });
      toast.success(val ? 'Featured.' : 'Unfeatured.');
      load();
    } catch (err) { toast.error(err?.message || 'Failed.'); }
    finally { setWorking(null); }
  };

  const setPinned = async (p, val) => {
    setWorking(p.id);
    try {
      await updateDoc(doc(db, 'posts', p.id), { isPinned: val, updatedAt: serverTimestamp() });
      toast.success(val ? 'Pinned.' : 'Unpinned.');
      load();
    } catch (err) { toast.error(err?.message || 'Failed.'); }
    finally { setWorking(null); }
  };

  const remove = async (p) => {
    const ok = await confirmDialog({ title: 'Delete post?', body: 'Soft-deletes the post (hidden everywhere but kept in the audit log).', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    setWorking(p.id);
    try { await softDeletePost(p.id); toast.success('Post removed.'); load(); }
    catch (err) { toast.error(err?.message || 'Failed.'); }
    finally { setWorking(null); }
  };

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}>Post moderation</h1>
      <div className="bsdc-search bsdc-mb-md">
        <span className="bsdc-search__icon"><IconSearch size={16} /></span>
        <input
          type="search"
          className="bsdc-input bsdc-search__input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, body, tag…"
        />
      </div>

      {loading ? <LoadingCenter /> : (
        <table className="bsdc-admin-table">
          <thead>
            <tr><th>Title</th><th>Type</th><th>Author</th><th>Engagement</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.slice(0, 150).map((p) => {
              const seg = TYPE_URL_SEGMENT[p.type] || 'post';
              return (
                <tr key={p.id} style={{ opacity: p.status === 'deleted' ? 0.5 : 1 }}>
                  <td>
                    <Link to={`/${seg}/${p.slug || p.id}`}>{p.title || (p.content || '').slice(0, 60) || '(untitled)'}</Link>
                    {p.isFeatured && <span className="bsdc-chip" style={{ marginLeft: 6 }}><IconStarFilled size={11} /> featured</span>}
                    {p.isPinned   && <span className="bsdc-chip" style={{ marginLeft: 6 }}><IconLightning size={11} /> pinned</span>}
                  </td>
                  <td><span className="bsdc-chip">{p.type}</span></td>
                  <td><Link to={`/p/${p.authorUsername}`}>@{p.authorUsername}</Link></td>
                  <td>{(p.likes || 0)}♥ · {(p.comments || 0)}💬</td>
                  <td>{p.status || 'active'}</td>
                  <td className="bsdc-text-xs bsdc-text-muted">{relativeTime(p.createdAt)}</td>
                  <td>
                    <div className="bsdc-flex bsdc-gap-xs">
                      <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm"
                        onClick={() => setFeatured(p, !p.isFeatured)} disabled={working === p.id}
                        title={p.isFeatured ? 'Unfeature' : 'Feature'}>
                        {p.isFeatured ? <IconStarFilled size={14} color="#f57c00" /> : <IconStar size={14} />}
                      </button>
                      <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm"
                        onClick={() => setPinned(p, !p.isPinned)} disabled={working === p.id}
                        title={p.isPinned ? 'Unpin' : 'Pin'}>
                        {working === p.id ? <Spinner size="sm" /> : <IconLightning size={14} color={p.isPinned ? '#1a6b3a' : '#888'} />}
                      </button>
                      <button type="button" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm"
                        onClick={() => remove(p)} disabled={working === p.id} title="Delete">
                        <IconTrash size={14} color="#d32f2f" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
