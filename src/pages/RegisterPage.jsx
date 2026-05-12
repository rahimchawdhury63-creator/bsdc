import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../AuthContext';

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
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
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
};

/* Password strength meter */
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '#E2E8F0' };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    { label: 'Too weak',  color: '#DC2626' },
    { label: 'Weak',      color: '#F59E0B' },
    { label: 'Fair',      color: '#F59E0B' },
    { label: 'Good',      color: '#10B981' },
    { label: 'Strong',    color: '#059669' },
    { label: 'Very Strong', color: '#006A4E' },
  ];
  return { score, ...levels[score] };
}

export default function RegisterPage() {
  const {
    register,
    loginWithGoogle,
    loginWithGithub,
    loginWithYahoo,
  } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState('');

  const strength = getPasswordStrength(password);

  const handleSocial = async (loginFn, name) => {
    setError('');
    setSuccess('');
    setLoading(name);

    const result = await loginFn();

    setLoading('');

    if (result.success) {
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/', { replace: true }), 600);
      return;
    }

    if (result.cancelled) return;

    if (result.needsLinking) {
      setError(`This email is already registered with ${result.existingProviderName}. Please sign in instead.`);
      return;
    }

    if (result.error) setError(result.error);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!agree) { setError('Please accept the community guidelines.'); return; }

    setError('');
    setSuccess('');
    setLoading('email');

    const result = await register(email, password, name.trim());

    setLoading('');

    if (result.success) {
      setSuccess('Account created! Welcome to BSDC.');
      setTimeout(() => navigate('/', { replace: true }), 800);
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Join BSDC Free — Create Your Bangladesh Developer Account</title>
        <meta name="description" content="Join Bangladesh's #1 software development community for free. Sign up with Google, GitHub, Yahoo or email. 100% free forever." />
        <meta name="keywords" content="BSDC register, join Bangladesh developer community, sign up Bangladesh software development, BSDC create account" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.bsdc.info.bd/register" />
      </Helmet>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-bg-reg {
          min-height: 100vh;
          background: linear-gradient(135deg, #006A4E 0%, #1E293B 60%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }
        .auth-bg-reg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236EE7B7' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .reg-card {
          background: white;
          border-radius: 24px;
          padding: 36px 32px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          position: relative;
          z-index: 1;
          animation: slideUp 0.4s ease;
        }

        @media (max-width: 480px) {
          .reg-card { padding: 24px 20px; border-radius: 20px; }
        }

        .reg-input {
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
        .reg-input:focus {
          outline: none;
          border-color: #006A4E;
          background: white;
          box-shadow: 0 0 0 4px rgba(0,106,78,0.1);
        }
        .reg-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
        }

        .reg-social {
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
        .reg-social:hover:not(:disabled) {
          border-color: #006A4E;
          background: #F0FAF6;
          transform: translateY(-1px);
        }
        .reg-social:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="auth-bg-reg">
        <div className="reg-card">
          <Link to="/" style={{ display: 'block', textAlign: 'center', marginBottom: 20 }}>
            <svg width="56" height="56" viewBox="0 0 36 36">
              <rect width="36" height="36" rx="8" fill="#006A4E"/>
              <text x="4" y="26" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="900" fill="white">BS</text>
              <rect x="0" y="30" width="36" height="6" fill="#004d38"/>
              <text x="3" y="35" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#6EE7B7" letterSpacing="1">DC.BD</text>
            </svg>
          </Link>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', textAlign: 'center', marginBottom: 4 }}>
            Join BSDC Free
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', textAlign: 'center', marginBottom: 22 }}>
            বাংলাদেশের সেরা ডেভেলপার কমিউনিটি
          </p>

          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: '0.85rem',
              color: '#DC2626',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}>
              <Icon.Alert />
              <span>{error}</span>
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
              marginBottom: 14,
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
            className="reg-social"
            onClick={() => handleSocial(loginWithGoogle, 'google')}
            disabled={!!loading}
            style={{ marginBottom: 8 }}
          >
            {loading === 'google' ? (
              <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #E2E8F0', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            ) : (
              <Icon.Google />
            )}
            Sign up with Google
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            <button
              className="reg-social"
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
              className="reg-social"
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

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '18px 0',
            color: '#94A3B8',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            OR USE EMAIL
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          <form onSubmit={handleRegister}>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <span className="reg-input-icon"><Icon.User /></span>
              <input
                type="text"
                className="reg-input"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                maxLength={50}
              />
            </div>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <span className="reg-input-icon"><Icon.Mail /></span>
              <input
                type="email"
                className="reg-input"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div style={{ position: 'relative', marginBottom: 6 }}>
              <span className="reg-input-icon"><Icon.Lock /></span>
              <input
                type={showPass ? 'text' : 'password'}
                className="reg-input"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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
              >
                {showPass ? <Icon.EyeOff /> : <Icon.Eye />}
              </button>
            </div>

            {/* Password strength meter */}
            {password && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background: i <= strength.score ? strength.color : '#E2E8F0',
                        transition: 'background 0.2s',
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>
                  {strength.label}
                </div>
              </div>
            )}

            <div style={{ position: 'relative', marginBottom: 14 }}>
              <span className="reg-input-icon"><Icon.Lock /></span>
              <input
                type={showPass ? 'text' : 'password'}
                className="reg-input"
                placeholder="Confirm password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: '0.82rem',
              color: '#64748B',
              marginBottom: 16,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                style={{
                  marginTop: 2,
                  width: 16,
                  height: 16,
                  accentColor: '#006A4E',
                  cursor: 'pointer',
                }}
              />
              <span>
                I agree to BSDC's{' '}
                <Link to="/about" style={{ color: '#006A4E', fontWeight: 600 }}>
                  community guidelines
                </Link>
                {' '}and respect Bangladeshi developer values
              </span>
            </label>

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
                boxShadow: '0 4px 14px rgba(0,106,78,0.3)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading === 'email' ? (
                <>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Creating account...
                </>
              ) : (
                'Create Free Account'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#006A4E', fontWeight: 700 }}>
              Sign in
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <Link to="/" style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
              ← Back to BSDC
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
