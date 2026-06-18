import { Link } from 'react-router-dom';
import { SVGIcon } from '@components/ui/SVGIcon';

/** Right sidebar with operational platform shortcuts and no fake suggestions. */
export const RightSidebar = () => (
  <aside className="layout-rightbar" aria-label="Platform shortcuts">
    <section className="rightbar-card">
      <SVGIcon name="shield" width={28} height={28} title="Production platform" />
      <h2>BSDC live platform</h2>
      <p className="text-muted">Feeds, stories, and auth connect to Firebase. Lists appear when real community data exists.</p>
    </section>
    <section className="rightbar-card">
      <h2>Quick actions</h2>
      <div className="rightbar-actions">
        <Link to="/create/text" className="sidebar-link"><SVGIcon name="plus" width={20} height={20} decorative /> Create post</Link>
        <Link to="/verification/apply" className="sidebar-link"><SVGIcon name="shield" width={20} height={20} decorative /> Apply verification</Link>
      </div>
    </section>
  </aside>
);
