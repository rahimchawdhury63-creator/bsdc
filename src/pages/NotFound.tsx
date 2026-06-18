import { Link } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';
import { SVGIcon } from '@components/ui/SVGIcon';

/** Accessible production 404 route for unknown Cloudflare Pages deep links. */
export const NotFound = () => (
  <main className="section" id="main-content">
    <SEOHead title="Page not found" canonicalPath="/404" noIndex />
    <div className="container fabric-stack">
      <SVGIcon name="search" width={48} height={48} title="Not found" />
      <h1>Page not found</h1>
      <p className="text-lead">The requested BSDC page does not exist or may require a future feature response.</p>
      <Link className="button button--primary" to="/">Return home</Link>
    </div>
  </main>
);
