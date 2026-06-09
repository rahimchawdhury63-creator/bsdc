/**
 * src/admin/AdminGate.jsx
 * ---------------------------------------------------------------------------
 * Two-layer gate that protects every page in /admin.
 *
 *   1. Firebase Auth — must be signed in with the configured ADMIN_EMAIL.
 *   2. Passkey — must enter ADMIN_PASSKEY into a local form (session-scoped).
 *
 * Both values are read from env vars at build time (Cloudflare Pages):
 *   - VITE_ADMIN_EMAIL     (safe to expose; used for client-side gate)
 *   - VITE_ADMIN_PASSKEY   (safe to expose because Firestore Rules from
 *                           Response 1 ALSO require the user to exist in
 *                           the /admins collection — the passkey only
 *                           guards the UI; the rules guard the data).
 *
 * Even if someone bypasses this UI, every write goes through Firestore
 * Rules that check membership in /admins. The passkey adds friction; the
 * rules provide the real security.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { useAuth } from '../hooks/useAuth.js';
import { toast } from '../components/common/Toast.jsx';
import Spinner, { LoadingCenter } from '../components/common/Spinner.jsx';
import SEOHead from '../components/seo/SEOHead.jsx';
import {
  IconShield, IconLock, IconLogin, IconLightning, IconAlert
} from '../components/common/Icons.jsx';

const ADMIN_EMAIL   = (import.meta.env.VITE_ADMIN_EMAIL   || 'rahimchawdhury63@gmail.com').toLowerCase();
const ADMIN_PASSKEY = import.meta.env.VITE_ADMIN_PASSKEY  || 'RahimRahim';
const PASSKEY_KEY   = 'bsdc.admin.passkey.v1';

/**
 * Wrap any admin page with <AdminGate>. Renders the gate forms until the
 * user is signed in as ADMIN_EMAIL AND has entered the passkey this session.
 */
export default function AdminGate({ children }) {
  const { firebaseUser, profile, loading } = useAuth();
  const [passkeyOk, setPasskeyOk] = useState(() => sessionStorage.getItem(PASSKEY_KEY) === '1');
  const [pk, setPk] = useState('');
  const [busy, setBusy] = useState(false);

  // Self-register in /admins/{uid} on first successful gate so Firestore
  // Rules from Response 1 (which check existence of that doc) allow writes.
  useEffect(() => {
    if (!firebaseUser || !profile) return;
    const isAdminEmail = (firebaseUser.email || '').toLowerCase() === ADMIN_EMAIL;
    if (!isAdminEmail) return;
    if (!passkeyOk) return;
    (async () => {
      try {
        const ref = doc(db, 'admins', firebaseUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username: profile.username || '',
            createdAt: serverTimestamp()
          });
        }
        // Also flip the user's isAdmin flag for in-app affordances.
        if (!profile.isAdmin) {
          await setDoc(doc(db, 'users', firebaseUser.uid), { isAdmin: true }, { merge: true });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[BSDC] admin self-register:', err);
      }
    })();
  }, [firebaseUser, profile, passkeyOk]);

  if (loading) return <LoadingCenter label="Checking admin access…" />;

  /* ----- Gate 1: signed in with admin email? ----- */
  if (!firebaseUser) {
    return <AdminLoginPrompt next="/admin" />;
  }
  const isAdminEmail = (firebaseUser.email || '').toLowerCase() === ADMIN_EMAIL;
  if (!isAdminEmail) {
    return <AdminRejected email={firebaseUser.email} />;
  }

  /* ----- Gate 2: passkey ----- */
  if (!passkeyOk) {
    const submitPk = async (e) => {
      e.preventDefault();
      setBusy(true);
      // Tiny artificial delay — slows down brute-force one-shot attacks.
      await new Promise((r) => setTimeout(r, 400));
      if (pk === ADMIN_PASSKEY) {
        sessionStorage.setItem(PASSKEY_KEY, '1');
        setPasskeyOk(true);
        toast.success('Admin unlocked.');
      } else {
        toast.error('Incorrect passkey.');
      }
      setBusy(false);
    };

    return (
      <>
        <SEOHead title="Admin · Passkey" canonical="/admin" noindex />
        <div className="bsdc-admin-login">
          <div className="bsdc-bootstrap__icon" style={{ width: 64, height: 64, marginBottom: 16 }}>
            <IconLock size={28} color="#1a6b3a" />
          </div>
          <h1 style={{ fontSize: '1.3rem' }}>Admin passkey</h1>
          <p className="bsdc-text-muted bsdc-text-sm">
            You are signed in as <strong>{firebaseUser.email}</strong>. Enter the admin passkey to continue.
          </p>
          <form onSubmit={submitPk} className="bsdc-mt-md">
            <input
              type="password"
              className="bsdc-input"
              value={pk}
              onChange={(e) => setPk(e.target.value)}
              placeholder="Passkey"
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className="bsdc-btn bsdc-btn--primary bsdc-btn--block bsdc-mt-md" disabled={busy || !pk}>
              {busy ? <Spinner size="sm" /> : <IconShield size={16} />} Unlock
            </button>
          </form>
        </div>
      </>
    );
  }

  return children;
}

function AdminLoginPrompt({ next }) {
  return (
    <>
      <SEOHead title="Admin · Sign in" canonical="/admin" noindex />
      <div className="bsdc-admin-login">
        <div className="bsdc-bootstrap__icon" style={{ width: 64, height: 64, marginBottom: 16 }}>
          <IconShield size={28} color="#1a6b3a" />
        </div>
        <h1 style={{ fontSize: '1.3rem' }}>Admin Panel</h1>
        <p className="bsdc-text-muted bsdc-text-sm">
          You must sign in with the configured admin Google account to continue.
        </p>
        <Link to={`/login?next=${encodeURIComponent(next)}`} className="bsdc-btn bsdc-btn--primary bsdc-btn--block bsdc-mt-md">
          <IconLogin size={16} /> Sign in
        </Link>
      </div>
    </>
  );
}

function AdminRejected({ email }) {
  return (
    <>
      <SEOHead title="Admin · Access denied" canonical="/admin" noindex />
      <div className="bsdc-admin-login">
        <div className="bsdc-bootstrap__icon" style={{ width: 64, height: 64, marginBottom: 16, color: 'var(--color-danger)' }}>
          <IconAlert size={28} />
        </div>
        <h1 style={{ fontSize: '1.3rem' }}>Access denied</h1>
        <p className="bsdc-text-muted bsdc-text-sm">
          The account <strong>{email}</strong> is not authorised for the admin panel.
        </p>
        <Link to="/" className="bsdc-btn bsdc-btn--primary bsdc-btn--block bsdc-mt-md">
          <IconLightning size={16} /> Back to home
        </Link>
      </div>
    </>
  );
}
