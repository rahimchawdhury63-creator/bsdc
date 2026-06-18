import { Link, NavLink } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { SVGIcon } from '@components/ui/SVGIcon';
import { SITE_NAME, SITE_SHORT_NAME } from '@config/constants';
import { useAuth } from '@/hooks/useAuth';

/** Top navigation bar with auth-aware actions and SVG-only icons. */
export const Navbar = () => {
  const { isAuthenticated, profile, signOut } = useAuth();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink className="brand-link" to="/" aria-label={`${SITE_NAME} home`}>
          <SVGIcon className="brand-link__mark" name="bsdc-logo" title={`${SITE_SHORT_NAME} logo`} />
          <span className="brand-link__text">{SITE_SHORT_NAME}</span>
        </NavLink>
        <nav className="site-nav" aria-label="Primary navigation">
          <ul className="nav-list">
            <li><NavLink className="nav-link" to="/">Home</NavLink></li>
            <li><NavLink className="nav-link" to="/feed">Feed</NavLink></li>
            <li><NavLink className="nav-link" to="/explore">Explore</NavLink></li>
            <li><NavLink className="nav-link" to="/search">Search</NavLink></li>
          </ul>
        </nav>
        <div className="nav-auth-actions">
          {isAuthenticated ? (
            <>
              <Link className="nav-icon-link" to="/notifications" aria-label="Notifications"><SVGIcon name="bell" width={20} height={20} decorative /></Link>
              <Link className="nav-icon-link" to="/messenger" aria-label="Messenger"><SVGIcon name="message" width={20} height={20} decorative /></Link>
              <Link className="nav-link" to={profile?.username ? `/p/${profile.username}` : '/settings/account'}>{profile?.displayName || 'Account'}</Link>
              <Button type="button" variant="secondary" className="button--compact" icon="logout" onClick={() => void signOut()}>Sign out</Button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="button button--primary button--compact" to="/register">Join</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
