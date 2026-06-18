import { PostCard } from './PostCard';
import type { BSDCPost } from '@/types';

/** Thin feed item wrapper reserved for ads, reposts, and analytics impressions. */
export const FeedItem = ({ post }: { readonly post: BSDCPost }) => <PostCard post={post} />;
