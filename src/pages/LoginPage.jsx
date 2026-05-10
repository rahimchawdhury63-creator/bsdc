import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
const YahooSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#6001D2">
    <path d="M0 0l6 13.5L0 24h4l3.5-7.5L11 24h4L9.5 13.5 15.5 0h-4L9 7.5 5.5 0H0z"/>
    <path d="M14.5 0l3 6.5L20.5 0H24l-5.5 11v7h-3v-7L10 0h4.5z"/>
  </svg>
);
const EmailSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export default function LoginPage() {
  const { loginWithGoogle, loginWithGithub, loginWithYahoo, loginWithApple, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleError = (e) => {
    const codes = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled.',
      'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
    };
    setError(codes[e.code] || e.message || 'Sign-in failed. Please try again.');
  };

  const doSocial = async (fn, name) => {
    setError(''); setLoading(name);
    try { await fn(); navigate(from, { replace: true }); }
    catch (e) { handleError(e); }
    finally { setLoading(''); }
  };

  const doEmail = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill all fields.'); return; }
    setError(''); setLoading('email');
    try { await loginWithEmail(email, password); navigate(from, { replace: true }); }
    catch (e) { handleError(e); }
    finally { setLoading(''); }
  };

  return (
    <>
      <Helmet>
        <title>Login — BSDC | Bangladesh Software Development Community</title>
        <meta name="description" content="Sign in to BSDC — Bangladesh Software Development Community. Login with Google, GitHub, Yahoo or Email." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.bsdc.info.bd/login" />
      </Helmet>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#006A4E"/>
              <text x="4" y="26" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="900" fill="white">BS</text>
              <rect x="0" y="30" width="36" height="6" rx="0" fill="#004d38"/>
              <text x="3" y="35" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#6EE7B7" letterSpacing="1">DC.BD</text>
            </svg>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your BSDC account</p>

          {error && (
            <div style={{
              background: '#FEE2E2', border: '1px solid #FECACA',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px',
              fontSize: '0.88rem', color: 'var(--danger)', marginBottom: 16,
            }} role="alert">
              {error}
            </div>
          )}

          {/* SOCIAL BUTTONS */}
          <button
            className="social-btn"
            onClick={() => doSocial(loginWithGoogle, 'google')}
            disabled={!!loading}
            aria-label="Continue with Google"
          >
            {loading === 'google' ? <span className="loading-spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#4285F4' }} /> : <GoogleSVG />}
            Continue with Google
          </button>

          <div className="social-grid">
            <button
              className="social-btn"
              onClick={() => doSocial(loginWithGithub, 'github')}
              disabled={!!loading}
              aria-label="Continue with GitHub"
            >
              {loading === 'github' ? <span className="loading-spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#333' }} /> : <GithubSVG />}
              GitHub
            </button>
            <button
              className="social-btn"
              onClick={() => doSocial(loginWithYahoo, 'yahoo')}
              disabled={!!loading}
              aria-label="Continue with Yahoo"
            >
              {loading === 'yahoo' ? <span className="loading-spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#6001D2' }} /> : <YahooSVG />}
              Yahoo
            </button>
          </div>

          <button
            className="social-btn"
            onClick={() => doSocial(loginWithApple, 'apple')}
            disabled={!!loading}
            aria-label="Continue with Apple (Game Center)"
            style={{ marginTop: 0 }}
          >
            {loading === 'apple' ? (
              <span className="loading-spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            Apple / Game Center
          </button>

          <div className="auth-divider">or sign in with email</div>

          <form onSubmit={doEmail} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', padding: 4 }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={!!loading}
              style={{ padding: '12px' }}
            >
              {loading === 'email'
                ? <><span className="loading-spinner" /> Signing in…</>
                : <><EmailSVG /> Sign In with Email</>
              }
            </button>
          </form>

          <div className="auth-link">
            Don't have an account? <Link to="/register">Create one free</Link>
          </div>
          <div className="auth-link" style={{ marginTop: 4 }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              ← Back to BSDC
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
