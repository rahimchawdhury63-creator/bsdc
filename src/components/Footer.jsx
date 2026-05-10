import React from 'react';
import { Link } from 'react-router-dom';

const BSDCLogoSVG = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="8" fill="#006A4E"/>
    <text x="4" y="26" fontFamily="Inter,sans-serif" fontSize="18" fontWeight="900" fill="white">BS</text>
    <rect x="0" y="30" width="36" height="6" rx="0" fill="#004d38"/>
    <text x="3" y="35" fontFamily="Inter,sans-serif" fontSize="7" fontWeight="700" fill="#6EE7B7" letterSpacing="1">DC.BD</text>
  </svg>
);

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <BSDCLogoSVG />
            <span className="footer-brand-name">BSDC</span>
          </div>
          <p className="footer-brand-desc">
            Bangladesh Software Development Community (BSDC) — বাংলাদেশের সেরা সফটওয়্যার ডেভেলপমেন্ট কমিউনিটি।
            Join thousands of Bangladeshi developers sharing knowledge, building projects, and growing together.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ color: '#94A3B8' }}>
              <GithubIcon />
            </a>
          </div>
        </div>

        <div>
          <p className="footer-heading">Explore</p>
          <nav className="footer-links" aria-label="Explore links">
            <Link to="/">Home</Link>
            <Link to="/post">Q&amp;A Forum</Link>
            <Link to="/wiki">Wiki</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/about">About BSDC</Link>
          </nav>
        </div>

        <div>
          <p className="footer-heading">Content</p>
          <nav className="footer-links" aria-label="Content links">
            <Link to="/post?type=snippet">Code Snippets</Link>
            <Link to="/post?type=project">Projects</Link>
            <Link to="/create">Create Post</Link>
            <Link to="/post?type=blog">Latest Blogs</Link>
          </nav>
        </div>

        <div>
          <p className="footer-heading">Community</p>
          <nav className="footer-links" aria-label="Community links">
            <Link to="/register">Join BSDC</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/about">Our Mission</Link>
            <a href="mailto:hello@bsdc.info.bd">Contact Us</a>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="footer-bottom">
          <span>
            © {year} <a href="https://www.bsdc.info.bd">Bangladesh Software Development Community</a>.
            Founded by <Link to="/about" style={{ color: '#6EE7B7' }}>Rizwan Rahim Chowdhury</Link>.
          </span>
          <span style={{ fontSize: '0.78rem', color: '#475569' }}>
            🇧🇩 Made with pride in Bangladesh · Hosted on Cloudflare Pages
          </span>
        </div>
      </div>
    </footer>
  );
}
