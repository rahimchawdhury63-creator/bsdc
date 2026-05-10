import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const PostPage = lazy(() => import('./pages/PostPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const WikiPage = lazy(() => import('./pages/WikiPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));

// Global page loading fallback
function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <svg
        width="48" height="48"
        viewBox="0 0 36 36"
        fill="none"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <rect width="36" height="36" rx="8" fill="#006A4E" opacity="0.15"/>
        <rect width="36" height="36" rx="8" fill="none" stroke="#006A4E" strokeWidth="2"
          strokeDasharray="60" strokeDashoffset="20"
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <text x="4" y="26" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="900" fill="#006A4E">BS</text>
      </svg>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading BSDC…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Toast notification system
let toastQueue = [];
let toastSetFn = null;

export function showToast(message, type = 'info', duration = 4000) {
  const id = Date.now();
  const toast = { id, message, type };
  toastQueue.push(toast);
  toastSetFn?.(prev => [...prev, toast]);
  setTimeout(() => {
    toastSetFn?.(prev => prev.filter(t => t.id !== id));
  }, duration);
}

function ToastContainer() {
  const [toasts, setToasts] = React.useState([]);
  toastSetFn = setToasts;

  const ToastIcon = ({ type }) => {
    if (type === 'success') return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    );
    if (type === 'error') return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    );
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    );
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="alert" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <ToastIcon type={t.type} />
          <span>{t.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            style={{
              marginLeft: 'auto', background: 'none',
              color: '#94A3B8', padding: '2px 4px',
              fontSize: '1.1rem', lineHeight: 1,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Route progress indicator
function RouteProgress() {
  const { pathname } = useLocation();
  const [visible, setVisible] = React.useState(false);
  const [width, setWidth] = React.useState(0);

  useEffect(() => {
    setVisible(true);
    setWidth(30);
    const t1 = setTimeout(() => setWidth(70), 100);
    const t2 = setTimeout(() => setWidth(100), 400);
    const t3 = setTimeout(() => { setVisible(false); setWidth(0); }, 700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [pathname]);

  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 3, zIndex: 9999,
      background: `linear-gradient(90deg, #006A4E ${width}%, transparent ${width}%)`,
      transition: 'background 0.3s ease',
    }} aria-hidden="true" />
  );
}

// Not Found Page
function NotFoundPage() {
  return (
    <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ margin: '0 auto 24px' }}>
          <circle cx="40" cy="40" r="38" fill="var(--green-bg)" stroke="var(--green)" strokeWidth="2"/>
          <text x="40" y="52" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="36" fontWeight="900" fill="var(--green)">404</text>
        </svg>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
          এই পেজটি খুঁজে পাওয়া যাচ্ছে না।<br />
          The page you're looking for doesn't exist on BSDC.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" className="btn btn-primary">Go Home</a>
          <a href="/post" className="btn btn-outline">Browse Posts</a>
        </div>
      </div>
    </main>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    // Redirect to login with return path
    window.location.href = `/login`;
    return null;
  }
  return children;
}

export default function App() {
  const { loading } = useAuth();

  // OneSignal notification handler
  useEffect(() => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        await OneSignal.init({
          appId: '5f367dc9-3fc3-4fd9-b452-e32fa438509b',
          notifyButton: {
            enable: true,
            size: 'medium',
            theme: 'default',
            position: 'bottom-right',
            offset: { bottom: '20px', right: '20px' },
            text: {
              'tip.state.unsubscribed': 'Subscribe to BSDC notifications',
              'tip.state.subscribed': 'Subscribed to BSDC!',
              'message.prenotify': 'Click to subscribe to BSDC updates',
              'message.action.subscribed': "Thanks for subscribing to BSDC!",
            },
            colors: {
              'circle.background': '#006A4E',
              'circle.foreground': 'white',
              'badge.background': '#006A4E',
              'badge.foreground': 'white',
              'badge.bordercolor': 'white',
              'pulse.color': '#006A4E',
            },
          },
          welcomeNotification: {
            title: 'বাংলাদেশ সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি',
            message: 'BSDC-তে স্বাগতম! আপনি সফলভাবে নোটিফিকেশন সাবস্ক্রাইব করেছেন।',
          },
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: '/' },
        });
      } catch (e) {
        console.warn('OneSignal init error:', e);
      }
    });
  }, []);

  if (loading) return <PageLoader />;

  return (
    <>
      <RouteProgress />
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/post" element={<PostPage />} />
          <Route path="/post/:slug" element={<PostDetailPage />} />
          <Route path="/wiki" element={<WikiPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/profile/:uid" element={<ProfilePage />} />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* PROTECTED ROUTES */}
          <Route path="/create" element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          } />
          <Route path="/profile/:uid/edit" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <ToastContainer />
    </>
  );
}
