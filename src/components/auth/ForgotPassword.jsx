/**
 * src/components/auth/ForgotPassword.jsx
 * Route: /forgot
 * Sends a Firebase password reset email.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { resetPassword } from '../../firebase/auth.js';
import { toast } from '../common/Toast.jsx';
import { isValidEmail } from '../../utils/validators.js';
import Spinner from '../common/Spinner.jsx';
import { IconMail, IconLightning } from '../common/Icons.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
      toast.success('Reset link sent. Check your inbox.');
    } catch (err) {
      // To avoid account enumeration we show the same message either way.
      setSent(true);
      // eslint-disable-next-line no-console
      console.warn('[BSDC] resetPassword:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset password | BSDC</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="bsdc-flex bsdc-justify-center" style={{ padding: 'var(--space-xl) 0' }}>
        <div className="bsdc-card bsdc-card--raised" style={{ width: '100%', maxWidth: 440 }}>
          <div className="bsdc-text-center bsdc-mb-lg">
            <div className="bsdc-bootstrap__icon" style={{ width: 56, height: 56, marginBottom: 12 }}>
              <IconLightning size={28} color="#1a6b3a" />
            </div>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Reset your password</h1>
            <p className="bsdc-text-muted bsdc-text-sm">
              Enter your email and we'll send a reset link.
            </p>
          </div>

          {sent ? (
            <div className="bsdc-text-center">
              <p>If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
              <Link to="/login" className="bsdc-btn bsdc-btn--primary bsdc-btn--block bsdc-mt-md">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
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
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bsdc-btn bsdc-btn--primary bsdc-btn--block"
                disabled={busy}
              >
                {busy && <Spinner size="sm" />}
                Send reset link
              </button>

              <p className="bsdc-text-sm bsdc-text-center bsdc-mt-md">
                <Link to="/login">Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
