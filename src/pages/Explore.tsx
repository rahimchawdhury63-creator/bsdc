import { FeedContainer } from '@components/feed/FeedContainer';
import { SEOHead } from '@components/seo/SEOHead';

/** Explore page focused on trending and discovery feed ranking. */
export const Explore = () => (
  <>
    <SEOHead title="Explore" canonicalPath="/explore" />
    <FeedContainer initialFeedType="trending" showStories={false} />
  </>
);
