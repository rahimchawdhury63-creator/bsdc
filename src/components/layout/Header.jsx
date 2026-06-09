/**
 * src/components/layout/Header.jsx
 * ---------------------------------------------------------------------------
 * Top navigation bar — fixed at top, always visible.
 *
 * Responsibilities:
 *   - Brand / logo (left)
 *   - Global search bar (center on tablet+; trigger icon on mobile)
 *   - Action icons (notifications, messages, post composer, user menu)
 *   - Mobile menu hamburger to open the left drawer
 *
 * Note: search input is intentionally lightweight here — full SearchBar
 * with suggestions arrives in Response 5.
 * ---------------------------------------------------------------------------
 */

import React, { useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  IconMenu, IconSearch, IconBell, IconMessage, IconPlus,
  IconHome, IconLightning
} from '../common/Icons.jsx';
import SearchBar from '../search/SearchBar.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';

/**
 * @param {Object}  props
 * @param {Object}  props.currentUser   - signed-in user document (or null)
 * @param {number}  props.unreadNotifs  - notification badge count
 * @param {number}  props.unreadChats   - chat badge count
 * @param {Function} props.onOpenDrawer - opens the mobile left drawer
 * @param {Function} props.onOpenCompose - opens the post composer modal
 * @param {Function} props.onOpenUserMenu - opens the user dropdown
 */
export default function Header({
  currentUser,
  unreadNotifs = 0,
  unreadChats = 0,
  onOpenDrawer = () => {},
  onOpenCompose = () => {},
  onOpenUserMenu = () => {}
}) {
  const navigate = useNavigate();
  const location = useLocation();

  /** Mobile search icon — opens the dedicated /search page. */
  const handleMobileSearchClick = useCallback(() => navigate('/search'), [navigate]);

  return (
    <header className="bsdc-header" role="banner">
      <div className="bsdc-header__inner">
        {/* Mobile hamburger — visible only when sidebar is hidden (<768px) */}
        <button
          type="button"
          className="bsdc-icon-btn bsdc-hide-mobile"
          aria-label="Open menu"
          onClick={onOpenDrawer}
          style={{ display: 'none' }}
        >
          <IconMenu />
        </button>
        <button
          type="button"
          className="bsdc-icon-btn bsdc-hide-desktop"
          aria-label="Open menu"
          onClick={onOpenDrawer}
        >
          <IconMenu />
        </button>

        {/* Brand */}
        <Link to="/" className="bsdc-header__brand" aria-label="BSDC home">
          <span className="bsdc-header__brand-logo" aria-hidden="true">
            <IconLightning size={20} color="#fff" />
          </span>
          <span className="bsdc-header__brand-text">BSDC</span>
        </Link>

        {/* Desktop / tablet search with live suggestions */}
        <div className="bsdc-header__search">
          <SearchBar />
        </div>

        {/* Action area */}
        <div className="bsdc-header__actions">
          {/* Mobile-only search trigger */}
          <button
            type="button"
            className="bsdc-icon-btn bsdc-header__search-trigger"
            aria-label="Search"
            onClick={handleMobileSearchClick}
          >
            <IconSearch />
          </button>

          {/* Home shortcut (desktop only) */}
          <Link
            to="/"
            className={`bsdc-icon-btn bsdc-hide-mobile ${location.pathname === '/' ? 'bsdc-icon-btn--active' : ''}`}
            aria-label="Home"
          >
            <IconHome />
          </Link>

          {currentUser ? (
            <>
              {/* New post */}
              <button
                type="button"
                className="bsdc-icon-btn"
                aria-label="Create new post"
                onClick={onOpenCompose}
              >
                <IconPlus />
              </button>

              {/* Messages */}
              <Link
                to="/messages"
                className="bsdc-icon-btn"
                aria-label={`Messages${unreadChats ? ` (${unreadChats} unread)` : ''}`}
              >
                <IconMessage />
                {unreadChats > 0 && (
                  <span className="bsdc-count-badge" aria-hidden="true">
                    {unreadChats > 99 ? '99+' : unreadChats}
                  </span>
                )}
              </Link>

              {/* Notifications — bell with live dropdown */}
              <NotificationBell />

              {/* User avatar trigger */}
              <button
                type="button"
                className="bsdc-header__user-trigger"
                aria-label="Open user menu"
                onClick={onOpenUserMenu}
              >
                <span className="bsdc-avatar bsdc-avatar--sm" aria-hidden="true">
                  {currentUser.photoURL
                    ? <img src={currentUser.photoURL} alt="" loading="lazy" />
                    : initialsOf(currentUser.displayName || currentUser.username)}
                </span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bsdc-btn bsdc-btn--ghost bsdc-btn--sm bsdc-hide-mobile">
                Sign in
              </Link>
              <Link to="/register" className="bsdc-btn bsdc-btn--primary bsdc-btn--sm">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Extract up to 2 initials from a name for avatar fallback. */
function initialsOf(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'BD';
}
