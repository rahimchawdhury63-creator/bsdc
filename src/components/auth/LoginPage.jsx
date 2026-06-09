/**
 * src/components/auth/LoginPage.jsx
 * ---------------------------------------------------------------------------
 * Multi-provider login page. Routes here: /login
 *
 * Providers:
 *   - Email/password
 *   - Google
 *   - GitHub
 *   - Yahoo
 *
 * After successful login we redirect to either the "?next=" param or "/".
 * ---------------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  loginWithEmail, loginWithGoogle, loginWithGithub, loginWithYahoo
} from '../../firebase/auth.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import {
  IconGoogle, IconGithub, IconYahoo, IconMail, IconLock, IconEye, IconEyeOff, IconLightning
} from '../common/Icons.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyProvider, setBusyProvider] = useState(null);

  /** Centralised post-success redirect. */
  function redirectOnSuccess() {
    navigate(next, { replace: true });
  }

  /** Email/password handler. */
  const submitEmail = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await loginWithEmail(email.trim(), password);
      toast.success('Welcome back to BSDC.');
      redirectOnSuccess();
    } catch (err) {
      toast.error(prettyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  /** OAuth handler factory — DRY for Google/GitHub/Yahoo. */
  const oauthHandler = (provider, fn) => async () => {
    if (busyProvider) return;
    setBusyProvider(provider);
    try {
      await fn();
      toast.success('Signed in successfully.');
      redirectOnSuccess();
    } catch (err) {
      toast.error(prettyAuthError(err));
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign in | BSDC — Bangladesh Software Development Community</title>
        <meta name="description" content="Sign in to BSDC to share code, ask questions, find jobs, and connect with Bangladeshi developers." />
        <link rel="canonical" href="https://www.bsdc.info.bd/login" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="bsdc-flex bsdc-justify-center" style={{ padding: 'var(--space-xl) 0' }}>
        <div className="bsdc-card bsdc-card--raised" style={{ width: '100%', maxWidth: 440 }}>
          <div className="bsdc-text-center bsdc-mb-lg">
            <div className="bsdc-bootstrap__icon" style={{ width: 56, height: 56, marginBottom: 12 }}>
              <IconLightning size={28} color="#1a6b3a" />
            </div>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Sign in to BSDC</h1>
            <p className="bsdc-text-muted bsdc-text-sm">
              Don't have an account? <Link to={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>Join free</Link>
            </p>
          </div>

          {/* OAuth providers */}
          <div className="bsdc-flex-col bsdc-gap-sm bsdc-mb-md">
            <button
              type="button"
              className="bsdc-btn bsdc-btn--outline bsdc-btn--block"
              onClick={oauthHandler('google', loginWithGoogle)}
              disabled={!!busyProvider}
            >
              {busyProvider === 'google' ? <Spinner size="sm" /> : <IconGoogle />}
              Continue with Google
            </button>
            <button
              type="button"
              className="bsdc-btn bsdc-btn--outline bsdc-btn--block"
              onClick={oauthHandler('github', loginWithGithub)}
              disabled={!!busyProvider}
            >
              {busyProvider === 'github' ? <Spinner size="sm" /> : <IconGithub />}
              Continue with GitHub
            </button>
            <button
              type="button"
              className="bsdc-btn bsdc-btn--outline bsdc-btn--block"
              onClick={oauthHandler('yahoo', loginWithYahoo)}
              disabled={!!busyProvider}
            >
              {busyProvider === 'yahoo' ? <Spinner size="sm" /> : <IconYahoo />}
              Continue with Yahoo
            </button>
          </div>

          <Divider label="or use email" />

          <form onSubmit={submitEmail} noValidate>
            <div className="bsdc-input-group">
              <label className="bsdc-input-label" htmlFor="email">Email</label>
              <div className="bsdc-relative">
                <IconMail
                  size={18}
                  color="#888"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="bsdc-input"
                  style={{ paddingLeft: 40 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="bsdc-input-group">
              <div className="bsdc-flex bsdc-justify-between bsdc-items-center">
                <label className="bsdc-input-label" htmlFor="pw">Password</label>
                <Link to="/forgot" className="bsdc-text-sm">Forgot?</Link>
              </div>
              <div className="bsdc-relative">
                <IconLock
                  size={18}
                  color="#888"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="bsdc-input"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="bsdc-icon-btn bsdc-icon-btn--sm"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw((v) => !v)}
                  style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showPw ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bsdc-btn bsdc-btn--primary bsdc-btn--block"
              disabled={busy || !email || !password}
            >
              {busy ? <Spinner size="sm" /> : null}
              Sign in
            </button>
          </form>

          <p className="bsdc-text-xs bsdc-text-muted bsdc-text-center bsdc-mt-md">
            By continuing you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </>
  );
}

/** Decorative divider with a label in the middle. */
function Divider({ label }) {
  return (
    <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-mb-md" aria-hidden="true">
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      <span className="bsdc-text-xs bsdc-text-muted">{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  );
}

/** Map Firebase auth error codes to friendly messages. */
function prettyAuthError(err) {
  const code = err?.code || '';
  const map = {
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/wrong-password':     'Wrong email or password.',
    'auth/user-not-found':     'No account exists for that email.',
    'auth/email-already-in-use': 'An account already exists for that email.',
    'auth/weak-password':      'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/account-exists-with-different-credential':
      'You already signed up with a different provider for this email.',
    'auth/too-many-requests':  'Too many attempts. Please wait a moment.',
    'auth/network-request-failed': 'Network error. Check your connection.'
  };
  return map[code] || err?.message || 'Sign-in failed. Please try again.';
}
