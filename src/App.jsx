/**
 * src/App.jsx
 * ---------------------------------------------------------------------------
 * FULL ROUTER (Response 8).
 *
 * Notable decisions:
 *
 * 1. ALL heavy pages are lazy-loaded via React.lazy + Suspense. The initial
 *    JS bundle stays tiny so Largest-Contentful-Paint on slow Bangladeshi
 *    mobile networks remains snappy.
 *
 * 2. PostDetail is mounted at MANY URL segments (/blog/:slug, /qa/:slug,
 *    /code/:slug, etc.) — each pass an `expectedType` prop so cross-type
 *    links auto-redirect to the canonical URL (no duplicate content).
 *
 * 3. <SEOHead /> on every page sets per-route meta. The default <title> in
 *    index.html is the crawl-safe fallback for the moment between request
 *    and React hydration.
 *
 * 4. RequireAuth + RequireAdmin guards bounce unauthenticated/non-admin
 *    requests to /login (with ?next) instead of leaking unauthorised pages.
 * ---------------------------------------------------------------------------
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import AuthProvider, { useAuth } from './context/AuthContext.jsx';
import PointsProvider from './context/PointsContext.jsx';
import Layout from './components/layout/Layout.jsx';
import { ToastHost } from './components/common/Toast.jsx';
import { ConfirmDialogHost } from './components/common/ConfirmDialog.jsx';
import { LoadingCenter } from './components/common/Spinner.jsx';

// Eager (small, used on most routes).
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';

// Lazy pages.
const Explore       = lazy(() => import('./pages/Explore.jsx'));
const Search        = lazy(() => import('./pages/Search.jsx'));
const Tags          = lazy(() => import('./pages/Tags.jsx'));
const Messages      = lazy(() => import('./pages/Messages.jsx'));
const Channels      = lazy(() => import('./pages/Channels.jsx'));
const Communities   = lazy(() => import('./pages/Communities.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const PointsPage    = lazy(() => import('./pages/PointsPage.jsx'));
const About         = lazy(() => import('./pages/About.jsx'));
const Privacy       = lazy(() => import('./pages/Privacy.jsx'));
const Terms         = lazy(() => import('./pages/Terms.jsx'));
const PostDetail    = lazy(() => import('./pages/PostDetail.jsx'));
const Courses       = lazy(() => import('./pages/Courses.jsx'));
const JobBoard      = lazy(() => import('./pages/JobBoard.jsx'));
const Leaderboard   = lazy(() => import('./pages/Leaderboard.jsx'));
const DevIDCardPage = lazy(() => import('./pages/DevIDCard.jsx'));
const CertificatePage = lazy(() => import('./pages/CertificatePage.jsx'));

// Auth (small, but lazy is fine).
const LoginPage      = lazy(() => import('./components/auth/LoginPage.jsx'));
const RegisterPage   = lazy(() => import('./components/auth/RegisterPage.jsx'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword.jsx'));
const EmailVerify    = lazy(() => import('./components/auth/EmailVerify.jsx'));

// Profile + community + verification.
const ProfilePage        = lazy(() => import('./components/profile/ProfilePage.jsx'));
const CommunityPage      = lazy(() => import('./components/community/CommunityPage.jsx'));
const ApplyVerification  = lazy(() => import('./components/verification/ApplyVerification.jsx'));

// Admin (lazy — large surface).
const AdminGate          = lazy(() => import('./admin/AdminGate.jsx'));
const AdminDashboard     = lazy(() => import('./admin/AdminDashboard.jsx'));

/* ===========================================================================
 *  GUARDS
 * =========================================================================*/

function RequireAuth({ children }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <LoadingCenter />;
  if (!firebaseUser) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

/* ===========================================================================
 *  CONVENIENCE WRAPPER
 * =========================================================================*/

/**
 * Quick element factory so route definitions stay readable.
 *
 *   route(<Home />, { right: false })
 */
function withLayout(node, { right = true, footer = true, sidebar = true, immersive = false } = {}) {
  return (
    <Layout
      hideRightSidebar={!right}
      hideFooter={!footer}
      hideSidebar={!sidebar}
      immersive={immersive}
    >
      {node}
    </Layout>
  );
}

/* ===========================================================================
 *  ROUTES
 * =========================================================================*/

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingCenter label="Loading…" />}>
      <Routes>
        {/* ---------- Home + discovery ---------- */}
        <Route path="/"             element={withLayout(<Home />)} />
        <Route path="/explore"      element={withLayout(<Explore />)} />
        <Route path="/search"       element={withLayout(<Search />, { right: false })} />
        <Route path="/tags/:tag"    element={withLayout(<Tags />)} />

        {/* ---------- Auth ---------- */}
        <Route path="/login"        element={withLayout(<LoginPage />, { right: false, footer: false })} />
        <Route path="/register"     element={withLayout(<RegisterPage />, { right: false, footer: false })} />
        <Route path="/forgot"       element={withLayout(<ForgotPassword />, { right: false, footer: false })} />
        <Route path="/verify-email" element={withLayout(<EmailVerify />, { right: false, footer: false })} />

        {/* ---------- Profile ---------- */}
        <Route path="/p/:username"  element={withLayout(<ProfilePage />)} />

        {/* ---------- Verification ---------- */}
        <Route path="/verify-apply"
          element={withLayout(<RequireAuth><ApplyVerification /></RequireAuth>, { right: false })} />

        {/* ---------- Messages (immersive feel) ---------- */}
        <Route path="/messages"
          element={withLayout(<RequireAuth><Messages /></RequireAuth>, { right: false, footer: false })} />

        {/* ---------- Channels ---------- */}
        <Route path="/channels"     element={withLayout(<Channels />)} />

        {/* ---------- Communities ---------- */}
        <Route path="/communities"  element={withLayout(<Communities />)} />
        <Route path="/bsdc/:slug"   element={withLayout(<CommunityPage />)} />

        {/* ---------- Notifications + Points ---------- */}
        <Route path="/notifications"
          element={withLayout(<RequireAuth><Notifications /></RequireAuth>, { right: false })} />
        <Route path="/points"
          element={withLayout(<RequireAuth><PointsPage /></RequireAuth>, { right: false })} />

        {/* ---------- Post detail (one route per type) ---------- */}
        <Route path="/blog/:slug"    element={withLayout(<PostDetail expectedType="blog" />,    { right: false })} />
        <Route path="/qa/:slug"      element={withLayout(<PostDetail expectedType="qa" />,      { right: false })} />
        <Route path="/doc/:slug"     element={withLayout(<PostDetail expectedType="doc" />,     { right: false })} />
        <Route path="/wiki/:slug"    element={withLayout(<PostDetail expectedType="wiki" />,    { right: false })} />
        <Route path="/code/:slug"    element={withLayout(<PostDetail expectedType="code" />,    { right: false })} />
        <Route path="/project/:slug" element={withLayout(<PostDetail expectedType="project" />, { right: false })} />
        <Route path="/jobs/:slug"    element={withLayout(<PostDetail expectedType="job" />,     { right: false })} />
        <Route path="/notice/:slug"  element={withLayout(<PostDetail expectedType="notice" />,  { right: false })} />
        <Route path="/poll/:slug"    element={withLayout(<PostDetail expectedType="poll" />,    { right: false })} />
        <Route path="/event/:slug"   element={withLayout(<PostDetail expectedType="event" />,   { right: false })} />
        <Route path="/video/:slug"   element={withLayout(<PostDetail expectedType="video" />,   { right: false })} />
        <Route path="/story/:slug"   element={withLayout(<PostDetail expectedType="story" />,   { right: false })} />
        <Route path="/post/:slug"    element={withLayout(<PostDetail />,                        { right: false })} />

        {/* ---------- Static / legal ---------- */}
        <Route path="/about"    element={withLayout(<About />)} />
        <Route path="/privacy"  element={withLayout(<Privacy />)} />
        <Route path="/terms"    element={withLayout(<Terms />)} />

        {/* ---------- Admin panel (passkey + email gated) ---------- */}
        <Route path="/admin/*"
          element={withLayout(
            <AdminGate><AdminDashboard /></AdminGate>,
            { right: false, footer: false }
          )} />

        {/* ---------- Developer tools ---------- */}
        <Route path="/jobs"                     element={withLayout(<JobBoard />)} />
        <Route path="/courses"                  element={withLayout(<Courses />)} />
        <Route path="/courses/:slug"            element={withLayout(<Courses />, { right: false })} />
        <Route path="/courses/:slug/exam"
          element={withLayout(<RequireAuth><Courses /></RequireAuth>, { right: false, footer: false })} />
        <Route path="/leaderboard"              element={withLayout(<Leaderboard />)} />
        <Route path="/dev-id"
          element={withLayout(<RequireAuth><DevIDCardPage /></RequireAuth>, { right: false })} />
        <Route path="/dev-id/:username"         element={withLayout(<DevIDCardPage />, { right: false })} />
        <Route path="/certificate/:id"          element={withLayout(<CertificatePage />, { right: false })} />

        {/* ---------- Aliases still under construction ---------- */}
        <Route path="/wiki" element={withLayout(<Explore />)} />
        <Route path="/tags" element={withLayout(<Explore />)} />

        {/* ---------- 404 (always last) ---------- */}
        <Route path="*" element={withLayout(<NotFound />)} />
      </Routes>
    </Suspense>
  );
}

/* ===========================================================================
 *  ROOT
 * =========================================================================*/

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PointsProvider>
          {/* Default <Helmet> — every page overrides title + description but
              this guarantees crawlers always have something useful. */}
          <Helmet>
            <html lang="en-BD" />
            <title>Bangladesh Software Development Community | BSDC</title>
            <meta
              name="description"
              content="BSDC — Bangladesh's largest community for software developers and students. Share code, ask questions, find jobs, learn full-stack, and earn certificates."
            />
          </Helmet>

          <AppRoutes />

          <ToastHost />
          <ConfirmDialogHost />
        </PointsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
