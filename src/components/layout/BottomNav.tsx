import { NavLink } from 'react-router-dom';
import { SVGIcon, type SVGIconName } from '@components/ui/SVGIcon';

/** Mobile bottom navigation item model. */
interface BottomNavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: SVGIconName;
}

/** Compact mobile navigation for one-handed use. */
const ITEMS: readonly BottomNavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/feed', label: 'Feed', icon: 'feed' },
  { to: '/explore', label: 'Explore', icon: 'compass' },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/settings/account', label: 'Account', icon: 'user' }
];

/** Bottom navigation visible on mobile widths. */
export const BottomNav = () => (
  <nav className="bottom-nav" aria-label="Mobile navigation">
    {ITEMS.map((item) => (
      <NavLink className="bottom-nav__link" to={item.to} key={item.to}>
        <SVGIcon name={item.icon} width={21} height={21} decorative />
        <span>{item.label}</span>
      </NavLink>
    ))}
  </nav>
);
