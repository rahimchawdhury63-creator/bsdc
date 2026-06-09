/**
 * src/components/auth/EmailVerify.jsx
 * Route: /verify-email
 *
 * Shows a "check your inbox" screen plus a "Resend" button that calls
 * Firebase sendEmailVerification on the current user.
 *
 * If the user is already verified (they refreshed after clicking the link)
 * we auto-redirect home.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth.js';
import { resendVerificationEmail } from '../../firebase/auth.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import { IconMail, IconRefresh, IconCheck } from '../common/Icons.jsx';

export default function EmailVerify() {
  const { firebaseUser, emailVerified } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Poll Firebase every 4s so the page transitions automatically
  // once the user clicks the link in their inbox.
  useEffect(() => {
    if (!firebaseUser) return;
    const interval = setInterval(async () => {
      try {
        await firebaseUser.reload();
        if (firebaseUser.emailVerified) {
          toast.success('Email verified. Welcome.');
          navigate('/', { replace: true });
        }
      } catch { /* ignore */ }
    }, 4000);
    return () => clearInterval(interval);
  }, [firebaseUser, navigate]);

  // Tick down resend cooldown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onResend = async () => {
    if (busy || cooldown > 0) return;
    setBusy(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email re-sent.');
      setCooldown(45);
    } catch (err) {
      toast.error(err?.message || 'Could not send email.');
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseUser) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__title">You're signed out</div>
        <Link to="/login" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">Sign in</Link>
      </div>
    );
  }

  if (emailVerified) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__icon"><IconCheck /></div>
        <div className="bsdc-empty__title">Email already verified</div>
        <Link to="/" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">Continue to BSDC</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Verify your email | BSDC</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="bsdc-flex bsdc-justify-center" style={{ padding: 'var(--space-xl) 0' }}>
        <div className="bsdc-card bsdc-card--raised" style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div className="bsdc-bootstrap__icon bsdc-anim-glow" style={{ width: 72, height: 72, margin: '0 auto var(--space-md)' }}>
            <IconMail size={36} color="#1a6b3a" />
          </div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Confirm your email</h1>
          <p className="bsdc-text-muted">
            We sent a verification link to <strong>{firebaseUser.email}</strong>. Click it to activate posting,
            commenting, and BSDC Points.
          </p>

          <button
            type="button"
            className="bsdc-btn bsdc-btn--primary bsdc-mt-md"
            onClick={onResend}
            disabled={busy || cooldown > 0}
          >
            {busy ? <Spinner size="sm" /> : <IconRefresh size={16} />}
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
          </button>

          <p className="bsdc-text-xs bsdc-text-muted bsdc-mt-md">
            Wrong email? <Link to="/login">Sign in</Link> with a different account.
          </p>
        </div>
      </div>
    </>
  );
}
