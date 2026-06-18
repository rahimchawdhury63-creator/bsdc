import { SITE_NAME } from '@config/constants';

/** Site footer with platform identity and static deployment note. */
export const Footer = () => (
  <footer className="footer">
    <div className="container footer__inner">
      <p>{SITE_NAME} is a Firebase-powered PWA for Bangladesh's developer community.</p>
      <p className="text-small">Cloudflare Pages static frontend with Firebase Functions for SEO endpoints.</p>
    </div>
  </footer>
);
