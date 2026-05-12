import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../AuthContext';

/* ═══════════════════════════════════════════
   ICONS
═══════════════════════════════════════════ */
const Icon = {
  Google: () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  Github: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  Yahoo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#6001D2">
      <path d="M0 0l6 13.5L0 24h4l3.5-7.5L11 24h4L9.5 13.5 15.5 0h-4L9 7.5 5.5 0H0z"/>
      <path d="M14.5 0l3 6.5L20.5 0H24l-5.5 11v7h-3v-7L10 0h4.5z"/>
    </svg>
  ),
  Eye: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Lock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Link: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   ACCOUNT LINKING MODAL
═══════════════════════════════════════════ */
function LinkingModal({ data, onLink, onCancel, linking }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && !linking && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: 32,
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#FEF3C7',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706',
            }}
          >
            <Icon.Link />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
            Account Already Exists
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6 }}>
            <strong style={{ color: '#1E293B' }}>{data.email}</strong>
            {' '}is registered with{' '}
            <strong style={{ color: '#006A4E' }}>{data.existingProviderName}</strong>.
          </p>
        </div>

        <div
          style={{
            background: '#F0FAF6',
            border: '1px solid #006A4E20',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#006A4E', marginBottom: 8 }}>
            What happens next:
          </p>
          {[
            'Sign in with ' + data.existingProviderName + ' to verify ownership',
            'Both providers get linked to one account',
            'Use either method in the future',
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.82rem',
                color: '#1E293B',
                marginBottom: 4,
              }}
            >
              <span style={{ color: '#006A4E' }}><Icon.Check /></span>
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={onLink}
          disabled={linking}
          style={{
            width: '100%',
            padding: '14px',
            background: '#006A4E',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: linking ? 'not-allowed' : 'pointer',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
            opacity: linking ? 0.7 : 1,
          }}
        >
          {linking ? (
            <>
              <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Linking accounts...
            </>
          ) : (
            <>Sign in with {data.existingProviderName} to Link</>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={linking}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: '#64748B',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: linking ? 'not-allowed' : 'pointer',
          }}
        >
          Cancel
        </button>

        <p style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', marginTop: 14 }}>
          Your data stays safe. BSDC never stores passwords.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN LOGIN PAGE
═══════════════════════════════════════════ */
export default function LoginPage() {
  const {
    loginWithGoogle,
    loginWithGithub,
    loginWithYahoo,
    loginWithEmail,
    linkAccounts,
    resetPassword,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from) || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState('');
  const [linkData, setLinkData] = useState(null);
  const [linking, setLinking] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  /* ── Handle social sign-in ── */
  const handleSocial = async (loginFn, name) => {
    setError('');
    setSuccess('');
    setLoading(name);

    const result = await loginFn();

    setLoading('');

    if (result.success) {
      setSuccess('Signed in! Redirecting...');
      setTimeout(() => navigate(from, { replace: true }), 600);
      return;
    }

    if (result.cancelled) return;

    if (result.needsLinking) {
      setLinkData(result);
      return;
    }

    if (result.error) setError(result.error);
  };

  /* ── Handle email sign-in ── */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading('email');

    const result = await loginWithEmail(email, password);

    setLoading('');

    if (result.success) {
      setSuccess('Signed in! Redirecting...');
      setTimeout(() => navigate(from, { replace: true }), 600);
    } else {
      setError(result.error || 'Sign-in failed.');
    }
  };

  /* ── Handle account linking ── */
  const handleLink = async () => {
    if (!linkData) return;
    setLinking(true);

    const result = await linkAccounts(linkData.existingProviderId, linkData.pendingCredential);

    setLinking(false);

    if (result.success) {
      setLinkData(null);
      setSuccess('Accounts linked! Redirecting...');
      setTimeout(() => navigate(from, { replace: true }), 800);
    } else if (result.cancelled) {
      // user cancelled, keep modal open
    } else if (result.error) {
      setLinkData(null);
      setError(result.error);
    }
  };

  /* ── Handle password reset ── */
  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email.');
      return;
    }
    setError('');
    setLoading('reset');

    const result = await resetPassword(resetEmail);

    setLoading('');

    if (result.success) {
      setResetSent(true);
    } else {
      setError(result.error || 'Failed to send reset email.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In to BSDC — Bangladesh Software Development Community</title>
        <meta name="description" content="Sign in to your BSDC account. Login with Google, GitHub, Yahoo, or Email. Free forever for Bangladeshi developers." />
        <meta name="keywords" content="BSDC login, Bangladesh developer sign in, BSDC sign in, login Bangladesh software developer community" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.bsdc.info.bd/login" />
        <meta property="og:title" content="Sign In to BSDC" />
        <meta property="og:description" content="Sign in to Bangladesh's premier developer community." />
      </Helmet>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .auth-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1E293B 50%, #006A4E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }
        .auth-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236EE7B7' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .auth-card {
          background: white;
          border-radius: 24px;
          padding: 40px 32px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          position: relative;
          z-index: 1;
          animation: slideUp 0.4s ease;
        }

        @media (max-width: 480px) {
          .auth-card { padding: 28px 20px; border-radius: 20px; }
        }

        .auth-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #1E293B;
          background: #F8FAFC;
          transition: all 0.2s;
          font-family: inherit;
        }
        .auth-input:focus {
          outline: none;
          border-color: #006A4E;
          background: white;
          box-shadow: 0 0 0 4px rgba(0,106,78,0.1);
        }
        .auth-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E2E8F0;
          background: white;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 600;
          color: #1E293B;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .social-btn:hover:not(:disabled) {
          border-color: #006A4E;
          background: #F0FAF6;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .social-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      {linkData && (
        <LinkingModal
          data={linkData}
          onLink={handleLink}
          onCancel={() => { setLinkData(null); setError(''); }}
          linking={linking}
        />
      )}

      <div className="auth-bg">
        <div className="auth-card">
          {/* Logo */}
          <Link to="/" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
            <svg width="56" height="56" viewBox="0 0 36 36">
              <rect width="36" height="36" rx="8" fill="#006A4E"/>
              <text x="4" y="26" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="900" fill="white">BS</text>
              <rect x="0" y="30" width="36" height="6" fill="#004d38"/>
              <text x="3" y="35" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#6EE7B7" letterSpacing="1">DC.BD</text>
            </svg>
          </Link>

          {!showReset ? (
            <>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E293B', textAlign: 'center', marginBottom: 6 }}>
                Welcome Back
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#64748B', textAlign: 'center', marginBottom: 24 }}>
                Sign in to BSDC to continue
              </p>

              {/* Alerts */}
              {error && (
                <div style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  color: '#DC2626',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}>
                  <Icon.Alert />
                  <span style={{ flex: 1 }}>{error}</span>
                  <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: 0 }}>
                    <Icon.Close />
                  </button>
                </div>
              )}
              {success && (
                <div style={{
                  background: '#D1FAE5',
                  border: '1px solid #6EE7B7',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  color: '#065F46',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 600,
                }}>
                  <Icon.Check />
                  {success}
                </div>
              )}

              {/* Google */}
              <button
                className="social-btn"
                onClick={() => handleSocial(loginWithGoogle, 'google')}
                disabled={!!loading}
                style={{ marginBottom: 8 }}
              >
                {loading === 'google' ? (
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #E2E8F0', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                ) : (
                  <Icon.Google />
                )}
                Continue with Google
              </button>

              {/* GitHub + Yahoo Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                <button
                  className="social-btn"
                  onClick={() => handleSocial(loginWithGithub, 'github')}
                  disabled={!!loading}
                >
                  {loading === 'github' ? (
                    <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #E2E8F0', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  ) : (
                    <Icon.Github />
                  )}
                  GitHub
                </button>
                <button
                  className="social-btn"
                  onClick={() => handleSocial(loginWithYahoo, 'yahoo')}
                  disabled={!!loading}
                >
                  {loading === 'yahoo' ? (
                    <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #E2E8F0', borderTopColor: '#6001D2', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  ) : (
                    <Icon.Yahoo />
                  )}
                  Yahoo
                </button>
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '20px 0',
                color: '#94A3B8',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                OR SIGN IN WITH EMAIL
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailLogin}>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <span className="auth-input-icon"><Icon.Mail /></span>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <span className="auth-input-icon"><Icon.Lock /></span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      padding: 4,
                    }}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>

                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#006A4E',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!!loading}
                  style={{
                    width: '100%',
                    padding: 14,
                    background: 'linear-gradient(135deg, #006A4E, #00855f)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(0,106,78,0.3)',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading === 'email' ? (
                    <>
                      <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: '#64748B' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#006A4E', fontWeight: 700 }}>
                  Create one free
                </Link>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Link to="/" style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                  ← Back to BSDC
                </Link>
              </div>
            </>
          ) : (
            /* Password Reset View */
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', textAlign: 'center', marginBottom: 6 }}>
                Reset Password
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#64748B', textAlign: 'center', marginBottom: 24 }}>
                We'll email you a reset link
              </p>

              {error && (
                <div style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  color: '#DC2626',
                  marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: '#D1FAE5',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#065F46',
                  }}>
                    <Icon.Check />
                  </div>
                  <p style={{ color: '#1E293B', marginBottom: 8, fontWeight: 600 }}>
                    Check your email
                  </p>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 24 }}>
                    Reset link sent to {resetEmail}
                  </p>
                  <button
                    onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(''); }}
                    style={{
                      padding: '10px 24px',
                      background: '#006A4E',
                      color: 'white',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset}>
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <span className="auth-input-icon"><Icon.Mail /></span>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!!loading}
                    style={{
                      width: '100%',
                      padding: 14,
                      background: '#006A4E',
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginBottom: 12,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading === 'reset' ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReset(false)}
                    style={{
                      width: '100%',
                      padding: 12,
                      background: 'transparent',
                      color: '#64748B',
                      border: '1px solid #E2E8F0',
                      borderRadius: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
