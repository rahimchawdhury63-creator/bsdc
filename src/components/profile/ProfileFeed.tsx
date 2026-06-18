import { FeedContainer } from '@components/feed/FeedContainer';

/** Profile feed placeholder using the shared feed container until author filters are expanded. */
export const ProfileFeed = () => <FeedContainer initialFeedType="discover" showStories={false} />;
