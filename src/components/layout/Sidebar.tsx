import { NavLink } from 'react-router-dom';
import { SVGIcon, type SVGIconName } from '@components/ui/SVGIcon';

/** Main sidebar item model for platform-wide navigation. */
interface SidebarItem {
  readonly to: string;
  readonly label: string;
  readonly icon: SVGIconName;
}

/** Production sidebar links point to real routes without demo counters. */
const SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { to: '/feed', label: 'Feed', icon: 'feed' },
  { to: '/explore', label: 'Explore', icon: 'compass' },
  { to: '/communities', label: 'Communities', icon: 'community' },
  { to: '/messenger', label: 'Messenger', icon: 'message' },
  { to: '/points/wallet', label: 'BSDC Wallet', icon: 'wallet' },
  { to: '/courses', label: 'Courses', icon: 'database' },
  { to: '/settings/account', label: 'Settings', icon: 'settings' }
];

/** Left sidebar for tablet and desktop layouts. */
export const Sidebar = () => (
  <aside className="layout-sidebar" aria-label="Section navigation">
    <nav className="sidebar-nav">
      {SIDEBAR_ITEMS.map((item) => (
        <NavLink className="sidebar-link" to={item.to} key={item.to}>
          <SVGIcon name={item.icon} width={21} height={21} decorative />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);
