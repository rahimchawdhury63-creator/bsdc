/**
 * src/pages/JobBoard.jsx
 * /jobs — feed filtered to job posts.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import useFeed from '../hooks/useFeed.js';
import SEOHead from '../components/seo/SEOHead.jsx';
import BreadcrumbSEO from '../components/seo/BreadcrumbSEO.jsx';
import FeedContainer from '../components/feed/FeedContainer.jsx';
import { IconBriefcase } from '../components/common/Icons.jsx';

export default function JobBoard() {
  const { profile } = useAuth();
  const feed = useFeed({ mode: 'trending', viewer: profile, filterType: 'job' });

  return (
    <>
      <SEOHead
        title="Developer Jobs in Bangladesh"
        description="Browse the latest software development jobs posted by Bangladeshi companies and global remote-friendly teams on BSDC."
        canonical="/jobs"
        keywords={['developer jobs bangladesh', 'remote jobs', 'react jobs dhaka', 'software engineer bangladesh']}
      />
      <BreadcrumbSEO items={[{ name: 'Home', url: '/' }, { name: 'Jobs', url: '/jobs' }]} />

      <h1 style={{ margin: 0, fontSize: '1.4rem' }}><IconBriefcase size={20} /> Developer Jobs</h1>
      <p className="bsdc-text-muted bsdc-text-sm">Latest software jobs from Bangladesh and remote-friendly global teams.</p>

      <div className="bsdc-mt-md">
        <FeedContainer
          {...feed}
          currentUser={profile}
          emptyTitle="No jobs posted yet"
          emptyBody="Hiring? Use the post composer to publish a job — it auto-emits a JobPosting schema for Google Jobs."
        />
      </div>
    </>
  );
}
