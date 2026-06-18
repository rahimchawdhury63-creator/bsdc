import { Link } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';
import { JsonLdSchema } from '@components/seo/JsonLdSchema';
import { SVGIcon } from '@components/ui/SVGIcon';
import { GITHUB_REPOSITORY_URL, SITE_NAME, SITE_SHORT_NAME, SITE_URL } from '@config/constants';

/** Homepage feature card model used for production static capability highlights. */
interface HomeFeature {
  readonly icon: 'database' | 'shield' | 'bolt';
  readonly title: string;
  readonly description: string;
}

/** Static platform capability descriptions; these are product descriptions, not demo data. */
const FEATURES: readonly HomeFeature[] = [
  { icon: 'database', title: 'Real Firebase backend', description: 'Firestore, Realtime Database, Authentication, and Cloud Functions power production data flows.' },
  { icon: 'shield', title: 'SEO-first architecture', description: 'Default metadata, JSON-LD, crawler functions, sitemap, RSS, and canonical URLs are designed from day one.' },
  { icon: 'bolt', title: 'Advanced installable PWA', description: 'Offline fallback, cache strategy, push notification workers, and responsive design support every device class.' }
];

/**
 * Production homepage shell for Response 1.
 * Later responses attach live feed, authentication, post creation, and community
 * systems without replacing this SEO-safe landing foundation.
 */
export const Home = () => (
  <>
    <SEOHead title="Bangladesh Software Development Community" canonicalPath="/" />
    <JsonLdSchema
      id="bsdc-home-organization"
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        alternateName: SITE_SHORT_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.svg`,
        sameAs: [GITHUB_REPOSITORY_URL]
      }}
    />
    <section className="hero" aria-labelledby="home-title">
      <div className="container hero__grid">
        <div className="animate-fade-up">
          <p className="hero__eyebrow"><SVGIcon name="shield" width={18} height={18} decorative /> Bangladesh developer platform</p>
          <h1 className="hero__title" id="home-title">Bangladesh Software Development Community</h1>
          <p className="hero__text text-lead">BSDC is a Firebase-powered, SEO-optimized, installable community platform for Bangladeshi developers, students, creators, job seekers, and technology leaders.</p>
          <div className="hero__actions" aria-label="Primary actions">
            <Link className="button button--primary" to="/feed"><SVGIcon name="feed" width={20} height={20} decorative /> Open feed</Link>
            <Link className="button button--secondary" to="/search"><SVGIcon name="search" width={20} height={20} decorative /> Search BSDC</Link>
          </div>
        </div>
        <aside className="status-card animate-fade-up" aria-label="Platform foundation status">
          {FEATURES.map((feature) => (
            <div className="status-card__row" key={feature.title}>
              <SVGIcon className="status-card__icon" name={feature.icon} title={feature.title} />
              <div>
                <h2 className="text-small">{feature.title}</h2>
                <p className="text-small">{feature.description}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
    <section className="section" aria-labelledby="foundation-title">
      <div className="container">
        <h2 id="foundation-title">Production foundation</h2>
        <p className="text-lead">This first build establishes strict TypeScript, Firebase configuration, SEO metadata, PWA assets, external CSS architecture, SVG-only icons, Cloudflare Pages headers, and mobile-first responsiveness from 250px upward.</p>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <SVGIcon className="feature-card__icon" name={feature.icon} title={feature.title} />
              <h3>{feature.title}</h3>
              <p className="text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  </>
);
