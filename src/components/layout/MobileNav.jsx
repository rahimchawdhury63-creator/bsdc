/**
 * src/components/layout/MobileNav.jsx
 * ---------------------------------------------------------------------------
 * Fixed bottom navigation for mobile (<768px). Hidden on tablet+.
 *
 * 5 slots is the magic number — fewer feels empty, more feels cramped.
 * Center slot is the "create post" action (most-used by active users).
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconHome, IconExplore, IconPlus, IconBell, IconUser } from '../common/Icons.jsx';

/**
 * @param {Object}   props
 * @param {Object}   props.currentUser
 * @param {number}   [props.unreadNotifs]
 * @param {Function} props.onOpenCompose
 */
export default function MobileNav({ currentUser, unreadNotifs = 0, onOpenCompose = () => {} }) {
  return (
    <nav className="bsdc-mobile-nav" aria-label="Mobile bottom navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `bsdc-mobile-nav__link${isActive ? ' bsdc-mobile-nav__link--active' : ''}`
        }
        aria-label="Home"
      >
        <IconHome size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `bsdc-mobile-nav__link${isActive ? ' bsdc-mobile-nav__link--active' : ''}`
        }
        aria-label="Explore"
      >
        <IconExplore size={22} />
        <span>Explore</span>
      </NavLink>

      {/* Center "create" — distinctive primary color */}
      <button
        type="button"
        className="bsdc-mobile-nav__link"
        onClick={onOpenCompose}
        aria-label="Create new post"
      >
        <span
          style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'var(--color-primary)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <IconPlus size={20} />
        </span>
      </button>

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `bsdc-mobile-nav__link${isActive ? ' bsdc-mobile-nav__link--active' : ''}`
        }
        aria-label={`Notifications${unreadNotifs ? ` (${unreadNotifs} unread)` : ''}`}
        style={{ position: 'relative' }}
      >
        <IconBell size={22} />
        {unreadNotifs > 0 && (
          <span
            className="bsdc-count-badge"
            style={{ top: 0, right: '22%' }}
            aria-hidden="true"
          >
            {unreadNotifs > 9 ? '9+' : unreadNotifs}
          </span>
        )}
        <span>Alerts</span>
      </NavLink>

      <NavLink
        to={currentUser ? `/p/${currentUser.username}` : '/login'}
        className={({ isActive }) =>
          `bsdc-mobile-nav__link${isActive ? ' bsdc-mobile-nav__link--active' : ''}`
        }
        aria-label="My profile"
      >
        {currentUser && currentUser.photoURL ? (
          <span className="bsdc-avatar bsdc-avatar--xs">
            <img src={currentUser.photoURL} alt="" loading="lazy" />
          </span>
        ) : (
          <IconUser size={22} />
        )}
        <span>{currentUser ? 'Me' : 'Sign in'}</span>
      </NavLink>
    </nav>
  );
}
