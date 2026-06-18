import { FeedContainer } from '@components/feed/FeedContainer';
import { SEOHead } from '@components/seo/SEOHead';

/** Main feed page powered by real Firestore public posts. */
export const Feed = () => (
  <>
    <SEOHead title="Feed" canonicalPath="/feed" />
    <FeedContainer initialFeedType="for-you" showStories />
  </>
);
