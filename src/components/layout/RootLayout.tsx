import { Outlet } from 'react-router-dom';
import { AuthStateListener } from '@components/auth/AuthStateListener';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { RightSidebar } from './RightSidebar';
import { Sidebar } from './Sidebar';

/**
 * Main application layout for authenticated and public community pages.
 * It combines desktop sidebars, mobile bottom navigation, global auth listener,
 * semantic landmarks, and safe spacing for PWA display modes.
 */
export const RootLayout = () => (
  <div className="app-shell">
    <AuthStateListener />
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <Navbar />
    <div className="layout-grid container">
      <Sidebar />
      <main className="layout-main" id="main-content">
        <Outlet />
      </main>
      <RightSidebar />
    </div>
    <Footer />
    <BottomNav />
  </div>
);
