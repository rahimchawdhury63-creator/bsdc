import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { EmailVerificationGuard } from '@components/auth/EmailVerificationGuard';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@components/auth/PublicOnlyRoute';
import { RootLayout } from '@components/layout/RootLayout';
import { Home } from '@pages/Home';
import { NotFound } from '@pages/NotFound';
import { Feed } from '@pages/Feed';
import { Explore } from '@pages/Explore';
import { Search } from '@pages/Search';
import { ProfilePage } from '@pages/profile/username';
import { NotificationsPage } from '@pages/notifications/index';
import { WalletPage } from '@pages/points/wallet';
import { TransferPage } from '@pages/points/transfer';
import { PointHistoryPage } from '@pages/points/history';
import { LeaderboardPage } from '@pages/points/leaderboard';
import { VerificationApplyPage } from '@pages/verification/apply';
import { CommunitiesPage } from '@pages/community/index';
import { CommunityPage } from '@pages/community/name';
import { MessengerHome } from '@pages/messenger/index';
import { CreatorDashboardPage } from '@pages/creator/dashboard';
import { CreatorAdsPage } from '@pages/creator/ads';
import { SettingsShell } from '@components/settings/SettingsShell';
import { SettingsIndexPage } from '@pages/settings/index';
import { SettingsAccountPage } from '@pages/settings/account';
import { SettingsPrivacyPage } from '@pages/settings/privacy';
import { SettingsNotificationsPage } from '@pages/settings/notifications';
import { SettingsSecurityPage } from '@pages/settings/security';
import { SettingsDevicesPage } from '@pages/settings/devices';
import { SettingsAppearancePage } from '@pages/settings/appearance';
import { SettingsMonetizationPage } from '@pages/settings/monetization';
import { CoursesPage } from '@pages/courses/index';
import { CourseDetailPage } from '@pages/courses/id';
import { CourseExamPage } from '@pages/courses/exam/id';
import { CertificatePage } from '@pages/courses/certificate/id';
import { IDCardPage } from '@pages/id-card/index';
import { WikiRoutePage } from '@pages/community/wiki/page';
import { MessengerConversation } from '@pages/messenger/id';
import { CreatePostPage } from '@pages/posts/create';
import { EditPost } from '@pages/posts/EditPost';
import { PostDetail } from '@pages/posts/PostDetail';
import { Login } from '@pages/auth/Login';
import { Register } from '@pages/auth/Register';
import { ForgotPassword } from '@pages/auth/ForgotPassword';
import { EmailVerify } from '@pages/auth/EmailVerify';
import { AuthCallback } from '@pages/auth/AuthCallback';
import { AdminGuard } from '@components/admin/AdminGuard';
import { AdminLayout } from '@components/admin/AdminLayout';
import { AdminIndexPage } from '@pages/admin/index';
import { AdminPasskeyPage } from '@pages/admin/passkey';
import { AdminUsersPage } from '@pages/admin/users';
import { AdminPostsPage } from '@pages/admin/posts';
import { AdminCommunitiesPage } from '@pages/admin/communities';
import { AdminVerificationsPage } from '@pages/admin/verifications';
import { AdminAdsPage } from '@pages/admin/ads';
import { AdminBroadcastPage } from '@pages/admin/broadcast';
import { AdminMonetizationPage } from '@pages/admin/monetization';
import { AdminAnalyticsPage } from '@pages/admin/analytics';
import { AdminNotificationsPage } from '@pages/admin/notifications';
import { AdminPointsPage } from '@pages/admin/points';
import { AdminCoursesPage } from '@pages/admin/courses';
import { AdminNavigationPage } from '@pages/admin/navigation';
import { AdminSettingsPage } from '@pages/admin/settings';
import { AdminReportsPage } from '@pages/admin/reports';
import { AdminBulkExportPage } from '@pages/admin/bulk-export';

/** Small protected placeholder page until full feature pages are delivered. */
const ProtectedAccountPlaceholder = () => (
  <section className="section" aria-labelledby="protected-title">
    <div className="fabric-stack">
      <h1 id="protected-title">Protected BSDC area</h1>
      <p className="text-lead">This route confirms Firebase authentication, route guards, and email verification flow are working before feature modules are attached.</p>
    </div>
  </section>
);

/** Placeholder wrapper for public feature URLs that will receive full modules later. */
const FeaturePlaceholder = ({ title }: { readonly title: string }) => (
  <section className="section" aria-labelledby="feature-title">
    <div className="fabric-stack">
      <h1 id="feature-title">{title}</h1>
      <p className="text-lead">This production route exists now and will receive its full Firebase-connected feature module in the scheduled response plan.</p>
    </div>
  </section>
);

/** Router definition uses React Router DOM v6 data-router APIs as required. */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'feed', element: <Feed /> },
      { path: 'explore', element: <Explore /> },
      { path: 'search', element: <Search /> },
      { path: 'communities', element: <CommunitiesPage /> },
      { path: 'bsdc/:name', element: <CommunityPage /> },
      { path: 'p/:username', element: <ProfilePage /> },
      { path: 'messenger', element: <MessengerHome /> },
      { path: 'messenger/:id', element: <MessengerConversation /> },
      { path: 'points/wallet', element: <WalletPage /> },
      { path: 'points/transfer', element: <TransferPage /> },
      { path: 'points/history', element: <PointHistoryPage /> },
      { path: 'points/leaderboard', element: <LeaderboardPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'courses/exam/:id', element: <CourseExamPage /> },
      { path: 'courses/certificate/:id', element: <CertificatePage /> },
      { path: 'id-card', element: <IDCardPage /> },
      { path: 'wiki/:page', element: <WikiRoutePage /> },
      { path: 'creator/dashboard', element: <CreatorDashboardPage /> },
      { path: 'creator/ads', element: <CreatorAdsPage /> },
      {
        path: 'settings',
        element: <SettingsShell />,
        children: [
          { index: true, element: <SettingsIndexPage /> },
          { path: 'account', element: <SettingsAccountPage /> },
          { path: 'privacy', element: <SettingsPrivacyPage /> },
          { path: 'notifications', element: <SettingsNotificationsPage /> },
          { path: 'security', element: <SettingsSecurityPage /> },
          { path: 'devices', element: <SettingsDevicesPage /> },
          { path: 'appearance', element: <SettingsAppearancePage /> },
          { path: 'monetization', element: <SettingsMonetizationPage /> }
        ]
      },
      { path: 'verification/apply', element: <VerificationApplyPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'post/:id', element: <PostDetail /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'create/:type', element: <CreatePostPage /> },
          { path: 'post/:id/edit', element: <EditPost /> }
        ]
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
          { path: 'forgot-password', element: <ForgotPassword /> }
        ]
      },
      { path: 'email-verify', element: <EmailVerify /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      { path: 'admin/passkey', element: <AdminPasskeyPage /> },
      {
        path: 'admin',
        element: <AdminGuard />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminIndexPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'posts', element: <AdminPostsPage /> },
              { path: 'communities', element: <AdminCommunitiesPage /> },
              { path: 'verifications', element: <AdminVerificationsPage /> },
              { path: 'monetization', element: <AdminMonetizationPage /> },
              { path: 'ads', element: <AdminAdsPage /> },
              { path: 'analytics', element: <AdminAnalyticsPage /> },
              { path: 'notifications', element: <AdminNotificationsPage /> },
              { path: 'broadcast', element: <AdminBroadcastPage /> },
              { path: 'points', element: <AdminPointsPage /> },
              { path: 'courses', element: <AdminCoursesPage /> },
              { path: 'navigation', element: <AdminNavigationPage /> },
              { path: 'settings', element: <AdminSettingsPage /> },
              { path: 'reports', element: <AdminReportsPage /> },
              { path: 'bulk-export', element: <AdminBulkExportPage /> }
            ]
          }
        ]
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <EmailVerificationGuard />,
            children: [{ path: 'settings/account', element: <ProtectedAccountPlaceholder /> }]
          }
        ]
      },
      { path: '*', element: <NotFound /> }
    ]
  },
  {
    path: '/_internal',
    element: <Outlet />,
    children: []
  }
]);

/** Root application component exported for main.tsx and future tests. */
export const App = () => <RouterProvider router={router} />;
