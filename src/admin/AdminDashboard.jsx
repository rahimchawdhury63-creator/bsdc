/**
 * src/admin/AdminDashboard.jsx
 * ---------------------------------------------------------------------------
 * The /admin shell — left nav + nested route content + headline KPIs.
 *
 * Sub-routes:
 *   /admin                  → overview (this component's main body)
 *   /admin/users            → UserManagement
 *   /admin/posts            → PostModeration
 *   /admin/verifications    → VerificationApproval
 *   /admin/analytics        → AnalyticsPanel
 *   /admin/points           → PointsControl
 *   /admin/ads              → AdsManager
 *   /admin/notifications    → NotificationSender
 *   /admin/courses          → CourseManager
 *   /admin/communities      → CommunityManager
 *   /admin/reports          → ReportsManager
 *   /admin/seo              → SEOManager
 *   /admin/system           → SystemSettings
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import {
  collection, getDocs, query, where, limit, orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import SEOHead from '../components/seo/SEOHead.jsx';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { formatPoints } from '../utils/pointsCalculator.js';
import {
  IconShield, IconUsers, IconBookOpen, IconCheck, IconTrending,
  IconCoin, IconBriefcase, IconBell, IconBookOpen as IconCourseIcon,
  IconHash, IconFlag, IconSettings, IconLightning
} from '../components/common/Icons.jsx';

// Sub-pages.
import UserManagement from './UserManagement.jsx';
import PostModeration from './PostModeration.jsx';
import VerificationApproval from './VerificationApproval.jsx';
import AnalyticsPanel from './AnalyticsPanel.jsx';
import PointsControl from './PointsControl.jsx';
import AdsManager from './AdsManager.jsx';
import NotificationSender from './NotificationSender.jsx';
import CourseManager from './CourseManager.jsx';
import CommunityManager from './CommunityManager.jsx';
import ReportsManager from './ReportsManager.jsx';
import SEOManager from './SEOManager.jsx';
import SystemSettings from './SystemSettings.jsx';

const NAV = [
  { to: '/admin',                label: 'Overview',       Icon: IconShield },
  { to: '/admin/users',          label: 'Users',          Icon: IconUsers },
  { to: '/admin/posts',          label: 'Posts',          Icon: IconBookOpen },
  { to: '/admin/verifications',  label: 'Verifications',  Icon: IconCheck },
  { to: '/admin/analytics',      label: 'Analytics',      Icon: IconTrending },
  { to: '/admin/points',         label: 'Points',         Icon: IconCoin },
  { to: '/admin/ads',            label: 'Ads',            Icon: IconBriefcase },
  { to: '/admin/notifications',  label: 'Notifications',  Icon: IconBell },
  { to: '/admin/courses',        label: 'Courses',        Icon: IconCourseIcon },
  { to: '/admin/communities',    label: 'Communities',    Icon: IconHash },
  { to: '/admin/reports',        label: 'Reports',        Icon: IconFlag },
  { to: '/admin/seo',            label: 'SEO',            Icon: IconLightning },
  { to: '/admin/system',         label: 'System',         Icon: IconSettings }
];

export default function AdminDashboard() {
  return (
    <>
      <SEOHead title="Admin Panel" canonical="/admin" noindex />

      <div className="bsdc-admin-layout">
        <aside className="bsdc-admin-nav" aria-label="Admin navigation">
          <h2 style={{ margin: 0, fontSize: '1rem', padding: '6px 12px 12px' }}>
            <IconShield size={16} /> BSDC Admin
          </h2>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) => `bsdc-admin-nav__item ${isActive ? 'bsdc-admin-nav__item--active' : ''}`}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </aside>

        <main>
          <Routes>
            <Route index                element={<Overview />} />
            <Route path="users"         element={<UserManagement />} />
            <Route path="posts"         element={<PostModeration />} />
            <Route path="verifications" element={<VerificationApproval />} />
            <Route path="analytics"     element={<AnalyticsPanel />} />
            <Route path="points"        element={<PointsControl />} />
            <Route path="ads"           element={<AdsManager />} />
            <Route path="notifications" element={<NotificationSender />} />
            <Route path="courses"       element={<CourseManager />} />
            <Route path="communities"   element={<CommunityManager />} />
            <Route path="reports"       element={<ReportsManager />} />
            <Route path="seo"           element={<SEOManager />} />
            <Route path="system"        element={<SystemSettings />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

/* ===========================================================================
 *  OVERVIEW — top-level KPIs
 * =========================================================================*/

function Overview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [usersSnap, postsSnap, verSnap, txSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(1000))),
          getDocs(query(collection(db, 'posts'), where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(1000))),
          getDocs(query(collection(db, 'verificationRequests'), where('status', '==', 'pending'), limit(200))),
          getDocs(query(collection(db, 'pointsTransactions'), orderBy('createdAt', 'desc'), limit(500)))
        ]);
        if (cancelled) return;
        const totalPoints = txSnap.docs.reduce((s, d) => s + (d.data().amount || 0), 0);
        setStats({
          users: usersSnap.size,
          posts: postsSnap.size,
          pendingVerifications: verSnap.size,
          totalPoints
        });
      } catch {
        if (!cancelled) setStats({ users: 0, posts: 0, pendingVerifications: 0, totalPoints: 0 });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!stats) return <LoadingCenter />;

  return (
    <>
      <h1 style={{ margin: '0 0 var(--space-md)', fontSize: '1.4rem' }}>Welcome back, admin</h1>

      <div className="bsdc-admin-stats">
        <StatCard label="Members"               value={formatPoints(stats.users)}                onClick={() => navigate('/admin/users')} />
        <StatCard label="Active posts"          value={formatPoints(stats.posts)}                onClick={() => navigate('/admin/posts')} />
        <StatCard label="Pending verifications" value={stats.pendingVerifications}               onClick={() => navigate('/admin/verifications')} highlight={stats.pendingVerifications > 0} />
        <StatCard label="Points circulated"     value={formatPoints(stats.totalPoints)}          onClick={() => navigate('/admin/points')} />
      </div>

      <div className="bsdc-grid-2">
        <QuickCard
          title="Send a broadcast"
          body="Push notifications + in-app to every signed-in member instantly."
          cta="Open sender" onClick={() => navigate('/admin/notifications')}
        />
        <QuickCard
          title="Review verifications"
          body="Approve or reject pending blue-check applications."
          cta="Review queue" onClick={() => navigate('/admin/verifications')}
        />
        <QuickCard
          title="Moderate posts"
          body="Search, feature, or remove any post sitewide."
          cta="Open moderation" onClick={() => navigate('/admin/posts')}
        />
        <QuickCard
          title="System settings"
          body="Maintenance mode, point rules, feature flags."
          cta="Open settings" onClick={() => navigate('/admin/system')}
        />
      </div>
    </>
  );
}

function StatCard({ label, value, onClick, highlight }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bsdc-stat-card"
      style={{
        textAlign: 'left', cursor: 'pointer',
        border: highlight ? '2px solid var(--color-warning)' : '1px solid var(--color-border)',
        background: highlight ? '#fff7e6' : 'var(--color-card)'
      }}
    >
      <div className="bsdc-stat-card__label">{label}</div>
      <div className="bsdc-stat-card__value">{value}</div>
    </button>
  );
}

function QuickCard({ title, body, cta, onClick }) {
  return (
    <div className="bsdc-card">
      <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
      <p className="bsdc-text-muted bsdc-text-sm">{body}</p>
      <button type="button" className="bsdc-btn bsdc-btn--outline bsdc-btn--sm" onClick={onClick}>
        {cta}
      </button>
    </div>
  );
}
