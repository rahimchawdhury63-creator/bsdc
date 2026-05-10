import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import SearchBar from './SearchBar';

const BSDCLogo = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="8" fill="#006A4E"/>
    <text x="4" y="26" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="900" fill="white">BS</text>
    <rect x="0" y="30" width="36" height="6" rx="0" fill="#004d38"/>
    <text x="3" y="35" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#6EE7B7" letterSpacing="1">DC.INFO.BD</text>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const NavLinks = [
  { to: '/', label: 'Home' },
  { to: '/post', label: 'Q&A' },
  { to: '/wiki', label: 'Wiki' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const avatarLetter = profile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <nav className="navbar" style={{ boxShadow: scrolled ? 'var(--shadow-lg)' : 'var(--shadow-md)' }}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" aria-label="BSDC Home">
            <BSDCLogo />
            <span>BSDC<span className="logo-bd">.INFO.BD</span></span>
          </Link>

          <div className="navbar-search-wrap">
            <SearchBar />
          </div>

          <nav className="navbar-links" aria-label="Main navigation">
            {NavLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={location.pathname === link.to ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="navbar-actions">
            {user ? (
              <>
                <button
                  className="notif-btn"
                  aria-label="Notifications"
                  onClick={() => {
                    window.OneSignalDeferred?.push?.(os => os.User.PushSubscription.optIn());
                  }}
                >
                  <BellIcon />
                  <span className="notif-dot" aria-hidden="true" />
                </button>

                <Link to="/create" className="btn btn-primary btn-sm">
                  <PlusIcon /> Post
                </Link>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropOpen(p => !p)}
                    style={{
                      background: 'none', border: 'none',
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', transition: 'var(--transition)',
                    }}
                    aria-label="User menu"
                    aria-expanded={dropOpen}
                  >
                    {profile?.photoURL
                      ? <img src={profile.photoURL} alt={profile.displayName} className="avatar avatar-sm" />
                      : (
                        <span className="avatar-placeholder avatar-sm" style={{ fontSize: '0.85rem' }}>
                          {avatarLetter}
                        </span>
                      )
                    }
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {dropOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: 'var(--white)', border: '1px solid var(--gray-2)',
                      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
                      minWidth: 200, zIndex: 1001, overflow: 'hidden',
                    }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-2)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)' }}>
                          {profile?.displayName || 'User'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {user?.email}
                        </div>
                      </div>
                      {[
                        { to: `/profile/${user.uid}`, label: 'My Profile' },
                        { to: '/create', label: 'Create Post' },
                        { to: `/profile/${user.uid}/edit`, label: 'Edit Profile' },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          style={{
                            display: 'block', padding: '10px 16px',
                            fontSize: '0.88rem', color: 'var(--dark)',
                            transition: 'var(--transition)',
                            borderBottom: '1px solid var(--gray-2)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--green-bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '10px 16px', fontSize: '0.88rem',
                          color: 'var(--danger)', background: 'none',
                          cursor: 'pointer', transition: 'var(--transition)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
              </>
            )}

            <button
              className="hamburger"
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }} />
              <span style={{ opacity: menuOpen ? 0 : 1 }} />
              <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }} />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="navigation" aria-label="Mobile navigation">
        {NavLinks.map(link => (
          <Link key={link.to} to={link.to}>{link.label}</Link>
        ))}
        <div style={{ padding: '8px 12px' }}>
          <SearchBar />
        </div>
        {user ? (
          <>
            <Link to={`/profile/${user.uid}`}>My Profile</Link>
            <Link to="/create">Create Post</Link>
            <button
              onClick={handleLogout}
              style={{
                textAlign: 'left', padding: '10px 12px',
                color: 'var(--danger)', background: 'none',
                fontSize: '0.95rem', width: '100%',
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
            <Link to="/login" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Join</Link>
          </div>
        )}
      </div>
    </>
  );
}
