import { PostCreator } from '@components/posts/PostCreator';
import { SEOHead } from '@components/seo/SEOHead';

/** Protected post creation page for all supported post types. */
export const CreatePostPage = () => (
  <>
    <SEOHead title="Create post" canonicalPath="/create/text" noIndex />
    <PostCreator />
  </>
);
