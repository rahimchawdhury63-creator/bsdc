/**
 * src/pages/NotFound.jsx — 404 page (real one, SEO-clean).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead.jsx';
import { IconLightning, IconHome, IconSearch } from '../components/common/Icons.jsx';

export default function NotFound() {
  return (
    <>
      <SEOHead
        title="Page not found"
        description="The page you tried to reach doesn't exist on BSDC."
        canonical={typeof window !== 'undefined' ? window.location.pathname : '/'}
        noindex
      />
      <div className="bsdc-empty">
        <div className="bsdc-empty__icon"><IconLightning /></div>
        <div className="bsdc-empty__title">404 · Page not found</div>
        <div className="bsdc-empty__body">The link may be broken or the post may have been removed.</div>
        <div className="bsdc-flex bsdc-gap-sm bsdc-justify-center bsdc-mt-md">
          <Link to="/" className="bsdc-btn bsdc-btn--primary"><IconHome size={14} /> Go home</Link>
          <Link to="/search" className="bsdc-btn bsdc-btn--outline"><IconSearch size={14} /> Search</Link>
        </div>
      </div>
    </>
  );
}
