import { SEOHead } from '@components/seo/SEOHead';
import type { BSDCPost } from '@/types';

/** Per-post SEO wrapper using stored Firestore SEO fields. */
export const PostSEO = ({ post }: { readonly post: BSDCPost }) => (
  <SEOHead title={post.seoTitle || post.title} description={post.seoDescription || post.excerpt} canonicalPath={`/post/${post.id}`} image={post.imageUrls[0]} />
);
