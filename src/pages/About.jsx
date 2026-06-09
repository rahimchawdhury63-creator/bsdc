/**
 * src/pages/About.jsx — /about
 */
import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead.jsx';
import BreadcrumbSEO from '../components/seo/BreadcrumbSEO.jsx';
import { IconLightning, IconGithub } from '../components/common/Icons.jsx';

export default function About() {
  return (
    <>
      <SEOHead
        title="About BSDC"
        description="Bangladesh Software Development Community (BSDC) — the open platform built for Bangladeshi developers and students to learn, share, and grow together."
        canonical="/about"
        ogType="website"
      />
      <BreadcrumbSEO items={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]} />
      <div className="bsdc-card bsdc-prose">
        <div className="bsdc-flex bsdc-items-center bsdc-gap-md bsdc-mb-md">
          <span className="bsdc-bootstrap__icon" style={{ width: 56, height: 56, marginBottom: 0 }}>
            <IconLightning size={28} color="#1a6b3a" />
          </span>
          <h1 style={{ margin: 0 }}>About BSDC</h1>
        </div>

        <p>
          <strong>Bangladesh Software Development Community (BSDC)</strong> is an open
          community platform built by Bangladeshi developers, for Bangladeshi developers
          and students. We combine the best of dev.to, Reddit, Quora, Telegram, and
          LinkedIn — tailored for the local ecosystem.
        </p>

        <h2>What you can do here</h2>
        <ul>
          <li>Share code, projects, and long-form articles.</li>
          <li>Ask questions in 14 different post formats — Q&amp;A, polls, events, jobs, wikis.</li>
          <li>Earn <Link to="/points">BSDC Points</Link> and rise through Bronze → Legend ranks.</li>
          <li>Join <Link to="/communities">topic communities</Link> or broadcast on <Link to="/channels">channels</Link>.</li>
          <li>Earn an official <Link to="/courses">BSDC certificate</Link> after passing our exam.</li>
        </ul>

        <h2 id="contact">Contact</h2>
        <p>
          Found a bug or want to help? Open an issue on{' '}
          <a href="https://github.com/rahimchawdhury63-creator/bsdc" target="_blank" rel="noopener noreferrer">
            <IconGithub size={14} /> our GitHub repository
          </a>.
        </p>
      </div>
    </>
  );
}
