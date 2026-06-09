/**
 * src/components/auth/RegisterPage.jsx
 * ---------------------------------------------------------------------------
 * Registration: email + password + chosen username.
 *
 * Flow:
 *   1. User picks username (we validate live and check uniqueness).
 *   2. User submits email + password.
 *   3. We register, send verification email, create Firestore profile.
 *   4. Redirect to /verify-email (or "?next=" param).
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  registerWithEmail, loginWithGoogle, loginWithGithub
} from '../../firebase/auth.js';
import { isUsernameAvailable } from '../../firebase/firestore.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import { isValidEmail, passwordStrength } from '../../utils/validators.js';
import { isValidUsername } from '../../utils/slugGenerator.js';
import {
  IconGoogle, IconGithub, IconAt, IconMail, IconLock, IconCheck, IconClose, IconLightning
} from '../common/Icons.jsx';
import { bsdcDebounce } from '../../scripts/interactions.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/verify-email';

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameState, setUsernameState] = useState({ checking: false, available: null });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyProvider, setBusyProvider] = useState(null);

  /** Debounced uniqueness check — fires 400ms after typing stops. */
  const checkRef = useRef(null);
  useEffect(() => {
    if (!isValidUsername(username)) {
      setUsernameState({ checking: false, available: null });
      return;
    }
    setUsernameState({ checking: true, available: null });
    if (!checkRef.current) {
      checkRef.current = bsdcDebounce(async (u) => {
        try {
          const ok = await isUsernameAvailable(u);
          setUsernameState({ checking: false, available: ok });
        } catch {
          setUsernameState({ checking: false, available: null });
        }
      }, 400);
    }
    checkRef.current(username);
  }, [username]);

  /** OAuth quick path — skips email + password entirely. */
  const oauth = (provider, fn) => async () => {
    if (busyProvider) return;
    setBusyProvider(provider);
    try {
      await fn();
      toast.success('Account created. Welcome to BSDC.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Sign-up failed.');
    } finally {
      setBusyProvider(null);
    }
  };

  /** Submit email+password registration. */
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;

    // Front-end validation gates.
    if (!isValidEmail(email)) return toast.error('Please enter a valid email.');
    if (!isValidUsername(username)) return toast.error('Username must be 3–20 chars, start with a letter (a–z, 0–9, _).');
    if (usernameState.available === false) return toast.error('That username is taken.');
    const pwStrength = passwordStrength(password);
    if (!pwStrength.ok) return toast.error('Choose a stronger password (8+ chars).');

    setBusy(true);
    try {
      await registerWithEmail({
        email: email.trim(),
        password,
        displayName: displayName.trim() || username,
        username
      });
      toast.success('Account created. Check your inbox to verify your email.');
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  const pw = passwordStrength(password);
  const pwBarColor = ['#d32f2f', '#f57c00', '#fbc02d', '#7cb342', '#2e7d32'][pw.score] || '#d32f2f';

  return (
    <>
      <Helmet>
        <title>Join BSDC | Bangladesh Software Development Community</title>
        <meta name="description" content="Create your free BSDC account to share code, ask questions, find Bangladeshi developer jobs, and earn certificates." />
        <link rel="canonical" href="https://www.bsdc.info.bd/register" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="bsdc-flex bsdc-justify-center" style={{ padding: 'var(--space-xl) 0' }}>
        <div className="bsdc-card bsdc-card--raised" style={{ width: '100%', maxWidth: 480 }}>
          <div className="bsdc-text-center bsdc-mb-lg">
            <div className="bsdc-bootstrap__icon" style={{ width: 56, height: 56, marginBottom: 12 }}>
              <IconLightning size={28} color="#1a6b3a" />
            </div>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Join the community</h1>
            <p className="bsdc-text-muted bsdc-text-sm">
              Already a member? <Link to="/login">Sign in</Link>
            </p>
          </div>

          <div className="bsdc-flex-col bsdc-gap-sm bsdc-mb-md">
            <button
              type="button"
              className="bsdc-btn bsdc-btn--outline bsdc-btn--block"
              onClick={oauth('google', loginWithGoogle)}
              disabled={!!busyProvider}
            >
              {busyProvider === 'google' ? <Spinner size="sm" /> : <IconGoogle />}
              Sign up with Google
            </button>
            <button
              type="button"
              className="bsdc-btn bsdc-btn--outline bsdc-btn--block"
              onClick={oauth('github', loginWithGithub)}
              disabled={!!busyProvider}
            >
              {busyProvider === 'github' ? <Spinner size="sm" /> : <IconGithub />}
              Sign up with GitHub
            </button>
          </div>

          <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-mb-md" aria-hidden="true">
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span className="bsdc-text-xs bsdc-text-muted">or create with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <form onSubmit={submit} noValidate>
            <div className="bsdc-input-group">
              <label className="bsdc-input-label" htmlFor="dn">Display name</label>
              <input
                id="dn"
                type="text"
                className="bsdc-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                maxLength={50}
              />
            </div>

            <div className="bsdc-input-group">
              <label className="bsdc-input-label" htmlFor="un">
                Username <span className="bsdc-text-muted">(your profile URL)</span>
              </label>
              <div className="bsdc-relative">
                <IconAt
                  size={18}
                  color="#888"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="un"
                  type="text"
                  className="bsdc-input"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="yourname"
                  autoComplete="off"
                  maxLength={20}
                />
                {/* Live availability indicator */}
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  {usernameState.checking && <Spinner size="sm" />}
                  {!usernameState.checking && usernameState.available === true && <IconCheck size={18} color="#2e7d32" />}
                  {!usernameState.checking && usernameState.available === false && <IconClose size={18} color="#d32f2f" />}
                </span>
              </div>
              <p className="bsdc-input-help">
                bsdc.info.bd/p/<strong>{username || 'yourname'}</strong>
              </p>
            </div>

            <div className="bsdc-input-group">
              <label className="bsdc-input-label" htmlFor="em">Email</label>
              <div className="bsdc-relative">
                <IconMail
                  size={18}
                  color="#888"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="em"
                  type="email"
                  className="bsdc-input"
                  style={{ paddingLeft: 40 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="bsdc-input-group">
              <label className="bsdc-input-label" htmlFor="pw">Password</label>
              <div className="bsdc-relative">
                <IconLock
                  size={18}
                  color="#888"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="pw"
                  type="password"
                  className="bsdc-input"
                  style={{ paddingLeft: 40 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              {/* Strength meter */}
              {password && (
                <div className="bsdc-mt-sm">
                  <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 4 }}>
                    <div
                      style={{
                        width: `${(pw.score + 1) * 20}%`,
                        height: '100%',
                        background: pwBarColor,
                        borderRadius: 4,
                        transition: 'width 200ms ease'
                      }}
                    />
                  </div>
                  <span className="bsdc-input-help" style={{ color: pwBarColor }}>
                    {pw.label}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bsdc-btn bsdc-btn--primary bsdc-btn--block"
              disabled={busy || !email || !password || !username}
            >
              {busy && <Spinner size="sm" />}
              Create my BSDC account
            </button>
          </form>

          <p className="bsdc-text-xs bsdc-text-muted bsdc-text-center bsdc-mt-md">
            By joining you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
