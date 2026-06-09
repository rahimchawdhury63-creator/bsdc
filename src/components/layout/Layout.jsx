/**
 * src/components/layout/Layout.jsx
 * ---------------------------------------------------------------------------
 * The main layout wrapper used by EVERY normal page.
 *
 * Structure:
 *   <Header />
 *   <main grid>
 *     <Sidebar />        (tablet+; mobile = drawer)
 *     <content>{children}</content>
 *     <RightSidebar />   (1280px+)
 *   </main>
 *   <Footer />
 *   <MobileNav />        (<768px)
 *
 * Props let pages opt out of pieces:
 *   - hideRightSidebar : full-width pages (chat, admin)
 *   - hideFooter       : immersive (story viewer, chat)
 *   - hideSidebar      : auth pages
 *   - immersive        : hide everything; pure content
 *
 * Compose modal trigger, mobile drawer state, and user menu state live HERE
 * so that any descendant can call the same handlers via the simple props
 * passed down.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import RightSidebar from './RightSidebar.jsx';
import Footer from './Footer.jsx';
import MobileNav from './MobileNav.jsx';
import { bsdcLockScroll } from '../../scripts/interactions.js';
import { IconClose, IconLogout, IconUser, IconSettings, IconShield } from '../common/Icons.jsx';
import { logout } from '../../firebase/auth.js';
import { useChatList, useLiveCounters } from '../../hooks/useRealtime.js';
import { useUnreadNotifications } from '../../hooks/useNotifications.js';

/**
 * @param {Object}   props
 * @param {React.ReactNode} props.children
 * @param {Object}   [props.currentUser]
 * @param {Object}   [props.rightSidebarData] - { trendingTags, suggestedUsers, liveCounters }
 * @param {number}   [props.unreadNotifs]
 * @param {number}   [props.unreadChats]
 * @param {Function} [props.onOpenCompose]    - if omitted, uses internal placeholder
 * @param {Boolean}  [props.hideRightSidebar]
 * @param {Boolean}  [props.hideSidebar]
 * @param {Boolean}  [props.hideFooter]
 * @param {Boolean}  [props.immersive]
 */
export default function Layout({
  children,
  currentUser = null,
  rightSidebarData = {},
  unreadNotifs = 0,
  unreadChats = 0,
  onOpenCompose,
  hideRightSidebar = false,
  hideSidebar = false,
  hideFooter = false,
  immersive = false
}) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Live unread counts for badges.
  const liveUnreadNotifs = useUnreadNotifications(currentUser?.uid);
  const effectiveUnreadNotifs = unreadNotifs || liveUnreadNotifs;

  // Subscribe to my chats for the unread badge in the header / mobile nav.
  const { chats } = useChatList(currentUser?.uid);
  const computedUnreadChats = useMemo(() => {
    if (!chats || !currentUser) return 0;
    return chats.filter((c) => {
      const lm = c.lastMessage;
      return lm && lm.senderId !== currentUser.uid;
    }).length;
  }, [chats, currentUser]);
  const effectiveUnreadChats = unreadChats || computedUnreadChats;

  // Live community counters for the right sidebar.
  const liveCounters = useLiveCounters();
  const effectiveRightData = useMemo(() => ({
    ...rightSidebarData,
    liveCounters: rightSidebarData.liveCounters || liveCounters
  }), [rightSidebarData, liveCounters]);

  // Close drawer / menus automatically when navigating between routes.
  useEffect(() => {
    setDrawerOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    bsdcLockScroll(drawerOpen);
    return () => bsdcLockScroll(false);
  }, [drawerOpen]);

  /** Open compose — pages can override; default just logs. */
  const handleOpenCompose = useCallback(() => {
    if (onOpenCompose) onOpenCompose();
    else {
      // eslint-disable-next-line no-console
      console.info('[BSDC] Compose modal handler not wired yet (Response 4).');
    }
  }, [onOpenCompose]);

  // Immersive pages skip the whole shell.
  if (immersive) {
    return <main className="bsdc-app">{children}</main>;
  }

  return (
    <div className="bsdc-app">
      <Header
        currentUser={currentUser}
        unreadNotifs={effectiveUnreadNotifs}
        unreadChats={effectiveUnreadChats}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenCompose={handleOpenCompose}
        onOpenUserMenu={() => setUserMenuOpen((v) => !v)}
      />

      <div className="bsdc-shell">
        {!hideSidebar && (
          <div className="bsdc-shell__sidebar">
            <Sidebar currentUser={currentUser} />
          </div>
        )}

        <div className="bsdc-shell__main">
          <div className="bsdc-content bsdc-page-enter">
            {children}
          </div>
        </div>

        {!hideRightSidebar && (
          <div className="bsdc-shell__right">
            <RightSidebar
              currentUser={currentUser}
              trendingTags={effectiveRightData.trendingTags || []}
              suggestedUsers={effectiveRightData.suggestedUsers || []}
              liveCounters={effectiveRightData.liveCounters || null}
            />
          </div>
        )}
      </div>

      {!hideFooter && <Footer />}

      <MobileNav
        currentUser={currentUser}
        unreadNotifs={effectiveUnreadNotifs}
        onOpenCompose={handleOpenCompose}
      />

      {/* Mobile drawer (left sidebar overlay) */}
      {drawerOpen && (
        <>
          <div
            className="bsdc-drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="bsdc-drawer" role="dialog" aria-label="Navigation menu">
            <div className="bsdc-flex bsdc-justify-between bsdc-items-center bsdc-mb-md">
              <Link to="/" className="bsdc-header__brand" onClick={() => setDrawerOpen(false)}>
                <span className="bsdc-header__brand-logo" aria-hidden="true">BD</span>
                BSDC
              </Link>
              <button
                type="button"
                className="bsdc-icon-btn"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <IconClose />
              </button>
            </div>
            <Sidebar
              currentUser={currentUser}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </>
      )}

      {/* User menu dropdown */}
      {userMenuOpen && currentUser && (
        <>
          <div
            className="bsdc-drawer-backdrop"
            onClick={() => setUserMenuOpen(false)}
            style={{ background: 'transparent' }}
            aria-hidden="true"
          />
          <div
            className="bsdc-card bsdc-card--raised"
            style={{
              position: 'fixed',
              top: 'calc(var(--nav-height) + 6px)',
              right: 'var(--space-md)',
              minWidth: 240,
              zIndex: 902,
              padding: 'var(--space-sm) 0',
              animation: 'bsdcFadeIn 140ms ease both'
            }}
            role="menu"
          >
            <div className="bsdc-p-md bsdc-flex bsdc-items-center bsdc-gap-sm">
              <span className="bsdc-avatar">
                {currentUser.photoURL
                  ? <img src={currentUser.photoURL} alt="" />
                  : (currentUser.displayName || currentUser.username || 'B').slice(0,1).toUpperCase()}
              </span>
              <div>
                <div className="bsdc-text-bold">{currentUser.displayName || currentUser.username}</div>
                <div className="bsdc-text-xs bsdc-text-muted">@{currentUser.username}</div>
              </div>
            </div>
            <div className="bsdc-dropdown__divider" />
            <Link to={`/p/${currentUser.username}`} className="bsdc-dropdown__item" role="menuitem">
              <IconUser size={18} /> My Profile
            </Link>
            <Link to="/settings" className="bsdc-dropdown__item" role="menuitem">
              <IconSettings size={18} /> Settings
            </Link>
            {currentUser.isAdmin && (
              <Link to="/admin" className="bsdc-dropdown__item" role="menuitem">
                <IconShield size={18} /> Admin Panel
              </Link>
            )}
            <div className="bsdc-dropdown__divider" />
            <button
              type="button"
              className="bsdc-dropdown__item"
              role="menuitem"
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }}
            >
              <IconLogout size={18} /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
