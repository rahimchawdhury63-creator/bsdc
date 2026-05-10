import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const FounderSVG = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="60" fill="var(--green-bg)"/>
    <circle cx="60" cy="48" r="22" fill="var(--green)" opacity="0.9"/>
    <ellipse cx="60" cy="95" rx="34" ry="22" fill="var(--green)" opacity="0.7"/>
    <circle cx="60" cy="48" r="18" fill="#004d38"/>
    <text x="60" y="55" textAnchor="middle" fontFamily="Inter" fontSize="20" fontWeight="900" fill="white">RR</text>
  </svg>
);

const MissionItems = [
  { icon: '🎯', title: 'Our Mission', desc: 'To build the largest and most helpful Bangla + English software development knowledge base for Bangladeshi developers worldwide.' },
  { icon: '🌏', title: 'Our Vision', desc: 'A Bangladesh where every aspiring developer has free access to world-class technical resources in their native language.' },
  { icon: '💡', title: 'Our Values', desc: 'Open knowledge sharing, mutual respect, community-first thinking, and the belief that technology can transform Bangladesh.' },
];

export default function AboutPage() {
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Rizwan Rahim Chowdhury',
    jobTitle: 'Founder & Lead Developer',
    worksFor: {
      '@type': 'Organization',
      name: 'Bangladesh Software Development Community',
      url: 'https://www.bsdc.info.bd',
    },
    url: 'https://www.bsdc.info.bd/about',
    nationality: 'Bangladeshi',
    knowsAbout: ['Software Development', 'Web Development', 'Community Building', 'Bangladesh Tech'],
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bangladesh Software Development Community',
    alternateName: 'BSDC',
    url: 'https://www.bsdc.info.bd',
    foundingDate: '2026',
    founder: {
      '@type': 'Person',
      name: 'Rizwan Rahim Chowdhury',
    },
    description: 'Bangladesh\'s premier software development community platform',
    address: { '@type': 'PostalAddress', addressCountry: 'BD' },
    areaServed: 'Bangladesh',
    knowsAbout: ['Software Development', 'Web Development', 'Mobile Development', 'AI/ML'],
  };

  return (
    <>
      <Helmet>
        <title>About BSDC | Bangladesh Software Development Community — Founder Rizwan Rahim Chowdhury</title>
        <meta name="description" content="BSDC (Bangladesh Software Development Community) was founded by Rizwan Rahim Chowdhury in 2026. Learn about our mission to empower Bangladeshi developers with free, world-class technical resources in Bangla and English." />
        <meta name="keywords" content="BSDC founder, Rizwan Rahim Chowdhury, Bangladesh software community, about BSDC, developer community Bangladesh, tech community BD, বাংলাদেশ ডেভেলপার কমিউনিটি প্রতিষ্ঠাতা" />
        <link rel="canonical" href="https://www.bsdc.info.bd/about" />
        <script type="application/ld+json">{JSON.stringify(personJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
      </Helmet>

      <main role="main">
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--dark) 0%, var(--green-dark) 100%)',
          padding: '64px 16px', textAlign: 'center', color: 'var(--white)',
        }} aria-label="About BSDC header">
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <span className="badge badge-green" style={{ marginBottom: 16, display: 'inline-block' }}>
              About BSDC
            </span>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 16 }}>
              Bangladesh Software Development Community
            </h1>
            <p style={{ color: '#CBD5E1', fontSize: '1rem', lineHeight: 1.7 }}>
              বাংলাদেশের সফটওয়্যার ডেভেলপারদের জন্য একটি উন্মুক্ত, সহযোগিতামূলক প্ল্যাটফর্ম।
              Founded with a mission to democratize tech education in Bangladesh.
            </p>
          </div>
        </section>

        <div className="container-sm" style={{ padding: '48px 16px' }}>

          {/* Founder */}
          <article
            style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-2)', overflow: 'hidden',
              boxShadow: 'var(--shadow-md)', marginBottom: 32,
            }}
            itemScope itemType="https://schema.org/Person"
            aria-label="Founder information"
          >
            <div style={{ background: 'linear-gradient(135deg, var(--green-bg), var(--white))', padding: '32px 32px 0', textAlign: 'center' }}>
              <FounderSVG />
              <meta itemProp="image" content="https://www.bsdc.info.bd/founder.jpg" />
            </div>
            <div style={{ padding: '24px 32px 32px' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 4 }} itemProp="name">
                  Rizwan Rahim Chowdhury
                </h2>
                <p style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.9rem' }} itemProp="jobTitle">
                  Founder &amp; Lead Developer, BSDC
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} itemProp="nationality">
                  🇧🇩 Bangladesh
                </p>
              </div>

              <div className="article-content" itemProp="description">
                <p>
                  <strong>Rizwan Rahim Chowdhury</strong> is a passionate Bangladeshi software developer and community builder
                  who founded BSDC in 2026 with a single, powerful vision: <em>to create a world-class software development
                  community rooted in Bangladesh</em>.
                </p>
                <p>
                  রিজওয়ান রহিম চৌধুরী বিশ্বাস করেন যে বাংলাদেশের প্রতিটি ডেভেলপার, চাই সে ঢাকায় থাকুক বা সিলেটে,
                  বিশ্বমানের প্রযুক্তি শিক্ষার অধিকার রাখেন। এই বিশ্বাস থেকেই জন্ম নিয়েছে BSDC।
                </p>
                <p>
                  As the Lead Developer of BSDC, Rizwan has architected the entire platform — from the Firebase backend
                  to the React frontend — ensuring it remains 100% free and accessible to every Bangladeshi developer,
                  regardless of their background or experience level.
                </p>
                <blockquote>
                  "প্রযুক্তি কোনো সীমানা মানে না। আমি চাই বাংলাদেশের ডেভেলপাররা বিশ্বের যেকোনো ডেভেলপারের সমকক্ষ হোক।
                  BSDC সেই স্বপ্নের প্রথম পদক্ষেপ।" — Rizwan Rahim Chowdhury
                </blockquote>
              </div>
            </div>
          </article>

          {/* Mission/Vision/Values */}
          <section aria-label="Mission, Vision, and Values" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 20, textAlign: 'center' }}>
              Our Mission, Vision &amp; Values
            </h2>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {MissionItems.map(item => (
                <div key={item.title} className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="20" fill="var(--green-bg)"/>
                        <text x="20" y="26" textAnchor="middle" fontSize="20">{item.icon}</text>
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 8 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          <section
            style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-2)', padding: 28, marginBottom: 32 }}
            aria-label="BSDC Technology Stack"
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 16 }}>
              Built With Modern Technology
            </h2>
            <div className="article-content">
              <p>
                BSDC is built with a modern, 100% free tech stack — designed for performance, security, and scale:
              </p>
              <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                <li><strong>Frontend:</strong> React 18 + Vite — Lightning fast, component-driven UI</li>
                <li><strong>Hosting:</strong> Cloudflare Pages — Global CDN, zero cost, 99.99% uptime</li>
                <li><strong>Database:</strong> Firebase Firestore — Real-time NoSQL database</li>
                <li><strong>Authentication:</strong> Firebase Auth — Google, GitHub, Yahoo, Email sign-in</li>
                <li><strong>Image Hosting:</strong> ImgBB API — Free, reliable image storage</li>
                <li><strong>Push Notifications:</strong> OneSignal — Real-time community updates</li>
                <li><strong>Search:</strong> Fuse.js — Client-side intelligent fuzzy search</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 12 }}>
              আমাদের সাথে যোগ দিন
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.95rem' }}>
              Join 8,000+ Bangladeshi developers already on BSDC
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Join BSDC Free</Link>
              <Link to="/" className="btn btn-outline btn-lg">Explore Community</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
