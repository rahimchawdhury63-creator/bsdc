/**
 * src/pages/Privacy.jsx — /privacy
 */
import React from 'react';
import SEOHead from '../components/seo/SEOHead.jsx';
import BreadcrumbSEO from '../components/seo/BreadcrumbSEO.jsx';

export default function Privacy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="How BSDC collects, uses, and protects your information."
        canonical="/privacy"
      />
      <BreadcrumbSEO items={[{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy' }]} />
      <div className="bsdc-card bsdc-prose">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account:</strong> email, display name, username (Firebase Auth).</li>
          <li><strong>Profile:</strong> any optional fields you add (bio, skills, social links, location).</li>
          <li><strong>Content:</strong> the posts, comments, messages, and reactions you create.</li>
          <li><strong>Images / videos:</strong> media you upload is hosted on ImgBB and Cloudinary.</li>
          <li><strong>Push subscription:</strong> OneSignal player ID (only if you opt in).</li>
          <li><strong>Verification documents:</strong> only the BSDC moderation team can view them.</li>
        </ul>

        <h2>What we don't do</h2>
        <ul>
          <li>We don't sell your data to advertisers.</li>
          <li>We don't track you across other websites.</li>
        </ul>

        <h2>Your rights</h2>
        <p>You can edit or delete any of your content at any time. Account deletion is available from <strong>Settings → Danger zone</strong>.</p>
      </div>
    </>
  );
}
