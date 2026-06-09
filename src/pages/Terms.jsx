/**
 * src/pages/Terms.jsx — /terms
 */
import React from 'react';
import SEOHead from '../components/seo/SEOHead.jsx';
import BreadcrumbSEO from '../components/seo/BreadcrumbSEO.jsx';

export default function Terms() {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="The rules everyone agrees to when using BSDC — Bangladesh Software Development Community."
        canonical="/terms"
      />
      <BreadcrumbSEO items={[{ name: 'Home', url: '/' }, { name: 'Terms', url: '/terms' }]} />
      <div className="bsdc-card bsdc-prose">
        <h1>Terms of Service</h1>
        <p>By using BSDC you agree to:</p>
        <ul>
          <li>Be respectful — no harassment, hate speech, or doxxing.</li>
          <li>Don't post content that infringes copyright or violates Bangladeshi law.</li>
          <li>Don't spam, scrape, or attempt to circumvent our anti-abuse systems.</li>
          <li>Don't impersonate others. Verified accounts must use real identity proof.</li>
        </ul>
        <h2>Content ownership</h2>
        <p>You own what you post. By publishing on BSDC you grant us a worldwide, non-exclusive licence to display and distribute it on the platform.</p>
        <h2>Account termination</h2>
        <p>We may suspend accounts that violate these terms. You can leave any time from Settings.</p>
      </div>
    </>
  );
}
