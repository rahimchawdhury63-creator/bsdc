import { NavLink } from 'react-router-dom';

/** Admin panel section navigation. */
export const AdminNav = () => {
  const items = ['dashboard','users','posts','communities','verifications','monetization','ads','analytics','notifications','broadcast','points','courses','navigation','settings','reports','bulk-export'];
  return <nav className="admin-nav" aria-label="Admin navigation">{items.map((item) => <NavLink className="sidebar-link" to={item === 'dashboard' ? '/admin' : `/admin/${item}`} key={item}>{item.replace('-', ' ')}</NavLink>)}</nav>;
};
