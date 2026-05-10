import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../AuthContext';

const GoogleSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const GithubSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function RegisterPage() {
  const { register, loginWithGoogle, loginWithGithub, loginWithYahoo, loginWithApple } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [agree, setAgree] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleError = (e) => {
    const codes = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
    };
    setError(codes[e.code] || e.message || 'Registration failed. Please try again.');
  };

  const doSocial = async (fn, name) => {
    setError(''); setLoading(name);
    try { await fn(); navigate('/', { replace: true }); }
    catch (e) { handleError(e); }
    finally { setLoading(''); }
  };

  const doRegister = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (!form.email) { setError('Please enter your email.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (!agree) { setError('Please accept the terms to continue.'); return; }
    setError(''); setLoading('email');
    try {
      await register(form.email, form.password, form.name.trim());
      navigate('/', { replace: true });
    } catch (e) {
      handleError(e);
    }
    setLoading('');
  };

  return (
    <>
      <Helmet>
        <title>Join BSDC Free — Register | Bangladesh Software Development Community</title>
        <meta name="description" content="Create your free BSDC account. Join Bangladesh's #1 software development community. Register with Google, GitHub, Yahoo, or email." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.bsdc.info.bd/register" />
      </Helmet>

      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <div className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#006A4E"/>
              <text x="4" y="26" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="900" fill="white">BS</text>
              <rect x="0" y="30" width="36" height="6" rx="0" fill="#004d38"/>
              <text x="3" y="35" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#6EE7B7" letterSpacing="1">DC.BD</text>
            </svg>
          </div>
          <h1 className="auth-title">Join BSDC Free</h1>
          <p className="auth-subtitle">বাংলাদেশের সেরা ডেভেলপার কমিউনিটিতে যোগ দিন</p>

          {error && (
            <div style={{
              background: '#FEE2E2', border: '1px solid #FECACA',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px',
              fontSize: '0.88rem', color: 'var(--danger)', marginBottom: 16,
            }} role="alert">
              {error}
            </div>
          )}

          <button className="social-btn" onClick={() => doSocial(loginWithGoogle, 'google')} disabled={!!loading}>
            {loading === 'google' ? <span className="loading-spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#4285F4' }} /> : <GoogleSVG />}
            Continue with Google
          </button>

          <div className="social-grid">
            <button className="social-btn" onClick={() => doSocial(loginWithGithub, 'github')} disabled={!!loading}>
              {loading === 'github' ? <span className="loading-spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#333' }} /> : <GithubSVG />}
              GitHub
            </button>
            <button className="social-btn" onClick={() => doSocial(loginWithYahoo, 'yahoo')} disabled={!!loading}>
              {loading === 'yahoo' ? <span className="loading-spinner" /> : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#6001D2">
                  <path d="M0 0l6 13.5L0 24h4l3.5-7.5L11 24h4L9.5 13.5 15.5 0h-4L9 7.5 5.5 0H0z"/>
                  <path d="M14.5 0l3 6.5L20.5 0H24l-5.5 11v7h-3v-7L10 0h4.5z"/>
                </svg>
              )}
              Yahoo
            </button>
          </div>

          <button className="social-btn" onClick={() => doSocial(loginWithApple, 'apple')} disabled={!!loading} style={{ marginTop: 0 }}>
            {loading === 'apple' ? <span className="loading-spinner" /> : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            Apple / Game Center
          </button>

          <div className="auth-divider">or register with email</div>

          <form onSubmit={doRegister} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" className="form-input" placeholder="Your full name" value={form.name} onChange={set('name')} required autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-pass">Password</label>
              <input id="reg-pass" type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" type="password" className="form-input" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}>
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                style={{ marginTop: 3, accentColor: 'var(--green)', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
              />
              <label htmlFor="agree" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                I agree to BSDC's community guidelines and terms of service
              </label>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={!!loading} style={{ padding: 12 }}>
              {loading === 'email' ? <><span className="loading-spinner" /> Creating account…</> : 'Create Free Account'}
            </button>
          </form>

          <div className="auth-link">
            Already a member? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}
