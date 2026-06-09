/**
 * src/components/layout/Footer.jsx
 * ---------------------------------------------------------------------------
 * SEO-rich footer. Important for:
 *   - Internal linking depth (helps Google crawl deeper pages)
 *   - Trust signals (privacy, terms, contact)
 *   - Brand reinforcement on every page
 *
 * Rendered by Layout.jsx at the bottom of every standard page (omitted
 * on chat / admin / immersive views).
 * ---------------------------------------------------------------------------
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  IconGithub, IconLinkedin, IconTwitter, IconLightning, IconMapPin
} from '../common/Icons.jsx';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bsdc-footer" role="contentinfo">
      <div className="bsdc-footer__inner">
        <div className="bsdc-footer__grid">

          {/* Brand column */}
          <div>
            <div className="bsdc-footer__brand">
              <span className="bsdc-header__brand-logo" aria-hidden="true">
                <IconLightning size={20} color="#fff" />
              </span>
              Bangladesh Software Development Community
            </div>
            <p className="bsdc-footer__about">
              The home for Bangladeshi developers, students, and tech enthusiasts.
              Share code, ask questions, find jobs, and earn an official BSDC
              certificate — all in one place.
            </p>
            <div className="bsdc-footer__social" aria-label="BSDC social links">
              <a
                href="https://github.com/rahimchawdhury63-creator/bsdc"
                className="bsdc-icon-btn"
                aria-label="BSDC on GitHub"
                rel="noopener noreferrer"
                target="_blank"
              >
                <IconGithub />
              </a>
              <a href="#" className="bsdc-icon-btn" aria-label="BSDC on LinkedIn">
                <IconLinkedin />
              </a>
              <a href="#" className="bsdc-icon-btn" aria-label="BSDC on X/Twitter">
                <IconTwitter />
              </a>
            </div>
            <div className="bsdc-flex bsdc-items-center bsdc-gap-xs bsdc-mt-sm bsdc-text-xs bsdc-text-muted">
              <IconMapPin size={14} /> Made with care in Bangladesh
            </div>
          </div>

          {/* Discover */}
          <nav aria-label="Discover">
            <div className="bsdc-footer__col-title">Discover</div>
            <Link to="/explore" className="bsdc-footer__link">Explore</Link>
            <Link to="/communities" className="bsdc-footer__link">Communities</Link>
            <Link to="/channels" className="bsdc-footer__link">Channels</Link>
            <Link to="/leaderboard" className="bsdc-footer__link">Leaderboard</Link>
            <Link to="/tags" className="bsdc-footer__link">Trending Tags</Link>
          </nav>

          {/* Learn */}
          <nav aria-label="Learn">
            <div className="bsdc-footer__col-title">Learn & Earn</div>
            <Link to="/courses" className="bsdc-footer__link">Courses</Link>
            <Link to="/jobs" className="bsdc-footer__link">Job Board</Link>
            <Link to="/points" className="bsdc-footer__link">BSDC Points</Link>
            <Link to="/dev-id" className="bsdc-footer__link">Developer ID</Link>
            <Link to="/wiki" className="bsdc-footer__link">Wiki</Link>
          </nav>

          {/* Company / Legal */}
          <nav aria-label="Company">
            <div className="bsdc-footer__col-title">Company</div>
            <Link to="/about" className="bsdc-footer__link">About BSDC</Link>
            <Link to="/privacy" className="bsdc-footer__link">Privacy Policy</Link>
            <Link to="/terms" className="bsdc-footer__link">Terms of Service</Link>
            <a href="/rss.xml" className="bsdc-footer__link" rel="alternate">RSS Feed</a>
            <a href="/sitemap.xml" className="bsdc-footer__link">Sitemap</a>
          </nav>
        </div>

        <div className="bsdc-footer__bottom">
          <span>© {year} Bangladesh Software Development Community. All rights reserved.</span>
          <span>
            <a href="https://www.bsdc.info.bd" className="bsdc-footer__link" style={{ display: 'inline' }}>
              www.bsdc.info.bd
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
