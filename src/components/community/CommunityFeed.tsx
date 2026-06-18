import { FeedContainer } from '@components/feed/FeedContainer';

/** Community feed foundation using shared feed container. */
export const CommunityFeed = () => <FeedContainer initialFeedType="community" showStories={false} />;
