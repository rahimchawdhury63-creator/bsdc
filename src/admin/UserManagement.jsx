/**
 * src/admin/UserManagement.jsx
 * Search, view, ban/unban, delete, grant/revoke admin.
 */
import React, { useEffect, useState } from 'react';
import {
  collection, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { rankUsersForQuery } from '../utils/searchAlgorithm.js';
import Avatar from '../components/common/Avatar.jsx';
import VerificationBadge from '../components/verification/VerificationBadge.jsx';
import Spinner, { LoadingCenter } from '../components/common/Spinner.jsx';
import { toast } from '../components/common/Toast.jsx';
import { confirmDialog } from '../components/common/ConfirmDialog.jsx';
import { formatPoints } from '../utils/pointsCalculator.js';
import { Link } from 'react-router-dom';
import {
  IconSearch, IconShield, IconTrash, IconLock, IconUnlock, IconCheck
} from '../components/common/Icons.jsx';

export default function UserManagement() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [working, setWorking] = useState(null);

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'users'), orderBy('updatedAt', 'desc'), limit(500)));
    setAll(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = q.length >= 2 ? rankUsersForQuery(all, q) : all;

  const setBanned = async (u, banned) => {
    setWorking(u.uid);
    try {
      await updateDoc(doc(db, 'users', u.uid), { isBanned: banned, updatedAt: serverTimestamp() });
      toast.success(banned ? 'User banned.' : 'User unbanned.');
      load();
    } catch (err) { toast.error(err?.message || 'Failed.'); }
    finally { setWorking(null); }
  };

  const remove = async (u) => {
    const ok = await confirmDialog({ title: `Delete @${u.username}?`, body: 'This permanently deletes the user document. Posts remain.', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    setWorking(u.uid);
    try { await deleteDoc(doc(db, 'users', u.uid)); toast.success('User deleted.'); load(); }
    catch (err) { toast.error(err?.message || 'Failed.'); }
    finally { setWorking(null); }
  };

  const toggleAdmin = async (u) => {
    setWorking(u.uid);
    try {
      const adminRef = doc(db, 'admins', u.uid);
      if (u.isAdmin) {
        await deleteDoc(adminRef);
        await updateDoc(doc(db, 'users', u.uid), { isAdmin: false });
        toast.success('Admin role removed.');
      } else {
        await setDoc(adminRef, { uid: u.uid, email: u.email, grantedAt: serverTimestamp() });
        await updateDoc(doc(db, 'users', u.uid), { isAdmin: true });
        toast.success('Admin role granted.');
      }
      load();
    } catch (err) { toast.error(err?.message || 'Failed.'); }
    finally { setWorking(null); }
  };

  return (
    <>
      <h1 style={{ marginTop: 0, fontSize: '1.3rem' }}>User management</h1>
      <div className="bsdc-search bsdc-mb-md">
        <span className="bsdc-search__icon"><IconSearch size={16} /></span>
        <input
          type="search"
          className="bsdc-input bsdc-search__input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by username, name, email, skill…"
        />
      </div>

      {loading ? <LoadingCenter /> : (
        <table className="bsdc-admin-table">
          <thead>
            <tr><th>User</th><th>Points</th><th>Posts</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="bsdc-flex bsdc-items-center bsdc-gap-sm">
                    <Avatar src={u.photoURL} name={u.displayName} size="sm" />
                    <div>
                      <div>
                        <Link to={`/p/${u.username}`}>{u.displayName || u.username}</Link>
                        {u.isVerified && <VerificationBadge size={12} />}
                        {u.isAdmin && <span className="bsdc-chip" style={{ marginLeft: 4 }}>admin</span>}
                      </div>
                      <div className="bsdc-text-xs bsdc-text-muted">{u.email || `@${u.username}`}</div>
                    </div>
                  </div>
                </td>
                <td>{formatPoints(u.bsdcPoints || 0)}</td>
                <td>{u.postsCount || 0}</td>
                <td>
                  {u.isBanned
                    ? <span className="bsdc-badge bsdc-badge--danger">banned</span>
                    : <span className="bsdc-badge bsdc-badge--success">active</span>}
                </td>
                <td>
                  <div className="bsdc-flex bsdc-gap-xs">
                    <button
                      type="button"
                      className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm"
                      onClick={() => setBanned(u, !u.isBanned)}
                      disabled={working === u.uid}
                      title={u.isBanned ? 'Unban' : 'Ban'}
                    >
                      {working === u.uid ? <Spinner size="sm" /> : (u.isBanned ? <IconUnlock size={14} /> : <IconLock size={14} />)}
                    </button>
                    <button
                      type="button"
                      className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm"
                      onClick={() => toggleAdmin(u)}
                      disabled={working === u.uid}
                      title={u.isAdmin ? 'Revoke admin' : 'Grant admin'}
                    >
                      {u.isAdmin ? <IconCheck size={14} color="#1a6b3a" /> : <IconShield size={14} />}
                    </button>
                    <button
                      type="button"
                      className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm"
                      onClick={() => remove(u)}
                      disabled={working === u.uid}
                      title="Delete user"
                    >
                      <IconTrash size={14} color="#d32f2f" />
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
