/**
 * src/components/layout/Sidebar.jsx
 * ---------------------------------------------------------------------------
 * Left navigation sidebar — visible from tablet (icons-only) and laptop+
 * (icons + labels). On mobile this same component renders inside the
 * mobile drawer (see Layout.jsx).
 *
 * Navigation map is data-driven so adding/removing items is one-line.
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconHome, IconExplore, IconUsers, IconBookOpen, IconBriefcase,
  IconTrending, IconBookmark, IconCoin, IconAward, IconHash, IconShield,
  IconSettings, IconLogin, IconUser
} from '../common/Icons.jsx';

/**
 * Primary nav items shown to all users.
 * Edit this array to add/remove sidebar links.
 */
const PRIMARY = [
  { to: '/',             label: 'Home',         Icon: IconHome },
  { to: '/explore',      label: 'Explore',      Icon: IconExplore },
  { to: '/communities',  label: 'Communities',  Icon: IconUsers },
  { to: '/channels',     label: 'Channels',     Icon: IconHash },
  { to: '/courses',      label: 'Courses',      Icon: IconBookOpen },
  { to: '/jobs',         label: 'Job Board',    Icon: IconBriefcase },
  { to: '/leaderboard',  label: 'Leaderboard',  Icon: IconTrending }
];

/** Items shown only when signed in. */
const AUTH_ONLY = [
  { to: '/bookmarks', label: 'Bookmarks',  Icon: IconBookmark },
  { to: '/points',    label: 'BSDC Points', Icon: IconCoin },
  { to: '/dev-id',    label: 'Dev ID Card', Icon: IconAward }
];

/**
 * @param {Object} props
 * @param {Object} props.currentUser - signed-in user document (or null)
 * @param {Function} [props.onNavigate] - callback after clicking a link (used to close drawer)
 */
export default function Sidebar({ currentUser, onNavigate }) {
  return (
    <aside className="bsdc-sidebar" aria-label="Primary navigation">
      <div className="bsdc-sidebar__group-label">Discover</div>
      {PRIMARY.map(({ to, label, Icon }) => (
        <SidebarLink key={to} to={to} label={label} Icon={Icon} onClick={onNavigate} />
      ))}

      {currentUser && (
        <>
          <div className="bsdc-sidebar__divider" />
          <div className="bsdc-sidebar__group-label">You</div>
          {AUTH_ONLY.map(({ to, label, Icon }) => (
            <SidebarLink key={to} to={to} label={label} Icon={Icon} onClick={onNavigate} />
          ))}
          <SidebarLink
            to={`/p/${currentUser.username}`}
            label="My Profile"
            Icon={IconUser}
            onClick={onNavigate}
          />
          {currentUser.isAdmin && (
            <SidebarLink to="/admin" label="Admin Panel" Icon={IconShield} onClick={onNavigate} />
          )}
          <SidebarLink to="/settings" label="Settings" Icon={IconSettings} onClick={onNavigate} />
        </>
      )}

      {!currentUser && (
        <>
          <div className="bsdc-sidebar__divider" />
          <SidebarLink to="/login" label="Sign in" Icon={IconLogin} onClick={onNavigate} />
        </>
      )}
    </aside>
  );
}

/**
 * Internal link component — handles the "active" styling via NavLink
 * (router gives us isActive automatically).
 */
function SidebarLink({ to, label, Icon, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `bsdc-sidebar__link${isActive ? ' bsdc-sidebar__link--active' : ''}`
      }
      aria-label={label}
    >
      <Icon size={22} />
      <span className="bsdc-sidebar__link-text">{label}</span>
    </NavLink>
  );
}
